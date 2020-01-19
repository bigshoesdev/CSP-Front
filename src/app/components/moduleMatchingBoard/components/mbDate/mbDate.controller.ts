import {MbBaseController, MbBgLayoutData} from '../mbBase.controller';
import {IMbRow, MbTable} from '../mbTable/mbTable.directive';
import {IRowCalColumn, IRowCalItem, IRowCalModel} from '../../../../directives/calendarRow/calendarRow.controller';
import {LocalStorageService} from '../../../../services/storage/local-storage.service';
import {Room} from '../../../../model/rest/Room';
import {Entity} from '../../../../model/Entity';
import {Session} from '../../../../model/rest/Session';
import {Therapist} from '../../../../model/rest/Therapist';
import {PreliminaryEvent} from '../../../../model/rest/PreliminaryEvent';
import {ConcreteEvent} from '../../../../model/rest/ConcreteEvent';
import {AvailabilityTherapistDayRecord} from '../../../../model/rest/AvailabilityTherapistDayRecord';
import {JbRowType} from '../../../../model/JbRowType';
import {ApiBookingService} from '../../../../services/api/api-booking.service';
import {Utils} from '../../../../services/utils.service';
import {ApiAvailabilityTherapistService} from '../../../../services/api/api-availability-therapist.service';
import {ApiCalendarEventsService} from '../../../../services/api/api-calendar-events.service';
import {ConcreteCalendarEvent} from '../../../../model/rest/ConcreteCalendarEvent';
import {MatchingBoardService} from '../../services/matchingBoard.service';
import {MatchingBoardController} from '../matchingBoard/matchingBoard.controller';
import {ClientServiceMatchingData} from '../../../../model/rest/ClientServiceMatchingData';
import {Collection} from '../../../../model/Collection';

declare let angular: any;

export class MbDateController extends MbBaseController {

    /** @ngInject */
    constructor(public $scope,
                public LocalStorageService: LocalStorageService,
                public Utils: Utils,
                public moment,
                public $timeout: ng.ITimeoutService,
                public _,
                public ApiAvailabilityTherapistService: ApiAvailabilityTherapistService,
                public ApiBookingService: ApiBookingService,
                public ApiCalendarEventsService: ApiCalendarEventsService,
                public $q: any,
                public $mdDialog,
                public JbDialogService,
                public MatchingBoardService: MatchingBoardService) {

        super(
            $scope,
            LocalStorageService,
            Utils,
            moment,
            $timeout,
            _,
            ApiAvailabilityTherapistService,
            ApiBookingService,
            ApiCalendarEventsService,
            $q,
            $mdDialog,
            JbDialogService);

        $scope.onDateChange = (date) => {
            LocalStorageService.setItem('moduleMatchingBoard.date', Utils.dateToFormat(date));

            const MatchingBoardController: MatchingBoardController = this.$scope.MatchingBoardController;
            this.generateMbTable(MatchingBoardController.matchingEvents, MatchingBoardController.confirmationEvents, this._rowType);
        };

    }

    public initForm() {
    }

    private initDate(session: Session) {
        const $scope = this.$scope;
        if ($scope.date == undefined || $scope.date == null) {

            const dateStr: string = this.LocalStorageService.getItem('moduleMatchingBoard.date') || (session && session.startDate);
            $scope.date = dateStr ? this.Utils.initDateFromStr(dateStr) : new Date();
            if ($scope.date == null) { $scope.date = new Date(); }
        }
    }

    public applySession(session: Session) {
        if (!session) {
            return;
        }
        const $scope = this.$scope;
        const Utils: Utils = this.Utils;

        $scope.minDate = Utils.initDateFromStr(session.startDate);
        $scope.maxDate = Utils.initDateFromStr(session.endDate);

        this.initDate(session);
    }

    public generateMbTable(matchingEvents: PreliminaryEvent[],
                           confirmationEvents: PreliminaryEvent[],
                           rowType): void {
        const date: string = this.Utils.dateToFormat(this.$scope.date);
        if (!date) { return; }

        this.loadBgLayoutData(date, date).then((res: MbBgLayoutData) => {
            this.$scope.mbTableConf = this._generateMbTable(matchingEvents, confirmationEvents, rowType, res);
        });
    }

    private _generateMbTable(matchingEvents: PreliminaryEvent[],
                             confirmationEvents: PreliminaryEvent[],
                             rowType, res: MbBgLayoutData): MbTable {
        const $scope = this.$scope;
        const Utils: Utils = this.Utils;
        const MatchingBoardService: MatchingBoardService = this.MatchingBoardService;
        const MatchingBoardController: MatchingBoardController = this.$scope.MatchingBoardController;

        const tableRooms: Room[] = MatchingBoardController._tableRooms;
        const tableTherapists: Therapist[] = MatchingBoardController._tableTherapists;
        const matchingDataArr: ClientServiceMatchingData[] = MatchingBoardController._matchingDataArr;
        const date: string = Utils.dateToFormat($scope.date);

        let columns: IRowCalColumn[];
        let rows: IMbRow[];

        const allPreliminaryEvent: PreliminaryEvent[] = matchingEvents;

        const therapistId2dayRecords = res.therapistId2dayRecords;
        const concreteEvents: ConcreteEvent[] = res.concreteEvents;
        const concreteCalendarEvents: ConcreteCalendarEvent[] = res.concreteCalendarEvents;
        const confirmationEventsOfTheClient: PreliminaryEvent[] = confirmationEvents;
        const confirmationEventsOfOtherClients: PreliminaryEvent[] = MatchingBoardService.getConfirmationEventsOfOtherClients(matchingDataArr, MatchingBoardController.clientId);

        if (rowType === JbRowType.rooms) {
            columns = tableTherapists.map((e: Entity) => MatchingBoardService.entityToColumnMapper(e));
            const columnKey2Column: Collection<IRowCalColumn> = MatchingBoardService.collectColumns(columns);

            const availabilityBgItems: IRowCalItem[] = this.getAvailabilityBgItemsForRoom(tableTherapists, columns, therapistId2dayRecords, date);

            rows = tableRooms.map((r: Room): IMbRow => {
                const roomId = r.id;

                const concreteBgItems: IRowCalItem[] = MatchingBoardService.createDateBgItemsForRoom(concreteEvents, 'booked', roomId, date, tableTherapists, columnKey2Column);
                const concreteCalendarBgItems: IRowCalItem[] = MatchingBoardService.createDateBgItemsForRoom(concreteCalendarEvents, 'calendar', roomId, date, tableTherapists, columnKey2Column);
                const confirmationTheClientBgItems: IRowCalItem[] = MatchingBoardService.createDateBgItemsForRoom(confirmationEventsOfTheClient, 'confirmation', roomId, date, tableTherapists, columnKey2Column);
                const confirmationOtherClientsBgItems: IRowCalItem[] = MatchingBoardService.createDateBgItemsForRoom(confirmationEventsOfOtherClients, 'confirmation-other', roomId, date, tableTherapists, columnKey2Column);

                return {
                    rowTitle: r.name,
                    rowMeta: r,
                    rowModel: {
                        items: MatchingBoardService.filterDateItemsForRoom(allPreliminaryEvent, roomId, date, tableTherapists),
                        itemsBackground: availabilityBgItems.concat(concreteBgItems, concreteCalendarBgItems, confirmationTheClientBgItems, confirmationOtherClientsBgItems),
                        isReadOnly: false,
                    } as IRowCalModel,
                } as IMbRow;
            });
        } else {
            columns = tableRooms.map((e: Entity): IRowCalColumn => MatchingBoardService.entityToColumnMapper(e));
            const columnKey2Column: Collection<IRowCalColumn> = MatchingBoardService.collectColumns(columns);

            rows = tableTherapists.map((t: Therapist): IMbRow => {
                const therapistId = t.id;

                const availabilityBgItems: IRowCalItem[] = this.getAvailabilityBgItemsForTherapist(therapistId2dayRecords[therapistId], columns, date);

                const concreteBgItems: IRowCalItem[] = MatchingBoardService.createDateBgItemsForTherapist(concreteEvents, 'booked', therapistId, date, tableRooms, columnKey2Column);
                const concreteCalendarBgItems: IRowCalItem[] = MatchingBoardService.createDateBgItemsForTherapist(concreteCalendarEvents, 'calendar', therapistId, date, tableRooms, columnKey2Column);
                const confirmationTheClientBgItems: IRowCalItem[] = MatchingBoardService.createDateBgItemsForTherapist(confirmationEventsOfTheClient, 'confirmation', therapistId, date, tableRooms, columnKey2Column);
                const confirmationOtherClientsBgItems: IRowCalItem[] = MatchingBoardService.createDateBgItemsForTherapist(confirmationEventsOfOtherClients, 'confirmation-other', therapistId, date, tableRooms, columnKey2Column);

                return {
                    rowTitle: t.name,
                    rowMeta: t,
                    rowModel: {
                        items: MatchingBoardService.filterDateItemsForTherapist(allPreliminaryEvent, therapistId, date, tableRooms),
                        itemsBackground: availabilityBgItems.concat(concreteBgItems, concreteCalendarBgItems, confirmationTheClientBgItems, confirmationOtherClientsBgItems),
                        isReadOnly: false,
                    },
                };
            });
        }

        return {
            columns: columns,
            rows: rows,
        };
    }


    private getAvailabilityBgItemsForRoom(tableTherapists: Therapist[],
                                          columns: IRowCalColumn[],
                                          therapistId2dayRecords,
                                          date: string): IRowCalItem[] {
        return tableTherapists.reduce((itemsBackground: IRowCalItem[], therapist: Therapist) => {
            const therapistId = therapist.id;
            const column: IRowCalColumn = this._.find(columns, (column: IRowCalColumn) => column.columnKey === therapistId);

            let bgItems: IRowCalItem[];
            const therapistDayRecords: AvailabilityTherapistDayRecord[] = therapistId2dayRecords[therapistId];
            if (therapistDayRecords) {
                const dayRecords: AvailabilityTherapistDayRecord[] = therapistDayRecords.filter((dayRecord: AvailabilityTherapistDayRecord) => dayRecord.date === date);
                bgItems = this.MatchingBoardService.createUnavailabilityItemsForTherapist(dayRecords);
                bgItems.forEach((bgItem: IRowCalItem) => {
                    bgItem.column = column;
                });
            } else {
                bgItems = [];
            }
            return itemsBackground.concat(bgItems);
        }, []);
    }

    private getAvailabilityBgItemsForTherapist(therapistDayRecords: AvailabilityTherapistDayRecord[],
                                               columns: IRowCalColumn[], date: string): IRowCalItem[] {
        if (!therapistDayRecords) {
            return [];
        }
        const dayRecords: AvailabilityTherapistDayRecord[] = therapistDayRecords
            .filter((dayRecord: AvailabilityTherapistDayRecord) => dayRecord.date === date);

        const bgItemsForRow: IRowCalItem[] = this.MatchingBoardService.createUnavailabilityItemsForTherapist(dayRecords);

        return columns.reduce((itemsBackground: IRowCalItem[], column: IRowCalColumn) => {
            const bgItems = angular.copy(bgItemsForRow);
            bgItems.forEach((bgItem: IRowCalItem) => {
                bgItem.column = column;
            });
            return itemsBackground.concat(bgItems);
        }, []);
    }
}
