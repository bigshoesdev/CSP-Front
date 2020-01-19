import {dateFormat, timeFormat} from '../../app.constant';
import {IDialogConcreteEventConf} from '../dialog.service';
import {Client} from '../../../model/rest/Client';
import {Room} from '../../../model/rest/Room';
import {BaseConcreteEvent} from '../../../model/rest/BaseConcreteEvent';
import {Session} from '../../../model/rest/Session';
import {Therapist} from '../../../model/rest/Therapist';
import {Service} from '../../../model/rest/Service';
import {CompositeTime} from '../../../model/rest/CompositeTime';
import {ConcreteEventState_Ns} from '../../../model/rest/ConcreteEventState';
import ConcreteEventState = ConcreteEventState_Ns.ConcreteEventState;
import {EntityDependencyService} from '../../entity-dependency.service';
import {Utils} from '../../utils.service';
import {IToastrService} from 'angular-toastr';
import {LoDashStatic} from 'lodash';
import {LocalStorageService} from '../../storage/local-storage.service';
import {calendarRowConcreteEvents} from '../../../directives/calendarRow/calendarRow.directive';

export class DialogConcreteEventController {
    /** @ngInject */
    constructor(private $mdDialog,
                private $scope,
                private _: LoDashStatic,
                private Utils: Utils,
                private toastr: IToastrService,
                private EntityDependencyService: EntityDependencyService,
                private LocalStorageService: LocalStorageService,
                // below values injected from locals:
                baseConcreteEvent: BaseConcreteEvent,
                dialogConf: IDialogConcreteEventConf) {

        $scope.canEdit = dialogConf.canEdit;
        $scope.noEmails = true;
        $scope.canRemove = dialogConf.canRemove;
        $scope.canCancel = dialogConf.canCancel;
        $scope.statuses = _.cloneDeep(ConcreteEventState_Ns.$all);
        $scope.subStatuses = dialogConf.subStatuses;
        $scope.baseConcreteEvent = baseConcreteEvent;
        $scope.setDefault = {
            'Room': false,
            'Service': false
        };

        $scope.date = Utils.initDateFromStr(baseConcreteEvent.date, dateFormat);
        $scope.time = Utils.initDateFromStr(baseConcreteEvent.time, timeFormat);

        $scope.dateToString = (date) => Utils.dateToFormat(date, dateFormat);
        $scope.timeToString = (date) => Utils.dateToFormat(date, timeFormat);

        $scope.displayItem = (item) => item && item.name;

        $scope.applySession = (session: Session) => {
            if (session) {
                $scope.baseConcreteEvent.session = session;
                this.setClients(session.clients);
                this.setTherapists(session.therapists);

                const {therapist, client} = $scope.baseConcreteEvent;
                if (!_.isEmpty(therapist)) {
                    if (!session.therapists.some((item: Therapist) => item.id === therapist.id)) {
                        $scope.baseConcreteEvent.therapist = undefined;
                    }
                }

                if (!_.isEmpty(client)) {
                    if (!session.clients.some((item: Client) => item.id === client.id)) {
                        $scope.baseConcreteEvent.client = undefined;
                    }
                }
            }
        };
        $scope.applyTherapist = (therapist: Therapist) => {
            if (therapist) {
                const id2ServiceMap = EntityDependencyService.collectServicesAndCategories(therapist.serviceCategories, therapist.services, {});
                const services: Service[] = _.map(id2ServiceMap, s => s);
                this.$scope.baseConcreteEvent.therapist = therapist;

                // set a default room and service of therapist
                const defaultRooms = LocalStorageService.getItem('ConcreteEvent: default-room');
                if (!_.isEmpty(defaultRooms) && _.isEmpty(baseConcreteEvent.room)) {
                    baseConcreteEvent.room = LocalStorageService.getItem('ConcreteEvent: default-room')[therapist.id];
                }

                const defaultServices = LocalStorageService.getItem('ConcreteEvent: default-service');
                if (!_.isEmpty(defaultServices) && _.isEmpty(baseConcreteEvent.service)) {
                    baseConcreteEvent.service = LocalStorageService.getItem('ConcreteEvent: default-service')[therapist.id];
                    $scope.applyService(baseConcreteEvent.service);
                }
                this.setServices(services);
            }
        };

        $scope.applyService = (service: Service) => {
            if (!service) {
                return;
            }
            const serviceId = service.id;

            // validate rooms
            const roomsForService: Room[] = EntityDependencyService.getRoomsAvailableForService(serviceId, dialogConf.restrictions, dialogConf.categories, dialogConf.rooms);
            if (roomsForService.length === 0) {
                toastr.warning(`There is no rooms for the service "${service.name}"`);
            }
            Utils.sortRoomsForTherapist(roomsForService, $scope.baseConcreteEvent.therapist);
            this.setRooms(roomsForService);

            // validate therapist
            // const session: Session = $scope.session;
            // const therapists: Therapist[] = session ? session.therapists : dialogConf.therapists;
            // const therapistsForService: Therapist[] = EntityDependencyService.filterTherapistsByService(therapists, serviceId);
            // if (therapistsForService.length === 0) {
            //     toastr.warning(`There is no therapist who can do the service "${service.name}"`);
            // }
            // this.setTherapists(therapistsForService);

            const duration: CompositeTime = $scope.baseConcreteEvent.duration;
            if (!duration || !(duration.prep && duration.processing && duration.clean)) {// not filled
                $scope.baseConcreteEvent.duration = service.time;
                $scope.baseConcreteEvent.duration.prep = 0;
            }
        };
        $scope.setDefaultRoomForTherapist = function () {
            if (!baseConcreteEvent.room || !baseConcreteEvent.therapist) {
                return;
            }
            if (!$scope.setDefault.Room) /*invert value*/ {
                let TherapistRoom;
                const id = baseConcreteEvent.therapist.id;

                if (!LocalStorageService.getItem('ConcreteEvent: default-room')) {
                    LocalStorageService.setItem('ConcreteEvent: default-room', {});
                }
                TherapistRoom = LocalStorageService.getItem('ConcreteEvent: default-room');
                TherapistRoom[id] = baseConcreteEvent.room;
                LocalStorageService.setItem('ConcreteEvent: default-room', TherapistRoom);
                LocalStorageService.setItem('BookingModule: date', new Date());
            }
        };

        $scope.setDefaultServiceForTherapist = function () {
            if (!baseConcreteEvent.service) {
                return;
            }
            if (!$scope.setDefault.Service) /*invert value*/ {
                let TherapistService;
                const id = baseConcreteEvent.therapist.id;

                if (!LocalStorageService.getItem('ConcreteEvent: default-service')) {
                    LocalStorageService.setItem('ConcreteEvent: default-service', {});
                }
                TherapistService = LocalStorageService.getItem('ConcreteEvent: default-service');
                TherapistService[id] = baseConcreteEvent.service;
                LocalStorageService.setItem('ConcreteEvent: default-service', TherapistService);
                LocalStorageService.setItem('BookingModule: date', new Date());
            }
        };

        $scope.close = () => {
            $mdDialog.cancel();
        };

        $scope.cancel = () => {
            $scope.baseConcreteEvent.state = ConcreteEventState.cancelled;
            $scope.save();
        };

        $scope.save = () => {
            $mdDialog.hide({
                baseConcreteEvent: $scope.baseConcreteEvent,
                noEmails: $scope.noEmails,
            });
        };

        $scope.remove = () => {
            $mdDialog.hide({
                baseConcreteEvent: null,
                noEmails: $scope.noEmails,
            });
        };

        this.setSessions(dialogConf.sessions);
        this.setClients(dialogConf.clients);
        this.setTherapists(dialogConf.therapists);
        this.setServices(dialogConf.services);
        this.setRooms(dialogConf.rooms);

        if (!_.isNil(baseConcreteEvent.id)) {
            // it's set up Clients and Therapists
            const session: Session = this._.find(dialogConf.sessions, (c: Session) => {
                return c.therapists.some((t: Therapist) => t.id === baseConcreteEvent.therapist.id);
            });

            $scope.baseConcreteEvent.session = session;
            this.setClients(session.clients);
            this.setTherapists(session.therapists);

            if (baseConcreteEvent.therapist) {
                // it's set services
                $scope.applyTherapist(baseConcreteEvent.therapist);
            }
        } else {
            // creating new ConcreteEvent
            if (baseConcreteEvent.therapist) {
                const existsTherapist: Therapist = baseConcreteEvent.therapist;
                const sessions: Session[] = this.$scope.sessions.filter(
                    (session: Session) => session.therapists.some(
                        (therapist: Therapist) => therapist.id === existsTherapist.id));
                this.$scope.sessions = sessions;

                if (sessions && sessions.length >= 1) {
                    $scope.applySession(sessions[0]);
                }

                $scope.applyTherapist(existsTherapist);

            } else {
                $scope.baseConcreteEvent.therapist = undefined;
                $scope.baseConcreteEvent.client = undefined;
            }
        }
    }

    setSessions(sessions: Session[]) {
        this.$scope.sessions = sessions.sort(this.sortById);
    }

    setClients(clients: Client[]) {
        this.$scope.clients = this._.orderBy(clients, [client => client.name.toLowerCase()]);
    }

    setTherapists(therapists: Therapist[]) {
        this.$scope.therapists = therapists.sort(this.sortById);
    }

    setServices(services: Service[]) {
        this.$scope.services = services.sort(this.sortById);
    }

    setRooms(rooms: Room[]) {
        this.$scope.rooms = rooms.sort(this.sortById);
    }

    sortById<T extends { id: number }>(a: T, b: T): number {
        return a.id - b.id;
    }

    // sortByName<T extends {name: string}>(a: T, b: T): string {
    //     // (a,b) => (a.last_nom > b.last_nom) ? 1 : ((b.last_nom > a.last_nom) ? -1 : 0))
    //     return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
    // }
}
