import {checkModuleAccess, getOneFromCollectionGenerator, getPlain, isModuleAccess} from '../../services/route.generators';
import {HsType_Ns} from '../../model/rest/HsType';
import {ApiHealthTableService} from '../../services/api/api-health-table.service';
import {DataCacheService} from '../../services/storage/data-cache.service';
import HsType = HsType_Ns.HsType;
import * as restangular from 'restangular';

/** @ngInject */
export function healthProfileRouterConfig($stateProvider: ng.ui.IStateProvider) {

    // Health Profile module
    $stateProvider
        .state('auth.healthProfile', {
            url: '/healthProfile',
            views: {
                'sidebar@': {
                    templateUrl: 'app/directives/sidebar/sidebar.html',
                    controller: 'SidebarController',
                    resolve: {
                        items: (Sidebars) => Sidebars.healthProfile
                    }
                },
                'main@auth': {
                    template: '<menu-button></menu-button><h1>Health Profile module</h1>'
                }
            },
            resolve: {
                checkModuleAccess: checkModuleAccess('HEALTH'),
                canEditData: isModuleAccess('HEALTH_CONDITIONS'),
                canEditUi: isModuleAccess('HEALTH_UI')
            }
        });

    // Health Profile
    $stateProvider
        .state('auth.healthProfile.sessionClients', {
            url: '/sessionClients',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleHealthProfile/components/sessionClients/sessionClients.html',
                    controller: 'SessionClientsController',
                    controllerAs: 'ctrl',
                    resolve: {
                        sessions: (DataCacheService: DataCacheService) => DataCacheService.getSessions(),
                    }
                }
            }
        })
        .state('auth.healthProfile.sessionClients.editColumns', {
            url: '/columns',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleHealthProfile/components/baseEditColumns/baseEditColumns.html',
                    controller: 'ScEditColumnsController',
                    controllerAs: 'ctrl',
                    resolve: {
                        checkModuleAccess: checkModuleAccess('HEALTH_UI'),
                        columns: (ApiHealthTableService: ApiHealthTableService) => ApiHealthTableService.getColumns(),
                        customColumns: (ApiHealthTableService: ApiHealthTableService) => ApiHealthTableService.getCustomColumns()
                    }
                }
            }
        })
        .state('auth.healthProfile.sessionClients.editCustomColumns', {
            url: '/customColumns',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleHealthProfile/components/baseEditCustomColumns/baseEditCustomColumns.html',
                    controller: 'ScEditCustomColumnsController',
                    controllerAs: 'ctrl',
                    resolve: {
                        checkModuleAccess: checkModuleAccess('HEALTH_UI'),
                        customColumns: (ApiHealthTableService: ApiHealthTableService) => ApiHealthTableService.getCustomColumns()
                    }
                }
            }
        })
        .state('auth.healthProfile.healthSections', {
            url: '/healthSections/session/{sessionId}/client/{clientId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleHealthProfile/components/healthSections/healthSections.html',
                    controller: 'HealthSectionsController',
                    controllerAs: 'ctrl',
                    resolve: {
                        sessionId: ($stateParams) => $stateParams.sessionId,
                        clientId: ($stateParams) => $stateParams.clientId,
                        client: getOneFromCollectionGenerator('client', 'clientId'),
                        status: ($stateParams, Restangular: restangular.IService) => {
                            return Restangular
                                .one('healthTable/session', $stateParams.sessionId)
                                .one('client', $stateParams.clientId)
                                .one('status')
                                .get()
                                .then(getPlain);
                        },
                        healthSections: (ApiHealthTableService: ApiHealthTableService) => ApiHealthTableService.getHealthSections(),
                        rows: ($stateParams, Restangular: restangular.IService) => {
                            return Restangular // /healthSections/client/{clientId}/session/{sessionId}/rows
                                .one('healthSections/client', $stateParams.clientId)
                                .one('session', $stateParams.sessionId)
                                .all('rows')
                                .getList()
                                .then(getPlain);
                        },
                        conditionColumns: (ApiHealthTableService: ApiHealthTableService) => ApiHealthTableService.getHealthConditions(),
                        flagColumns: (ApiHealthTableService: ApiHealthTableService) => ApiHealthTableService.getHealthFlags()
                    }
                }
            }
        })
        .state('auth.healthProfile.healthSectionEditColumns', {
            url: '/healthSection/{sectionType}/columns',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleHealthProfile/components/baseEditColumns/baseEditColumns.html',
                    controller: 'HsEditColumnsController',
                    controllerAs: 'ctrl',
                    resolve: {
                        checkModuleAccess: checkModuleAccess('HEALTH_UI'),
                        sectionType: ($stateParams) => $stateParams.sectionType,
                        columns: ($stateParams, Restangular: restangular.IService) => {
                            // GET /healthSection/{sectionType}/columns
                            return Restangular
                                .one('healthSection', $stateParams.sectionType)
                                .all('columns')
                                .getList()
                                .then(getPlain);
                        },
                        customColumns: ($stateParams, Restangular: restangular.IService) => {
                            // GET /healthSection/{sectionType}/customColumns
                            return Restangular
                                .one('healthSection', $stateParams.sectionType)
                                .all('customColumns')
                                .getList()
                                .then(getPlain);
                        },
                    }
                }
            }
        })
        .state('auth.healthProfile.healthSectionEditCustomColumns', {
            url: '/healthSection/{sectionType}/customColumns',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleHealthProfile/components/baseEditCustomColumns/baseEditCustomColumns.html',
                    controller: 'HsEditCustomColumnsController',
                    controllerAs: 'ctrl',
                    resolve: {
                        checkModuleAccess: checkModuleAccess('HEALTH_UI'),
                        sectionType: ($stateParams) => $stateParams.sectionType,
                        customColumns: ($stateParams, Restangular: restangular.IService) => {
                            // GET /healthSection/{sectionType}/customColumns
                            return Restangular
                                .one('healthSection', $stateParams.sectionType)
                                .all('customColumns')
                                .getList()
                                .then(getPlain);
                        }
                    }
                }
            }
        })
        .state('auth.healthProfile.healthSectionEditCustomValues', {
            url: '/healthSection/{sectionType}/customColumn/{columnId}/values',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleHealthProfile/components/hsEditBaseValues/hsEditBaseValues.html',
                    controller: 'HsEditCustomValuesController',
                    controllerAs: 'ctrl',
                    resolve: {
                        checkModuleAccess: checkModuleAccess('HEALTH_UI'),
                        sectionType: ($stateParams) => $stateParams.sectionType,
                        columnId: ($stateParams) => $stateParams.columnId,
                        customColumn: ($stateParams, Restangular: restangular.IService) => {
                            // GET (not in schema) /healthSection/{sectionType}/customColumn/{columnId}
                            return Restangular
                                .one('healthSection', $stateParams.sectionType)
                                .one('customColumn', $stateParams.columnId)
                                .get()
                                .then(getPlain);
                        },
                    }
                }
            }
        })
        .state('auth.healthProfile.healthSectionEditConditionValues', {
            url: '/healthSection/{sectionType}/healthCondition',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleHealthProfile/components/hsEditCondition/hsEditCondition.html',
                    controller: 'HsEditConditionController',
                    controllerAs: 'ctrl',
                    resolve: {
                        checkModuleAccess: checkModuleAccess('HEALTH_UI'),
                        sectionType: ($stateParams) => HsType[$stateParams.sectionType],
                        healthConditionColumn: ($stateParams, Restangular: restangular.IService) => {
                            return Restangular
                                .one('healthCondition', $stateParams.sectionType)
                                .get()
                                .then(getPlain);
                        },
                        healthSectionFlagColumn: ($stateParams, Restangular: restangular.IService) => {
                            return Restangular
                                .one('healthFlag', $stateParams.sectionType)
                                .get()
                                .then(getPlain);
                        },
                    }
                }
            }
        })
        .state('auth.healthProfile.healthSectionEditFlagValues', {
            url: '/healthSection/{sectionType}/healthFlag',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleHealthProfile/components/hsEditFlag/hsEditFlag.html',
                    controller: 'HsEditFlagController',
                    controllerAs: 'ctrl',
                    resolve: {
                        checkModuleAccess: checkModuleAccess('HEALTH_UI'),
                        sectionType: ($stateParams) => $stateParams.sectionType,
                        healthSectionFlagColumn: ($stateParams, Restangular) => {
                            // /healthFlag/{sectionType}
                            return Restangular
                                .one('healthFlag', $stateParams.sectionType)
                                .get()
                                .then(getPlain);
                        }
                    }
                }
            }
        })
        .state('auth.healthProfile.healthSectionEditSelectValues', {
            url: '/healthSection/{sectionType}/column/{columnId}/values',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleHealthProfile/components/hsEditBaseValues/hsEditBaseValues.html',
                    controller: 'HsEditSelectValuesController',
                    controllerAs: 'ctrl',
                    resolve: {
                        checkModuleAccess: checkModuleAccess('HEALTH_UI'),
                        sectionType: ($stateParams) => $stateParams.sectionType,
                        columnId: ($stateParams) => $stateParams.columnId,
                        column: ($stateParams, Restangular: restangular.IService) => {
                            return Restangular
                                .one('healthSection', $stateParams.sectionType)
                                .one('column', $stateParams.columnId)
                                .get()
                                .then(getPlain);
                        },
                    }
                }
            }
        })
    ;

}
