import {checkModuleAccess, getPlain, getRequest, } from '../../services/route.generators';
import {Profile} from '../../model/rest/Profile';
import {DataCacheService} from '../../services/storage/data-cache.service';
import {ApiBookingService} from '../../services/api/api-booking.service';
import {ApiAvailabilityTherapistService} from '../../services/api/api-availability-therapist.service';


/** @ngInject */
export function therapistRouterConfig($stateProvider: ng.ui.IStateProvider) {

    // Therapist module
    $stateProvider
        .state('auth.therapist', {
            url: '/therapist',
            views: {
                'sidebar@': {
                    templateUrl: 'app/directives/sidebar/sidebar.html',
                    controller: 'SidebarController',
                    resolve: {
                        items: (Sidebars) => Sidebars.therapist
                    }
                },
                'main@auth': {
                    template: '<menu-button></menu-button><h1>Therapist module</h1><h4>{{infoMessage}}</h4>',
                    controller: ($scope, infoMessage) => {
                        $scope.infoMessage = infoMessage;
                    },
                    resolve: {
                        infoMessage: (Sidebars, AuthService) => {
                            return AuthService.getCurrentUserProfilePromise()
                                .then((profile: Profile) => profile.theTherapist
                                    ? 'Therapist: ' + profile.currentUser.name
                                    : 'Your email is not in a therapist list.');
                        }
                    }
                }
            },
            resolve: {
                checkModuleAccess: checkModuleAccess('THERAPIST')
            }
        });

    // Therapist
    $stateProvider
        .state('auth.therapist.availability', {
            url: '/availability',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleTherapist/components/myAvailability/myAvailability.html',
                    controller: 'MyAvailabilityController',
                    controllerAs: 'ctrl'
                }
            }
        })
        .state('auth.therapist.availability.view', {
            url: '/me?dateFrom&dateTo',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleAvailability/components/availabilityTherapistCalendar/availabilityTherapistCalendar.html',
                    controller: 'AvailabilityTherapistCalendarController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isTemplateMode: () => false,
                        isReadOnly: () => true,
                        therapistId: () => 'me',
                        dateFrom: ($stateParams) => $stateParams.dateFrom,
                        dateTo: ($stateParams) => $stateParams.dateTo,
                        dayRecords: ($stateParams, ApiAvailabilityTherapistService: ApiAvailabilityTherapistService) =>
                            ApiAvailabilityTherapistService.getAvailabilityMine($stateParams.dateFrom, $stateParams.dateTo),
                    }
                }
            }
        })
        .state('auth.therapist.availability.requestList', {
            url: '/requests',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleTherapist/components/myRequestList/myRequestList.html',
                    controller: 'MyRequestListController'
                }
            }
        })
        .state('auth.therapist.availability.request', {
            url: '/requests/{requestId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleTherapist/components/myRequest/myRequest.html',
                    controller: 'MyRequestController',
                    controllerAs: 'ctrl',
                    resolve: {
                        request: getRequest,
                        therapists: (DataCacheService: DataCacheService) => DataCacheService.getTherapists()
                    }
                }
            }
        })
        .state('auth.therapist.events', {
            url: '/events',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleTherapist/components/myEvents/myEvents.html',
                    controller: 'MyEventsController',
                    controllerAs: 'ctrl',
                    resolve: {
                        events: (DataCacheService: DataCacheService) => DataCacheService.getEvents(),
                        services: (DataCacheService: DataCacheService) => DataCacheService.getServices(),
                        rooms: (DataCacheService: DataCacheService) => DataCacheService.getRooms(),
                        therapists: (DataCacheService: DataCacheService) => DataCacheService.getTherapists(),
                        clients: (DataCacheService: DataCacheService) => DataCacheService.getClients(),
                        sessions: (DataCacheService: DataCacheService) => DataCacheService.getSessions(),
                        restrictions: (DataCacheService: DataCacheService) => DataCacheService.getRestrictions(),
                        concreteEventSubStatuses: (ApiBookingService: ApiBookingService) => ApiBookingService.getEventSubStatus(),
                    }
                }
            }
        })

    ;


}
