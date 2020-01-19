import {Moment} from '../../../../../../bower_components/moment/moment';
import {dateFormat} from '../../../../services/app.constant';
import {Room} from '../../../../model/rest/Room';
import {Client} from '../../../../model/rest/Client';
import {Service} from '../../../../model/rest/Service';
import {Therapist} from '../../../../model/rest/Therapist';
import {Session} from '../../../../model/rest/Session';
import {Restriction} from '../../../../model/rest/Restriction';
import {ConcreteEventSubStatus} from '../../../../model/rest/ConcreteEventSubStatus';
import {ConcreteCalendarEvent} from '../../../../model/rest/ConcreteCalendarEvent';
import {ConcreteEvent} from '../../../../model/rest/ConcreteEvent';
import {Event} from '../../../../model/rest/Event';
import {CalendarMode_Ns} from '../../../../model/CalendarMode';
import {CalendarConf} from '../../../../model/CalendarConf';
import CalendarModeEnum = CalendarMode_Ns.CalendarMode;
import {ApiCalendarEventsService} from '../../../../services/api/api-calendar-events.service';
import {ApiBookingService} from '../../../../services/api/api-booking.service';
declare let angular: any;

export class MyEventsController {
    /** @ngInject */
    constructor(events: Event[],
                services: Service[],
                rooms: Room[],
                therapists: Therapist[],
                clients: Client[],
                sessions: Session[],
                restrictions: Restriction[],
                concreteEventSubStatuses: ConcreteEventSubStatus[],
                $scope, $q: any, Restangular, ApiCalendarEventsService: ApiCalendarEventsService, ApiBookingService: ApiBookingService) {

        initForm();

        function initForm() {

            $scope.events = events;
            $scope.services = services;
            $scope.rooms = rooms;
            $scope.therapists = therapists;
            $scope.clients = clients;
            $scope.sessions = sessions;
            $scope.restrictions = restrictions;
            $scope.concreteEventSubStatuses = concreteEventSubStatuses;


            const calendarConf: CalendarConf = {
                model: [],
                // startDate: '10-07-2017',
                // endDate: '10-09-2017',
                defaultGridMode: CalendarModeEnum.dates,
                disableGridMode: true,
                isReadOnly: false,
                loadModel: loadModel
            };
            $scope.calendarConf = calendarConf;

        }


        function loadModel(start: Moment, end: Moment) {
            const dateStart = start.format(dateFormat);
            const dateEnd = end.format(dateFormat);

            const calendarConcretePr = loadCalendarConcrete(dateStart, dateEnd);
            const concretePr = loadConcrete(dateStart, dateEnd);

            return $q.all({calendarConcreteEvents: calendarConcretePr, concreteEvents: concretePr})
                .then((result: { calendarConcreteEvents: ConcreteCalendarEvent[], concreteEvents: ConcreteEvent[] }) => {
                    const {calendarConcreteEvents, concreteEvents} = result;
                    return (<(ConcreteCalendarEvent | ConcreteEvent)[]>calendarConcreteEvents).concat(concreteEvents);
                });
        }

        function loadCalendarConcrete(dateStart: string, dateEnd: string) {
            return ApiCalendarEventsService.getMineConcreteCalendarEvents(dateStart, dateEnd);
        }

        function loadConcrete(dateStart: string, dateEnd: string) {
            return ApiBookingService.getMineEvents(dateStart, dateEnd);

        }

    }
}
