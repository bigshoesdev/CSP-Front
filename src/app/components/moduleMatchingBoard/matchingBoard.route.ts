import {checkModuleAccess, } from '../../services/route.generators';
import {ClientMatchingConfirmation} from '../../model/rest/ClientMatchingConfirmation';
import {ApiMatchingBoardService} from '../../services/api/api-matching-board.service';
import {DataCacheService} from '../../services/storage/data-cache.service';

/** @ngInject */
export function matchingBoardRouterConfig($stateProvider: ng.ui.IStateProvider) {

    // Suggested Services
    $stateProvider
        .state('auth.matchingBoard', {
            url: '/matchingBoard',
            views: {
                'sidebar@': {
                    templateUrl: 'app/directives/sidebar/sidebar.html',
                    controller: 'SidebarController',
                    resolve: {
                        items: (Sidebars) => Sidebars.matchingBoard
                    }
                },
                'main@auth': {
                    template: '<menu-button></menu-button><h1>Matching Board</h1>'
                }
            },
            resolve: {
                checkModuleAccess: checkModuleAccess('MATCHING_BOARD')
            }
        });

    // Matching Board
    $stateProvider
        .state('auth.matchingBoard.table', {
            url: '/table',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleMatchingBoard/components/matchingBoard/matchingBoard.html',
                    controller: 'MatchingBoardController',
                    controllerAs: 'MatchingBoardController',
                    resolve: {
                        sessions: (DataCacheService: DataCacheService) => DataCacheService.getSessions(),
                        therapists: (DataCacheService: DataCacheService) => DataCacheService.getTherapists(),
                        rooms: (DataCacheService: DataCacheService) => DataCacheService.getRooms(),
                        categories: (DataCacheService: DataCacheService) => DataCacheService.getCategories(),
                        services: (DataCacheService: DataCacheService) => DataCacheService.getServices(),
                        restrictions: (DataCacheService: DataCacheService) => DataCacheService.getRestrictions(),
                        allClients: (DataCacheService: DataCacheService) => DataCacheService.getClients(), // just for caching
                    }
                }
            }
        })
        .state('auth.matchingBoard.table.daily', {
            url: '/daily',
            views: {
                'matchingBoardModeView@auth.matchingBoard.table': {
                    templateUrl: 'app/components/moduleMatchingBoard/components/mbDate/mbDate.html',
                    controller: 'MbDateController',
                    controllerAs: 'ctrl'
                }
            }
        })
        .state('auth.matchingBoard.table.weekly', {
            url: '/weekly',
            views: {
                'matchingBoardModeView@auth.matchingBoard.table': {
                    templateUrl: 'app/components/moduleMatchingBoard/components/mbDatesWeek/mbDatesWeek.html',
                    controller: 'MbDatesWeekController',
                    controllerAs: 'ctrl'
                }
            }
        })
        .state('auth.matchingBoard.table.interval', {
            url: '/interval',
            views: {
                'matchingBoardModeView@auth.matchingBoard.table': {
                    templateUrl: 'app/components/moduleMatchingBoard/components/mbDatesInterval/mbDatesInterval.html',
                    controller: 'MbDatesIntervalController',
                    controllerAs: 'ctrl'
                }
            }
        })
        .state('auth.matchingBoard.confirmationList', {
            url: '/confirmations',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleMatchingBoard/components/mbConfirmationList/mbConfirmationList.html',
                    controller: 'MbConfirmationListController',
                    controllerAs: 'ctrl',
                    resolve: {
                        sessions: (DataCacheService: DataCacheService) => DataCacheService.getSessions()
                    }
                }
            }
        })
        .state('auth.matchingBoard.confirmationView', {
            url: '/confirmation/session/{sessionId}/client/{clientId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleMatchingBoard/components/mbConfirmation/mbConfirmation.html',
                    controller: 'MbConfirmationController',
                    controllerAs: 'ctrl',
                    resolve: {
                        services: (DataCacheService: DataCacheService) => DataCacheService.getServices(),
                        sessions: (DataCacheService: DataCacheService) => DataCacheService.getSessions(),
                        clients: (DataCacheService: DataCacheService) => DataCacheService.getClients(),
                        sessionId: ($stateParams) => $stateParams.sessionId,
                        clientId: ($stateParams) => $stateParams.clientId,
                        confirmationData: ($stateParams, ApiMatchingBoardService: ApiMatchingBoardService): Promise<ClientMatchingConfirmation> =>
                            ApiMatchingBoardService.getConfirmation($stateParams.sessionId, $stateParams.clientId),
                    }
                }
            }
        })
    ;


}
