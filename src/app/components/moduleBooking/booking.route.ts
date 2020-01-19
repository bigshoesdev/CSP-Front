import {checkModuleAccess, getPlain, getWeek} from '../../services/route.generators';
import {dateFormat} from '../../services/app.constant';
import {ConcreteEvent} from '../../model/rest/ConcreteEvent';
import {Therapist} from '../../model/rest/Therapist';
import {AvailabilityTherapistDayRecord} from '../../model/rest/AvailabilityTherapistDayRecord';
import {DataCacheService} from '../../services/storage/data-cache.service';
import {ConcreteCalendarEvent} from '../../model/rest/ConcreteCalendarEvent';
import {ApiCalendarEventsService} from '../../services/api/api-calendar-events.service';
import {ApiBookingService} from '../../services/api/api-booking.service';
import {ApiAvailabilityTherapistService} from '../../services/api/api-availability-therapist.service';
import {Collection} from '../../model/Collection';
import {TherapistAndAvailability} from './events.controller';
import {TherapistWeek} from '../../model/rest/TherapistWeek';
import {ServiceCategory} from '../../model/rest/ServiceCategory';

/** @ngInject */
export function bookingRouterConfig($stateProvider: ng.ui.IStateProvider) {

    // booking
    $stateProvider
        .state('auth.booking', {
            url: '/booking',
            views: {
                'sidebar@': {
                    templateUrl: 'app/directives/sidebar/sidebar.html',
                    controller: 'SidebarController',
                    resolve: {
                        items: (Sidebars) => Sidebars.booking,
                    },
                },
                'main@auth': {
                    template: '<menu-button></menu-button><h1>Booking</h1>',
                },
            },
            resolve: {
                checkModuleAccess: checkModuleAccess('BOOKING'),
            },
        })
        .state('auth.booking.events', {
            url: '/events?date',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleBooking/events.html',
                    controller: 'EventsController',
                    controllerAs: 'ctrl',
                    resolve: {
                        date: ($stateParams, moment) => {
                            return $stateParams.date || moment().format(dateFormat);
                        },
                        concreteEvents: ($stateParams, moment, ApiBookingService: ApiBookingService): Promise<ConcreteEvent[]> => {
                            const date: string = $stateParams.date || moment().format(dateFormat);
                            return ApiBookingService.getEvents(date);
                        },
                        concreteCalendarEvents: ($stateParams, moment, ApiCalendarEventsService: ApiCalendarEventsService): Promise<ConcreteCalendarEvent[]> => {
                            const date: string = $stateParams.date || moment().format(dateFormat);
                            return ApiCalendarEventsService.getConcreteForAllCalendarEvents(date, date);
                        },
                        concreteEventSubStatuses: (ApiBookingService: ApiBookingService) => ApiBookingService.getEventSubStatus(),
                        rooms: (DataCacheService: DataCacheService) => DataCacheService.getRooms(),
                        id2therapistAndAvailability: ($stateParams, ApiAvailabilityTherapistService: ApiAvailabilityTherapistService, $q: any, _, moment, DataCacheService: DataCacheService): Promise<Collection<TherapistAndAvailability>> => {
                            const date = $stateParams.date || moment().format(dateFormat);
                            const id2Therapist: Collection<Therapist> = {};

                            return DataCacheService.getTherapists()
                                .then((therapists: Therapist[]): Promise<Collection<AvailabilityTherapistDayRecord[]>> => {
                                    const id2AvailabilityPromise: Collection<Promise<AvailabilityTherapistDayRecord[]>> = therapists.reduce((id2Availability: Collection<Promise<AvailabilityTherapistDayRecord[]>>, therapist: Therapist) => {
                                        const therapistId = therapist.id;
                                        id2Therapist[therapistId] = therapist; // store therapist for final result
                                        id2Availability[therapistId] = getAvailability(therapistId);
                                        return id2Availability;
                                    }, {});
                                    return $q.all(id2AvailabilityPromise);
                                })
                                .then((id2Availability: Collection<AvailabilityTherapistDayRecord[]>): Collection<TherapistAndAvailability> => {
                                    return _.reduce(id2Availability, (id2Result: Collection<TherapistAndAvailability>, dayRecords: AvailabilityTherapistDayRecord[], therapistId): Collection<TherapistAndAvailability> => {
                                        id2Result[therapistId] = {
                                            therapist: id2Therapist[therapistId],
                                            availability: dayRecords,
                                        };
                                        return id2Result;
                                    }, {});
                                });

                            function getAvailability(therapistId): Promise<AvailabilityTherapistDayRecord[]> {
                                return ApiAvailabilityTherapistService.getAvailabilityTherapist(therapistId, date, date);
                            }
                        },
                        categories: (DataCacheService: DataCacheService) => DataCacheService.getCategories(),
                        sessions: (DataCacheService: DataCacheService) => DataCacheService.getSessions(),
                        restrictions: (DataCacheService: DataCacheService) => DataCacheService.getRestrictions(),
                        events: (DataCacheService: DataCacheService) => DataCacheService.getEvents(),
                        services: (DataCacheService: DataCacheService) => DataCacheService.getServices(),
                        clients: (DataCacheService: DataCacheService) => DataCacheService.getClients(),
                        week: (DataCacheService: DataCacheService) => DataCacheService.getWeeks(),
                    },
                },
            },
        })
        .state('auth.booking.weekList', {
            url: '/week',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleBooking/therapistWeekList/therapistWeekList.html',
                    controller: 'TherapistWeekListController',
                    controllerAs: 'ctrl',
                    resolve: {
                        TherapistWeeks: ($stateParams, moment, ApiBookingService: ApiBookingService): Promise<TherapistWeek[]> => {
                            return ApiBookingService.getWeek();
                        },
                        therapists: (DataCacheService: DataCacheService) => DataCacheService.getTherapists()
                    },
                },
            },
        })
        .state('auth.booking.weekNew', {
            url: '/week/new',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleBooking/therapistWeek/therapistWeek.html',
                    controller: 'TherapistWeekController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isEdit: () => false,
                        week: (): TherapistWeek => {
                            return {
                                id: null,
                                name: '',
                                therapists: []
                            };
                        },
                        therapists: (DataCacheService: DataCacheService) => DataCacheService.getTherapists(),
                    }
                }
            }
        })
        .state('auth.booking.weekShow', {
            url: '/week/show/{weekId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleBooking/therapistWeek/therapistWeek.html',
                    controller: 'TherapistWeekController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isEdit: () => false,
                        week: getWeek,
                        therapists: (DataCacheService: DataCacheService) => DataCacheService.getTherapists(),
                    }
                }
            }
        })
        .state('auth.booking.weekEdit', {
            url: '/week/edit/{weekId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleBooking/therapistWeek/therapistWeek.html',
                    controller: 'TherapistWeekController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isEdit: () => true,
                        week: getWeek,
                        therapists: (DataCacheService: DataCacheService) => DataCacheService.getTherapists(),
                    }
                }
            }
        });

}
