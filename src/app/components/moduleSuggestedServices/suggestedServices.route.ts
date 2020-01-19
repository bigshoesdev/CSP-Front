import {checkModuleAccess, getSession, isModuleAccess} from '../../services/route.generators';
import {PreliminaryEvent} from '../../model/rest/PreliminaryEvent';
import {ApiSuggestedServicesService} from '../../services/api/api-suggested-services.service';
import {DataCacheService} from '../../services/storage/data-cache.service';


/** @ngInject */
export function suggestedServicesRouterConfig($stateProvider: ng.ui.IStateProvider) {

    // Suggested Services
    $stateProvider
        .state('auth.suggestedServices', {
            url: '/suggestedServices',
            views: {
                'sidebar@': {
                    templateUrl: 'app/directives/sidebar/sidebar.html',
                    controller: 'SidebarController',
                    resolve: {
                        items: (Sidebars) => Sidebars.suggestedServices
                    }
                },
                'main@auth': {
                    template: '<menu-button></menu-button><h1>Suggested Services</h1>'
                }
            },
            resolve: {
                checkModuleAccess: checkModuleAccess('SUGGESTED_SERVICES'),
                canEditUi: isModuleAccess('SUGGESTED_SERVICES_UI')
            }
        });


    // Suggested Services
    $stateProvider
        .state('auth.suggestedServices.table', {
            url: '/table',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSuggestedServices/components/suggestedServices/suggestedServices.html',
                    controller: 'SuggestedServicesController',
                    controllerAs: 'SuggestedServicesController',
                    resolve: {
                        sessions: (DataCacheService: DataCacheService) => DataCacheService.getSessions(),
                        rooms: (DataCacheService: DataCacheService) => DataCacheService.getRooms(),
                        services: (DataCacheService: DataCacheService) => DataCacheService.getServices(),
                        therapists: (DataCacheService: DataCacheService) => DataCacheService.getTherapists(),
                        clients: (DataCacheService: DataCacheService) => DataCacheService.getClients(),
                        restrict: (DataCacheService: DataCacheService) => DataCacheService.getRestrictions(),
                        categories: (DataCacheService: DataCacheService) => DataCacheService.getCategories(),
                    }
                }
            }
        })
        .state('auth.suggestedServices.table.editColumns', {
            url: '/columns',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleHealthProfile/components/baseEditColumns/baseEditColumns.html',
                    controller: 'SsEditColumnsController',
                    controllerAs: 'ctrl',
                    resolve: {
                        checkModuleAccess: checkModuleAccess('SUGGESTED_SERVICES_UI'),
                        columns: (ApiSuggestedServicesService: ApiSuggestedServicesService) => ApiSuggestedServicesService.getColumns(),
                        customColumns: (ApiSuggestedServicesService: ApiSuggestedServicesService) => ApiSuggestedServicesService.getCustomColumns()
                    }
                }
            }
        })
        .state('auth.suggestedServices.table.editCustomColumns', {
            url: '/customColumns',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleHealthProfile/components/baseEditCustomColumns/baseEditCustomColumns.html',
                    controller: 'SsEditCustomColumnsController',
                    controllerAs: 'ctrl',
                    resolve: {
                        checkModuleAccess: checkModuleAccess('SUGGESTED_SERVICES_UI'),
                        customColumns: (ApiSuggestedServicesService: ApiSuggestedServicesService) => ApiSuggestedServicesService.getCustomColumns()
                    }
                }
            }
        })
        .state('auth.suggestedServices.juggleBoard', {
            url: '/juggleBoard',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSuggestedServices/components/juggleBoard/juggleBoard.html',
                    controller: 'JuggleBoardController',
                    controllerAs: 'JuggleBoardController',
                    resolve: {
                        sessions: (DataCacheService: DataCacheService) => DataCacheService.getSessions(),
                        rooms: (DataCacheService: DataCacheService) => DataCacheService.getRooms(),
                        categories: (DataCacheService: DataCacheService) => DataCacheService.getCategories(),
                        services: (DataCacheService: DataCacheService) => DataCacheService.getServices(),
                        restrictions: (DataCacheService: DataCacheService) => DataCacheService.getRestrictions()
                    }
                }
            }
        })
        .state('auth.suggestedServices.edit', {
            url: '/session/{sessionId}/client/{clientId}/service/{serviceId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSuggestedServices/components/suggestedService/suggestedService.html',
                    controller: 'SuggestedServiceController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isEdit: () => true,
                        session: ($stateParams) => $stateParams.session,
                        client: ($stateParams) => $stateParams.client,
                        service: ($stateParams) => $stateParams.service,
                        // session: getSession,
                        suggestedService: ($stateParams, ApiSuggestedServicesService: ApiSuggestedServicesService): Promise<PreliminaryEvent> =>
                            ApiSuggestedServicesService.getClientServiceDataItem($stateParams.session.id, $stateParams.client.id, $stateParams.service.id),
                        rooms: (DataCacheService: DataCacheService) => DataCacheService.getRooms(),
                        restrictions: (DataCacheService: DataCacheService) => DataCacheService.getRestrictions(),
                        categories: (DataCacheService: DataCacheService) => DataCacheService.getCategories(),
                    }
                }
            }
        })
        .state('auth.suggestedServices.juggleBoard.daily', {
            url: '/daily',
            views: {
                'juggleBoardModeView@auth.suggestedServices.juggleBoard': {
                    templateUrl: 'app/components/moduleSuggestedServices/components/juggleBoard/tabs/jbDate/jbDate.html',
                    controller: 'JbDateController',
                    controllerAs: 'ctrl'
                }
            }
        })
        .state('auth.suggestedServices.juggleBoard.weekly', {
            url: '/weekly',
            views: {
                'juggleBoardModeView@auth.suggestedServices.juggleBoard': {
                    templateUrl: 'app/components/moduleSuggestedServices/components/juggleBoard/tabs/jbDates/jbDates.html',
                    controller: 'JbDatesWeekController',
                    controllerAs: 'ctrl'
                }
            }
        })
        .state('auth.suggestedServices.juggleBoard.interval', {
            url: '/interval',
            views: {
                'juggleBoardModeView@auth.suggestedServices.juggleBoard': {
                    templateUrl: 'app/components/moduleSuggestedServices/components/juggleBoard/tabs/jbDates/jbDates.html',
                    controller: 'JbDatesIntervalController',
                    controllerAs: 'ctrl'
                }
            }
        })
    ;


}
