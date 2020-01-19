import {Moment} from '../../../../../../../../bower_components/moment/moment';
import {dateFormat} from '../../../../../../services/app.constant';
import {JtCell, JtRow, JtTable} from '../../../../directives/jbTable/jbTable.directive';
import {ITablePosition, JuggleBoardService} from '../../../../services/juggleBoard.service';
import {JbBaseController} from '../jbBase.controller';
import {Room} from '../../../../../../model/rest/Room';
import {Entity} from '../../../../../../model/Entity';
import {Therapist} from '../../../../../../model/rest/Therapist';
import {PreliminaryEvent} from '../../../../../../model/rest/PreliminaryEvent';
import {SessionSsClientData} from '../../../../../../model/rest/SessionSsClientData';
import {JbRowType} from '../../../../../../model/JbRowType';
import {ApiSuggestedServicesService} from '../../../../../../services/api/api-suggested-services.service';
import {EntityDependencyService} from '../../../../../../services/entity-dependency.service';
import {ApiCalendarEventsService} from '../../../../../../services/api/api-calendar-events.service';
import {Utils} from '../../../../../../services/utils.service';
import {ApiAvailabilityTherapistService} from '../../../../../../services/api/api-availability-therapist.service';
import {CalendarService} from '../../../../../../services/calendar.service';
import {JuggleBoardController} from '../../juggleBoard.controller';
import {ServiceOrCategory} from '../../../../../../model/ServiceOrCategory';

export abstract class JbDatesController extends JbBaseController {

    public abstract initForm(): void;

    public abstract applySession(): void;

    public abstract onFromDateChange(date): void;

    public abstract onToDateChange(date): void;

    public abstract getColumnDateFormat(): string;

    private tableDates: string[] = [];
    private tableRooms: Room[] = [];
    private tableTherapists: Therapist[] = [];

    constructor(public $scope,
                public LocalStorageService,
                public Utils: Utils,
                public moment,
                public $timeout: ng.ITimeoutService,
                public _,
                public JuggleBoardService: JuggleBoardService,
                public ApiSuggestedServicesService: ApiSuggestedServicesService,
                public ApiCalendarEventsService: ApiCalendarEventsService,
                public ApiAvailabilityTherapistService: ApiAvailabilityTherapistService,
                public $q: any,
                public $mdDialog,
                public JbDialogService,
                public CalendarService: CalendarService,
                public EntityDependencyService: EntityDependencyService) {

        super($scope, Utils, _, JuggleBoardService, ApiSuggestedServicesService, ApiCalendarEventsService, ApiAvailabilityTherapistService,
            $q, $mdDialog, JbDialogService, EntityDependencyService);

        const JuggleBoardController: JuggleBoardController = $scope.JuggleBoardController;

        $scope.juggleTable = {
            columns: [],
            rows: [],
        } as JtTable;


        this.initForm();
        this.applySession();
        this._updateTimeInfo().then(() => {
            return this.applyClientData();
        });

        $scope.onFromDateChange = (date) => {
            this.onFromDateChange(date);
            this._updateTimeInfo().then(() => {
                return this.applyClientData();
            });
        };
        $scope.onToDateChange = (date) => {
            this.onToDateChange(date);
            this._updateTimeInfo().then(() => {
                return this.applyClientData();
            });
        };

        $scope.$watch('JuggleBoardController.session', (session, prevSession) => {
            if (!session || session.id === (prevSession && prevSession.id)) {
                return;
            }

            this._updateTimeInfo()
                 .then(() => this.applySession())
                 .then( () => this.applyClientData()
            );
        });
        $scope.$watch('JuggleBoardController.clientDataArr', (clientDataArr) => {
            this._updateTimeInfo().then(() => {
                return this.applyClientData();
            });
        });
        $scope.$watch('JuggleBoardController.selectedServiceOrCategoryList', (selectedServiceOrCategoryList: ServiceOrCategory[]) => {
            this._updateTimeInfo().then(() => {
                return this.applyClientData();
            });
        });
        $scope.$watch('rowType', (rowType) => {
            this._updateTimeInfo().then(() => {
                return this.applyClientData();
            });
        });

        $scope.onDropPostProcess = (item: PreliminaryEvent) => {
            const tabPos: ITablePosition = JuggleBoardService.findJtTablePosition($scope.juggleTable, item);
            if (tabPos.columnId < 0 || tabPos.rowId < 0) {
                return;
            }

            this.sortTableCell($scope.juggleTable, tabPos);

            item.date = this.tableDates[tabPos.columnId];

            if ($scope.rowType === JbRowType.rooms) {
                item.room = this.tableRooms[tabPos.rowId];
            } else {
                item.therapist = this.tableTherapists[tabPos.rowId];
            }

            this.validateAndSaveDroppedItem(item);
        };

        $scope.showItem = (item: PreliminaryEvent): string[] => {
            const serviceName: string = item.service.name;
            const clientName: string = item.client.name;
            const label = ($scope.rowType === JbRowType.therapists)
                ? ('room:' + item.room.name)
                : ('therapist: ' + item.therapist.name);

            return [serviceName, clientName, label];
        };

    }

    private sortTableCell(table: JtTable, tabPos: ITablePosition) {
        const rowId = tabPos.rowId;
        if (rowId >= table.rows.length) { return; }
        const row: JtRow = table.rows[rowId];

        const columnId = tabPos.columnId;
        if (columnId >= row.cells.length) { return; }
        const cell: JtCell = row.cells[columnId];

        cell.listItems.sort((a: PreliminaryEvent, b: PreliminaryEvent) => {
            // 1) filter by client name
            const aClientName = this.getClientName(a);
            const bClientName = this.getClientName(b);
            if (aClientName > bClientName) { return 1; } else if (aClientName < bClientName) { return -1; } else {
                // 2) filter by service name
                const aServiceName = this.getServiceName(a);
                const bServiceName = this.getServiceName(b);
                if (aServiceName > bServiceName) { return 1; } else if (aServiceName < bServiceName) { return -1; } else {
                    if (this.$scope.rowType === JbRowType.rooms) {
                        // 3) filter by therapist name
                        const aTherapistName = this.getTherapistName(a);
                        const bTherapistName = this.getTherapistName(b);
                        if (aTherapistName > bTherapistName) { return 1; } else if (aTherapistName < bTherapistName) { return -1; } else { return 0; }
                    } else {
                        // 3) filter by room name
                        const aTherapistName = this.getRoomName(a);
                        const bTherapistName = this.getRoomName(b);
                        if (aTherapistName > bTherapistName) { return 1; } else if (aTherapistName < bTherapistName) { return -1; } else { return 0; }
                    }
                }
            }

        });

    }

    private getClientName(item: PreliminaryEvent) {
        const JuggleBoardController: JuggleBoardController = this.$scope.JuggleBoardController;
        const clientId = this.JuggleBoardService.findClientIdByDataItem(JuggleBoardController.clientDataArr, item);
        return this.findNameById(JuggleBoardController.clients, clientId);
    }

    private getServiceName(item: PreliminaryEvent) {
        return  item.service && item.service.name;
    }

    private getTherapistName(item: PreliminaryEvent) {
        return item.therapist && item.therapist.name;
    }

    private getRoomName(item: PreliminaryEvent) {
        return item.room && item.room.name;
    }

    private findNameById(entities: Entity[], id: number): string {
        const entity: Entity = this._.find(entities, (e) => e.id === id);
        return entity && entity.name || '';
    }

    public applyClientData() {
        const $scope = this.$scope;
        const CalendarService: CalendarService = this.CalendarService;
        const moment = this.moment;
        const EntityDependencyService: EntityDependencyService = this.EntityDependencyService;
        const rowType: JbRowType = $scope.rowType;
        const JuggleBoardController: JuggleBoardController = $scope.JuggleBoardController;
        const session = JuggleBoardController.session;
        if (!session) {
            return;
        }

        const dates: string[] = [];
        const columns: string[] = [];
        const _columnDatesFormat = this.getColumnDateFormat();
        CalendarService.iterateMomentRange(moment($scope.fromDate), moment($scope.toDate), (theMoment: Moment): boolean => {
            dates.push(theMoment.format(dateFormat));
            columns.push(theMoment.format(_columnDatesFormat));
            return true;
        });

        this.tableDates = dates;
        const selectedServiceOrCategoryList: ServiceOrCategory[] = JuggleBoardController.selectedServiceOrCategoryList;
        this.tableRooms = EntityDependencyService.filteredRoomsByServicesAndCategoriesRestrictions(JuggleBoardController.rooms, selectedServiceOrCategoryList, JuggleBoardController.restrictions);
        this.tableTherapists = EntityDependencyService.filteredTherapistsByServiceAndCategories(session.therapists, selectedServiceOrCategoryList);

        let rows: JtRow[];
        if (rowType === JbRowType.rooms) {
            rows = this.tableRooms.map((room: Room) => this.entity2rowMapper(room));
        } else {
            rows = this.tableTherapists.map((therapist: Therapist) => this.entity2rowMapper(therapist));
        }

        const _juggleTable: JtTable = {
            columns: columns,
            rows: rows,
        };
        return $scope.juggleTable = _juggleTable;
    }

    private entity2rowMapper(rowEntity: Entity): JtRow {
        const JuggleBoardController: JuggleBoardController = this.$scope.JuggleBoardController;

        return {
            rowName: rowEntity.name,
            cells: this.tableDates.map((date: string): JtCell => {
                const listItems = this.collectServices(JuggleBoardController.clientDataArr, this.$scope.rowType, rowEntity, date);
                let therapistId, roomId;

                if (this.$scope.rowType === JbRowType.rooms) {
                    roomId = rowEntity.id;
                    therapistId = -1;
                } else {
                    roomId = -1;
                    therapistId = rowEntity.id;
                }

                const subHeader = this.JuggleBoardService.calculateSubHeader(
                    this.concreteCalendarEvents,
                    this.therapist2DayRecordsMap,
                    this.bookedTimes,
                    listItems, JuggleBoardController.services,
                    therapistId, roomId, date,
                );

                return {
                    subHeader: subHeader,
                    listItems: listItems,
                };
            }),
        };
    }

    private collectServices(clientDataArr: SessionSsClientData[],
                            rowType: JbRowType,
                            rowEntity: Entity, /*therapist or room*/
                            date: string): PreliminaryEvent[] {
        let predicate;

        if (rowType === JbRowType.rooms) {
            const roomId = rowEntity.id;
            predicate = (dataItem: PreliminaryEvent): boolean => {
                const dataItemRoomId = dataItem.room && dataItem.room.id;
                return dataItemRoomId === roomId
                    && dataItem.date === date;
            };
        } else {
            const therapistId = rowEntity.id;
            predicate = (dataItem: PreliminaryEvent): boolean => {
                const dataItemTherapistId = dataItem.therapist && dataItem.therapist.id;
                return dataItemTherapistId === therapistId
                    && dataItem.date === date;
            };
        }

        return clientDataArr.reduce((res: PreliminaryEvent[], item: SessionSsClientData): PreliminaryEvent[] => {
            return item.services.reduce((res: PreliminaryEvent[], dataItem: PreliminaryEvent): PreliminaryEvent[] => {
                if (predicate(dataItem)) {
                    res.push(dataItem);
                }
                return res;
            }, res);
        }, []);
    }

    private _updateTimeInfo() {
        const $scope = this.$scope;
        const Utils: Utils = this.Utils;

        if (!($scope.fromDate && $scope.toDate)) {
            return this.$q.reject();
        }

        const dateFrom = Utils.dateToFormat($scope.fromDate);
        const dateTo = Utils.dateToFormat($scope.toDate);

        return this.updateTimeInfo(dateFrom, dateTo, this.tableTherapists);
    }

}

