import {checkModuleAccess, getSession} from '../../services/route.generators';
import {Session} from '../../model/rest/Session';
import {DataCacheService} from '../../services/storage/data-cache.service';

/** @ngInject */
export function sessionsRouterConfig($stateProvider: ng.ui.IStateProvider) {

    // Sessions module
    $stateProvider
        .state('auth.sessions', {
            url: '/sessions',
            views: {
                'sidebar@': {
                    templateUrl: 'app/directives/sidebar/sidebar.html',
                    controller: 'SidebarController',
                    resolve: {
                        items: (Sidebars) => Sidebars.sessions
                    }
                },
                'main@auth': {
                    template: '<menu-button></menu-button><h1>Sessions module</h1>'
                }
            },
            resolve: {
                checkModuleAccess: checkModuleAccess('SESSIONS')
            }
        });


    // Sessions
    $stateProvider
        .state('auth.sessions.sessionList', {
            url: '/sessions',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSessions/components/sessionList/sessionList.html',
                    controller: 'SessionListController'
                }
            }
        })
        .state('auth.sessions.archiveSessionList', {
            url: '/sessions/archive',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSessions/components/sessionList/sessionList.html',
                    controller: 'ArchiveSessionListController'
                }
            }
        })
        .state('auth.sessions.sessionNew', {
            url: '/sessions/new',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSessions/components/session/session.html',
                    controller: 'SessionController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isEdit: () => false,
                        session: ($rootScope): Session => {
                            return {
                                id: null,
                                name: '',
                                startDate: '',
                                endDate: '',
                                clients: [],
                                therapists: []
                            };
                        },
                        therapists: (DataCacheService: DataCacheService) => DataCacheService.getTherapists()
                    }
                }
            }
        })
        .state('auth.sessions.sessionShow', {
            url: '/sessions/show/{sessionId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSessions/components/session/session.html',
                    controller: 'SessionController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isEdit: () => false,
                        session: getSession,
                        therapists: (DataCacheService: DataCacheService) => DataCacheService.getTherapists()
                    }
                }
            }
        })
        .state('auth.sessions.sessionEdit', {
            url: '/sessions/edit/{sessionId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSessions/components/session/session.html',
                    controller: 'SessionController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isEdit: () => true,
                        session: getSession,
                        therapists: (DataCacheService: DataCacheService) => DataCacheService.getTherapists()
                    }
                }
            }
        })
        .state('auth.sessions.sessionView', {
            url: '/sessions/view/{sessionId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSessions/components/sessionView/sessionView.html',
                    controller: 'SessionViewController',
                    controllerAs: 'ctrl',
                    resolve: {
                        session: getSession
                    }
                }
            }
        });

}
