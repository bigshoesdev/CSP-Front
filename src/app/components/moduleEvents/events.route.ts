import {checkModuleAccess, getCalendarEvent, } from '../../services/route.generators';
import {CalendarEvent} from '../../model/rest/CalendarEvent';
import {DataCacheService} from '../../services/storage/data-cache.service';
import {ApiCalendarEventsService} from '../../services/api/api-calendar-events.service';

/** @ngInject */
export function eventsRouterConfig($stateProvider: ng.ui.IStateProvider) {

    // Events module
    $stateProvider
        .state('auth.events', {
            url: '/events',
            views: {
                'sidebar@': {
                    templateUrl: 'app/directives/sidebar/sidebar.html',
                    controller: 'SidebarController',
                    resolve: {
                        items: (Sidebars) => Sidebars.events
                    }
                },
                'main@auth': {
                    template: '<menu-button></menu-button><h1>Events module</h1>'
                }
            },
            resolve: {
                checkModuleAccess: checkModuleAccess('EVENTS')
            }
        });

    // Availability
    $stateProvider
        .state('auth.events.calendarEvent', {
            url: '/calendarEvent',
            views: {
            }
        })
        .state('auth.events.calendarEvent.list', {
            url: '/list',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleEvents/components/calendarEventList/calendarEventList.html',
                    controller: 'CalendarEventListController',
                    resolve: {
                        collectionUrl: () => 'calendarEvents'
                    }
                }
            }
        })
        .state('auth.events.calendarEvent.urgentList', {
            url: '/urgentList',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleEvents/components/calendarEventList/calendarEventList.html',
                    controller: 'CalendarEventListController',
                    resolve: {
                        collectionUrl: () => 'calendarEvents/urgent'
                    }
                }
            }
        })
        .state('auth.events.calendarEvent.new', {
            url: '/new',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleEvents/components/calendarEvent/calendarEvent.html',
                    controller: 'CalendarEventController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isEdit: () => false,
                        calendarEvent: function (): CalendarEvent {
                            return {
                                id: null,
                                name: '',
                                event: null,
                                room: null,
                                therapist: null,
                                equipment: [],
                                capacity: 0,
                                dateStart: '',
                                dateEnd: '',
                                days: [],
                                time: '',
                                duration: {
                                    clean: 0,
                                    prep: 0,
                                    processing: 0
                                }
                            };
                        },
                        events: (DataCacheService: DataCacheService) => DataCacheService.getEvents(),
                        rooms: (DataCacheService: DataCacheService) => DataCacheService.getRooms(),
                        therapists: (DataCacheService: DataCacheService) => DataCacheService.getTherapists(),
                        equipments: (DataCacheService: DataCacheService) => DataCacheService.getEquipments()
                    }
                }
            }
        })
        .state('auth.events.calendarEvent.show', {
            url: '/show/{calendarEventId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleEvents/components/calendarEvent/calendarEvent.html',
                    controller: 'CalendarEventController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isEdit: () => false,
                        calendarEvent: getCalendarEvent,
                        events: (DataCacheService: DataCacheService) => DataCacheService.getEvents(),
                        rooms: (DataCacheService: DataCacheService) => DataCacheService.getRooms(),
                        therapists: (DataCacheService: DataCacheService) => DataCacheService.getTherapists(),
                        equipments: (DataCacheService: DataCacheService) => DataCacheService.getEquipments()
                    }
                }
            }
        })
        .state('auth.events.calendarEvent.edit', {
            url: '/{calendarEventId}/edit',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleEvents/components/calendarEvent/calendarEvent.html',
                    controller: 'CalendarEventController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isEdit: () => true,
                        calendarEvent: getCalendarEvent,
                        events: (DataCacheService: DataCacheService) => DataCacheService.getEvents(),
                        rooms: (DataCacheService: DataCacheService) => DataCacheService.getRooms(),
                        therapists: (DataCacheService: DataCacheService) => DataCacheService.getTherapists(),
                        equipments: (DataCacheService: DataCacheService) => DataCacheService.getEquipments()
                    }
                }
            }
        })
        .state('auth.events.calendarEvent.concrete', {
            url: '/{calendarEventId}/concrete?dateStart&dateEnd',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleEvents/components/concreteCalendarEventCalendar/concreteCalendarEventCalendar.html',
                    controller: 'ConcreteCalendarEventCalendarController',
                    controllerAs: 'ConcreteCalendarEventCalendarController',
                    resolve: {
                        calendarEventId: ($stateParams) => $stateParams.calendarEventId,
                        dateStart: ($stateParams) => $stateParams.dateStart,
                        dateEnd: ($stateParams) => $stateParams.dateEnd,
                        concreteCalendarEvents: ($stateParams, ApiCalendarEventsService: ApiCalendarEventsService) => {
                            return ApiCalendarEventsService.getConcreteCalendarEvents($stateParams.calendarEventId, $stateParams.dateStart, $stateParams.dateEnd);
                        },
                        isReadOnly: () => true,
                    }
                }
            }
        })
    ;

}
