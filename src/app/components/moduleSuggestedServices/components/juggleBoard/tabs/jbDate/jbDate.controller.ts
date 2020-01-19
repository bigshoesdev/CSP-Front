import {JtCell, JtRow, JtTable} from '../../../../directives/jbTable/jbTable.directive';
import {ITablePosition, JuggleBoardService} from '../../../../services/juggleBoard.service';
import {JbBaseController} from '../jbBase.controller';
import {LocalStorageService} from '../../../../../../services/storage/local-storage.service';
import {Room} from '../../../../../../model/rest/Room';
import {Entity} from '../../../../../../model/Entity';
import {Therapist} from '../../../../../../model/rest/Therapist';
import {PreliminaryEvent} from '../../../../../../model/rest/PreliminaryEvent';
import {Session} from '../../../../../../model/rest/Session';
import {SessionSsClientData} from '../../../../../../model/rest/SessionSsClientData';
import {ServiceCategory} from '../../../../../../model/rest/ServiceCategory';
import {Service} from '../../../../../../model/rest/Service';
import {JbRowType} from '../../../../../../model/JbRowType';
import {ApiSuggestedServicesService} from '../../../../../../services/api/api-suggested-services.service';
import {EntityDependencyService} from '../../../../../../services/entity-dependency.service';
import {ApiCalendarEventsService} from '../../../../../../services/api/api-calendar-events.service';
import {Utils} from '../../../../../../services/utils.service';
import {ApiAvailabilityTherapistService} from '../../../../../../services/api/api-availability-therapist.service';
import {JuggleBoardController} from '../../juggleBoard.controller';
import {ServiceOrCategory} from '../../../../../../model/ServiceOrCategory';
import {RestrictionType_Ns} from '../../../../../../model/rest/RestrictionType';
import RestrictionType = RestrictionType_Ns.RestrictionType;

declare let angular: any;

export class JbDateController extends JbBaseController {
    private tableRooms: Room[] = [];
    private tableTherapists: Therapist[] = [];

    /** @ngInject */
    constructor(public $scope,
                public LocalStorageService: LocalStorageService,
                public Utils: Utils,
                public _,
                public $timeout: ng.ITimeoutService,
                public JuggleBoardService: JuggleBoardService,
                public ApiSuggestedServicesService: ApiSuggestedServicesService,
                public ApiCalendarEventsService: ApiCalendarEventsService,
                public ApiAvailabilityTherapistService: ApiAvailabilityTherapistService,
                public $q: any,
                public moment,
                public $mdDialog,
                public JbDialogService,
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
        this._updateTimeInfo().then(() => this.applyClientData());

        $scope.onDateChange = (date) => {
            const dateStr = Utils.dateToFormat(date);
            LocalStorageService.setItem('moduleSuggestedServices.fromDate', dateStr);

            this._updateTimeInfo().then(() => this.applyClientData());
        };

        $scope.$watch('JuggleBoardController.session', (session, prevSession) => {
            if (!session || session.id === (prevSession && prevSession.id)) {
                return;
            }

            this.applySession();
            this._updateTimeInfo().then(() => this.applyClientData());
        });
        $scope.$watch('JuggleBoardController.clientDataArr', (clientDataArr) => {
            this.applyClientData();
        });
        $scope.$watch('JuggleBoardController.selectedServiceOrCategoryList', (selectedServiceOrCategoryList: ServiceOrCategory[]) => {
            this.applyClientData();
        });
        $scope.$watch('rowType', (rowType, prevRowType) => {
            this.applyClientData();
        });

        $scope.onDropPostProcess = (item: PreliminaryEvent) => {
            const tabPos: ITablePosition = JuggleBoardService.findJtTablePosition($scope.juggleTable, item);
            if (tabPos.columnId < 0 || tabPos.rowId < 0) {
                return;
            }

            if ($scope.rowType === JbRowType.rooms) {
                item.therapist = this.tableTherapists[tabPos.columnId];
                item.room = this.tableRooms[tabPos.rowId];
            } else {
                item.room = this.tableRooms[tabPos.columnId];
                item.therapist = this.tableTherapists[tabPos.rowId];
            }

            this.validateAndSaveDroppedItem(item);
        };

        $scope.showItem = (item: PreliminaryEvent): string[] => {
            const serviceName: string = item.service.name;
            const clientName: string = item.client.name;

            return [serviceName, clientName, item.date];
        };

    }

    public initForm() {
        const session: Session = this.$scope.JuggleBoardController.session;

        const dateStr: string = this.LocalStorageService.getItem('moduleSuggestedServices.fromDate') || (session && session.startDate);
        this.$scope.date = this.Utils.initDateFromStr(dateStr) || new Date();
    }

    public applySession() {
        const $scope = this.$scope;
        const session: Session = $scope.JuggleBoardController.session;
        const Utils: Utils = this.Utils;

        if (session) {
            $scope.minDate = Utils.initDateFromStr(session.startDate);
            $scope.maxDate = Utils.initDateFromStr(session.endDate);
        }
    }

    public applyClientData() {
        const $scope = this.$scope;
        const Utils: Utils = this.Utils;
        const EntityDependencyService: EntityDependencyService = this.EntityDependencyService;
        const JuggleBoardController: JuggleBoardController = $scope.JuggleBoardController;
        const session = JuggleBoardController.session;
        if (!session) {
            return;
        }

        const selectedServiceOrCategoryList: ServiceOrCategory[] = JuggleBoardController.selectedServiceOrCategoryList;
        this.tableRooms = EntityDependencyService.filteredRoomsByServicesAndCategoriesRestrictions(JuggleBoardController.rooms, selectedServiceOrCategoryList, JuggleBoardController.restrictions);
        this.tableTherapists = EntityDependencyService.filteredTherapistsByServiceAndCategories(session.therapists, selectedServiceOrCategoryList);

        const date: string = Utils.dateToFormat($scope.date);

        const rowType: JbRowType = $scope.rowType;

        let columns: string[] = [];
        let rows: JtRow[];
        if (rowType === JbRowType.rooms) {
            columns = this.tableTherapists.map((t) => t.name);
            rows = this.tableRooms.map((room: Room): JtRow => {
                const roomId = room.id;
                return {
                    rowName: room.name,
                    cells: this.tableTherapists.map((therapist: Therapist): JtCell => {
                        return this.generateCell(roomId, therapist.id, date);
                    }),
                };
            });
        } else {
            columns = this.tableRooms.map((r) => r.name);
            rows = this.tableTherapists.map((therapist: Therapist): JtRow => {
                const therapistId = therapist.id;
                return {
                    rowName: therapist.name,
                    cells: this.tableRooms.map((room: Room): JtCell => {
                        return this.generateCell(room.id, therapistId, date);
                    }),
                };
            });
        }
        $scope.juggleTable = {
            columns: columns,
            rows: rows,
        } as JtTable;

    }

    private collectFn(roomId: number, therapistId: number, date: string,
                      collection: PreliminaryEvent[], service: PreliminaryEvent): PreliminaryEvent[] {
        const serviceRoomId = service.room && service.room.id;
        const serviceTherapistId = service.therapist && service.therapist.id;

        if (serviceRoomId === roomId &&
            serviceTherapistId === therapistId &&
            service.date === date) {

            const selectedServiceOrCategoryList: ServiceOrCategory[] = this.$scope.JuggleBoardController.selectedServiceOrCategoryList;
            const ifServiceInCategories: boolean = this.ifServiceInFilter(service.service.id, selectedServiceOrCategoryList);
            if (selectedServiceOrCategoryList.length === 0 || ifServiceInCategories) {
                collection.push(service);
            }

        }
        return collection;
    }

    private generateCell(roomId: number, therapistId: number, date: string) {
        const JuggleBoardController: JuggleBoardController = this.$scope.JuggleBoardController;
        const clientDataArr: SessionSsClientData[] = JuggleBoardController.clientDataArr;
        const listItems: PreliminaryEvent[] = this.collectServices(clientDataArr, (collection: PreliminaryEvent[], service: PreliminaryEvent) => {
            return this.collectFn(roomId, therapistId, date, collection, service);
        });

        const subHeader = this.JuggleBoardService.calculateSubHeader(
            this.concreteCalendarEvents,
            this.therapist2DayRecordsMap,
            this.bookedTimes,
            this.sortDataItems(listItems), JuggleBoardController.services,
            therapistId, roomId, date,
        );

        return {
            subHeader: subHeader,
            listItems: listItems,
        };
    }

    private collectServices(clientDataArr: SessionSsClientData[], collectFn: (collection: PreliminaryEvent[], service: PreliminaryEvent) => PreliminaryEvent[]): PreliminaryEvent[] {
        return clientDataArr.reduce((collection: PreliminaryEvent[], clientData: SessionSsClientData) => {
            return clientData.services.reduce(collectFn, collection);
        }, []);
    }

    private ifServiceInFilter(serviceId, serviceOrCategoryList: ServiceOrCategory[]): boolean {
        return serviceOrCategoryList.some((serviceOrCategory: ServiceOrCategory) => {
            if (serviceOrCategory.type === RestrictionType.service) {
                const service: Service = serviceOrCategory.item as Service;
                return service.id === serviceId;
            } else if (serviceOrCategory.type === RestrictionType.category) {
                const category: ServiceCategory = serviceOrCategory.item as ServiceCategory;
                return category.services.some((service: Service) => service.id === serviceId);
            } else {
                return false;
            }
        });
    }

    private sortDataItems(listItems: PreliminaryEvent[]): PreliminaryEvent[] {
        listItems.sort((a: PreliminaryEvent, b: PreliminaryEvent) => {
            // 1) filter by client name
            const aClientName = this.getClientName(a);
            const bClientName = this.getClientName(b);
            if (aClientName > bClientName) { return 1; } else if (aClientName < bClientName) { return -1; } else {
                // 2) filter by service name
                const aServiceName = this.getServiceName(a);
                const bServiceName = this.getServiceName(b);
                if (aServiceName > bServiceName) { return 1; } else if (aServiceName < bServiceName) { return -1; } else { return 0; }
            }
        });

        return listItems;

    }

    private getClientName(item: PreliminaryEvent) {
        return item.client.name;
    }

    private getServiceName(item: PreliminaryEvent) {
        return item.service.name;
    }

    private _updateTimeInfo() {
        const date: Date = this.$scope.date;
        if (!date) {
            return this.$q.reject();
        }

        const dateStr: string = this.Utils.dateToFormat(date);
        return this.updateTimeInfo(dateStr, dateStr, this.tableTherapists);
    }

}
