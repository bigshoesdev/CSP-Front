import {checkModuleAccess, getPlain, getRequest} from '../../services/route.generators';
import {AvailabilityRequest} from '../../model/rest/AvailabilityRequest';
import {CacheStrategy, DataCacheService} from '../../services/storage/data-cache.service';
import {ApiAvailabilityTherapistService} from '../../services/api/api-availability-therapist.service';
import * as restangular from 'restangular';
import {Therapist} from '../../model/rest/Therapist';
import {IPromise} from "angular";

/** @ngInject */
export function availabilityRouterConfig($stateProvider: ng.ui.IStateProvider) {

    $stateProvider
        .state('auth.availability', {
            url: '/availability',
            views: {
                'sidebar@': {
                    templateUrl: 'app/directives/sidebar/sidebar.html',
                    controller: 'SidebarController',
                    resolve: {
                        items: (Sidebars) => Sidebars.availability
                    }
                },
                'main@auth': {
                    template: '<menu-button></menu-button><h1>Availability module</h1>'
                }
            },
            resolve: {
                checkModuleAccess: checkModuleAccess('AVAILABILITY')
            }
        });

    // Availability
    $stateProvider
        .state('auth.availability.requestList', {
            url: '/requests',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleAvailability/components/requestList/requestList.html',
                    controller: 'RequestListController'
                }
            }
        })
        .state('auth.availability.requestNew', {
            url: '/requests/new',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleAvailability/components/request/request.html',
                    controller: 'RequestController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isEdit: () => false,
                        isReadOnly: function (): boolean {
                            return false;
                        },
                        request: function (): AvailabilityRequest {
                            return {
                                id: null,
                                startDate: '',
                                endDate: '',
                                therapistsRequests: []
                            };
                        },
                        sessions: (DataCacheService: DataCacheService) => DataCacheService.getSessions(),
                        therapists: (DataCacheService: DataCacheService) => DataCacheService.getTherapists()
                    }
                }
            }
        })
        .state('auth.availability.requestEdit', {
            url: '/requests/edit/{requestId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleAvailability/components/request/request.html',
                    controller: 'RequestController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isEdit: () => true,
                        isReadOnly: () => false,
                        request: getRequest,
                        sessions: (DataCacheService: DataCacheService) => DataCacheService.getSessions(CacheStrategy.fast),
                        therapists: (DataCacheService: DataCacheService) => DataCacheService.getTherapists()
                    }
                }
            }
        })
        .state('auth.availability.template', {
            url: '/template',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleAvailability/components/availabilityTherapist/availabilityTherapist.html',
                    controller: 'AvailabilityTherapistController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isTemplateMode: () => true,
                        isReadOnly: () => false
                    }
                }
            }
        })
        .state('auth.availability.templateTherapist', {
            url: '/template/{therapistId}?dateFrom&dateTo',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleAvailability/components/availabilityTherapistCalendar/availabilityTherapistCalendar.html',
                    controller: 'AvailabilityTherapistCalendarController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isTemplateMode: () => true,
                        isReadOnly: () => false,
                        therapistId: ($stateParams) => $stateParams.therapistId,
                        dateFrom: ($stateParams) => $stateParams.dateFrom,
                        dateTo: ($stateParams) => $stateParams.dateTo,
                        dayRecords: () => null,
                    }
                }
            }
        })
        .state('auth.availability.edit', {
            url: '/edit',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleAvailability/components/availabilityTherapist/availabilityTherapist.html',
                    controller: 'AvailabilityTherapistController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isTemplateMode: () => false,
                        isReadOnly: () => false
                    }
                }
            }
        })
        .state('auth.availability.editTherapist', {
            url: '/edit/{therapistId}?dateFrom&dateTo',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleAvailability/components/availabilityTherapistCalendar/availabilityTherapistCalendar.html',
                    controller: 'AvailabilityTherapistCalendarController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isTemplateMode: () => false,
                        isReadOnly: () => false,
                        therapistId: ($stateParams) => $stateParams.therapistId,
                        dateFrom: ($stateParams) => $stateParams.dateFrom,
                        dateTo: ($stateParams) => $stateParams.dateTo,
                        dayRecords: ($stateParams, ApiAvailabilityTherapistService: ApiAvailabilityTherapistService) =>
                            ApiAvailabilityTherapistService.getAvailabilityTherapist($stateParams.therapistId, $stateParams.dateFrom, $stateParams.dateTo),
                    }
                }
            }
        })
        .state('auth.availability.view', {
            url: '/view',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleAvailability/components/availabilityTherapist/availabilityTherapist.html',
                    controller: 'AvailabilityTherapistController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isTemplateMode: () => false,
                        isReadOnly: () => true
                    }
                }
            }
        })
        .state('auth.availability.viewTherapist', {
            url: '/view/{therapistId}?dateFrom&dateTo',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleAvailability/components/availabilityTherapistCalendar/availabilityTherapistCalendar.html',
                    controller: 'AvailabilityTherapistCalendarController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isTemplateMode: () => false,
                        isReadOnly: () => true,
                        therapistId: ($stateParams) => $stateParams.therapistId,
                        dateFrom: ($stateParams) => $stateParams.dateFrom,
                        dateTo: ($stateParams) => $stateParams.dateTo,
                        dayRecords: ($stateParams, ApiAvailabilityTherapistService: ApiAvailabilityTherapistService) =>
                            ApiAvailabilityTherapistService.getAvailabilityTherapist($stateParams.therapistId, $stateParams.dateFrom, $stateParams.dateTo),
                    }
                }
            }
        })
        .state('auth.availability.therapistHistoryFind', {
            url: '/history/therapist/find',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleAvailability/components/findAvailabilityTherapistHistory/findAvailabilityTherapistHistory.html',
                    controller: 'FindAvailabilityTherapistHistoryController',
                    controllerAs: 'ctrl',
                    resolve: {
                        therapists: (DataCacheService: DataCacheService) => DataCacheService.getTherapists()
                    }
                }
            }
        })
        .state('auth.availability.therapistHistoryView', {
            url: '/history/therapist/{therapistId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleAvailability/components/availabilityTherapistHistory/availabilityTherapistHistory.html',
                    controller: 'AvailabilityTherapistHistoryController',
                    controllerAs: 'ctrl',
                    resolve: {
                        therapist: (Restangular: restangular.IService, $stateParams): IPromise<Therapist> => {
                            return Restangular
                                .one('therapist', $stateParams.therapistId)
                                .get()
                                .then(getPlain);
                        }
                    }
                }
            }
        })
        .state('auth.availability.viewTherapistHistoryRecord', {
            url: '/history/therapist/{therapistId}/record/{recordId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleAvailability/components/availabilityTherapistHistoryRecord/availabilityTherapistHistoryRecord.html',
                    controller: 'AvailabilityTherapistHistoryRecordController',
                    controllerAs: 'ctrl',
                    resolve: {
                        therapistId: ($stateParams) => $stateParams.therapistId,
                        recordId: ($stateParams) => $stateParams.recordId,
                        availabilityHistoryRecord: ($stateParams, Restangular: restangular.IService) => {
                            return Restangular
                                .one('availability/history', $stateParams.recordId)
                                .get()
                                .then(getPlain);
                        },
                    }
                }
            }
        })

    ;


}
