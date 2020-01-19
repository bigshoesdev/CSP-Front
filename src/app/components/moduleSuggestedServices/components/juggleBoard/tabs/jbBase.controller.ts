import {Therapist} from '../../../../../model/rest/Therapist';
import {ConcreteCalendarEvent} from '../../../../../model/rest/ConcreteCalendarEvent';
import {RoomBookedTime} from '../../../../../model/rest/RoomBookedTime';
import {ApiSuggestedServicesService} from '../../../../../services/api/api-suggested-services.service';
import {Collection} from '../../../../../model/Collection';
import {AvailabilityTherapistDayRecord} from '../../../../../model/rest/AvailabilityTherapistDayRecord';
import {ApiCalendarEventsService} from '../../../../../services/api/api-calendar-events.service';
import {Utils} from '../../../../../services/utils.service';
import {Session} from '../../../../../model/rest/Session';
import {EntityDependencyService} from '../../../../../services/entity-dependency.service';
import {Service} from '../../../../../model/rest/Service';
import {Room} from '../../../../../model/rest/Room';
import {Restriction} from '../../../../../model/rest/Restriction';
import {IJbDropDialogInput, IJbDropDialogResult} from '../../../services/jbDialog.service';
import {ServiceCategory} from '../../../../../model/rest/ServiceCategory';
import {PreliminaryEvent} from '../../../../../model/rest/PreliminaryEvent';
import {SessionSsClientData} from '../../../../../model/rest/SessionSsClientData';
import {JuggleBoardService} from '../../../services/juggleBoard.service';
import {ApiAvailabilityTherapistService} from '../../../../../services/api/api-availability-therapist.service';
import {JuggleBoardController} from '../juggleBoard.controller';
import {Client} from '../../../../../model/rest/Client';

export abstract class JbBaseController {

    protected concreteCalendarEvents = [];
    protected therapist2DayRecordsMap: Collection<AvailabilityTherapistDayRecord[]> = {};
    protected bookedTimes = [];

    abstract applyClientData();

    constructor(public $scope,
                public Utils: Utils,
                public _,
                public JuggleBoardService: JuggleBoardService,
                public ApiSuggestedServicesService: ApiSuggestedServicesService,
                public ApiCalendarEventsService: ApiCalendarEventsService,
                public ApiAvailabilityTherapistService: ApiAvailabilityTherapistService,
                public $q: any,
                public $mdDialog,
                public JbDialogService,
                public EntityDependencyService: EntityDependencyService) {
    }

    protected updateTimeInfo(dateFrom: string, dateTo: string, tableTherapists: Therapist[]) {
        const $scope = this.$scope;

        return this.$q.all([this.getConcreteCalendarEvents(dateFrom, dateTo)])
            .then(() => {
                const session = $scope.JuggleBoardController.session;
                if (session) {
                    return this.getRoomsBookedTime(dateFrom, dateTo, session.id);
                }
            })
            .then(() => this.getTherapistsAvailability(dateFrom, dateTo, tableTherapists));

    }


    protected getConcreteCalendarEvents(dateStart: string, dateEnd: string) {
        return this.ApiCalendarEventsService.getConcreteForAllCalendarEvents(dateStart, dateEnd)
            .then((concreteCalendarEvents: ConcreteCalendarEvent[]) => {
                this.concreteCalendarEvents = concreteCalendarEvents;
                return concreteCalendarEvents;
            });
    }

    protected getTherapistsAvailability(dateFrom: string, dateTo: string, tableTherapists: Therapist[]) {
        const therapistIds = tableTherapists.map((therapist: Therapist) => therapist.id);

        const promisesMap = therapistIds.reduce((promisesMap, therapistId) => {
            promisesMap[therapistId] = this.ApiAvailabilityTherapistService.getAvailabilityTherapist(therapistId, dateFrom, dateTo);
            return promisesMap;
        }, {});

        return this.$q.all(promisesMap)
            .then((therapist2DayRecordsMap: Collection<AvailabilityTherapistDayRecord[]>) => {// therapistId -> AvailabilityTherapistDayRecord[]
                this.therapist2DayRecordsMap = therapist2DayRecordsMap;
                return therapist2DayRecordsMap;
            });
    }


    protected getRoomsBookedTime(dateFrom: string, dateTo: string, sessionId: number): Promise<RoomBookedTime[]> {

        return this.$q.all([this.ApiSuggestedServicesService.getRoomBookedTimeForSession(sessionId, dateFrom, dateTo)])
            .then((bookedTimes: any) => {
                this.bookedTimes = bookedTimes;
                return bookedTimes;
            });
    }

    protected validateAndSaveDroppedItem(item: PreliminaryEvent): void {

        this.validateDropAction(item).then(() => {

            const JuggleBoardController: JuggleBoardController = this.$scope.JuggleBoardController;
            const clientDataArr: SessionSsClientData[] = JuggleBoardController.clientDataArr;
            const client: Client = JuggleBoardController.client;
            const clientId = client
                ? client.id
                : this.JuggleBoardService.findClientIdByDataItem(clientDataArr, item);

            if (clientId < 0) {
                return;
            }

            const session: Session = JuggleBoardController.session;
            if (!session) {
                return;
            }
            const sessionId = session && session.id;

            this.ApiSuggestedServicesService.putClientServiceDataItem(sessionId, clientId, item.service.id, item)
                .then(() => {
                    this.JuggleBoardService.findAndUpdateDataItem(item, clientDataArr);
                    this.applyClientData();
                }, () => {
                    this.applyClientData();
                });
        }, () => {
            this.applyClientData();
        });
    }

    protected validateDropAction(item: PreliminaryEvent): Promise<PreliminaryEvent> {
        const $scope = this.$scope;
        const _ = this._;
        const $q = this.$q;
        const EntityDependencyService: EntityDependencyService = this.EntityDependencyService;
        const JbDialogService = this.JbDialogService;

        const JuggleBoardController: JuggleBoardController = $scope.JuggleBoardController;
        const allServices: Service[] = JuggleBoardController.services;
        const session: Session = JuggleBoardController.session;
        const sessionTherapists: Therapist[] = session.therapists;
        const allRooms: Room[] = JuggleBoardController.rooms;
        const allRestrictions: Restriction[] = JuggleBoardController.restrictions;
        const allCategories: ServiceCategory[] = JuggleBoardController.categories;

        const itemService: Service = item.service;
        const itemTherapistId = item.therapist && item.therapist.id;
        const itemRoomId = item.room && item.room.id;

        const therapistsForService: Therapist[] = this.EntityDependencyService.filterTherapistsByService(sessionTherapists, itemService.id);
        if (therapistsForService.length === 0) {
            this.showAlert(`There is no therapist in the session (${session.name}) who can do the service (${itemService.name})`);
            return $q.reject(false);
        }
        const foundTherapist: Therapist = _.find(therapistsForService, (t: Therapist) => t.id == itemTherapistId);

        const roomsForService: Room[] = EntityDependencyService.getRoomsAvailableForService(itemService.id, allRestrictions, allCategories, allRooms);
        const foundRoom: Room = _.find(roomsForService, (r: Room) => r.id === itemRoomId);

        const changeTherapist: boolean = !foundTherapist;
        const changeRoom: boolean = !foundRoom;
        if (changeTherapist || changeRoom) {

            const dialogArgs: IJbDropDialogInput = {
                changeTherapist: changeTherapist,
                therapists: therapistsForService,
                therapistNote: changeTherapist
                    ? `The therapist (${item.therapist.name}) does not support the service (${itemService.name}). Please chose another.`
                    : '',
                changeRoom: changeRoom,
                rooms: roomsForService,
                roomNote: changeRoom
                    ? `The room (${item.room.name}) is no suitable for the service (${itemService.name}). Please chose another.`
                    : '',
            };
            return JbDialogService.changeTherapistAndRoom(dialogArgs)
                .then((result: IJbDropDialogResult) => {
                    if (changeTherapist && result.therapist) {
                        item.therapist = result.therapist;
                    }
                    if (changeRoom && result.room) {
                        item.room = result.room;
                    }
                    return item;
                }, () => {
                    return $q.reject(false);
                });
        }

        return $q(resolveFn => resolveFn(item));
    }

    private showAlert(message) {
        this.$mdDialog.show(
            this.$mdDialog.alert()
                .clickOutsideToClose(true)
                .title('Change Canceled')
                .textContent(message)
                .ariaLabel('Change Canceled')
                .ok('Got it!')
        );
    }

}
