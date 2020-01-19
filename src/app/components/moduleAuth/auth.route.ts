import {checkModuleAccess, getUser} from '../../services/route.generators';
import {User} from '../../model/rest/User';

/** @ngInject */
export function authRouterConfig($stateProvider: ng.ui.IStateProvider) {

    // Auth module
    $stateProvider
        .state('auth.auth', {
            url: '/auth',
            views: {
                'sidebar@': {
                    templateUrl: 'app/directives/sidebar/sidebar.html',
                    controller: 'SidebarController',
                    resolve: {
                        items: (Sidebars) => Sidebars.auth
                    }
                },
                'main@auth': {
                    template: '<menu-button></menu-button><h1>Auth module</h1>'
                }
            },
            resolve: {
                checkModuleAccess: checkModuleAccess('AUTH')
            }
        });

    // Users
    $stateProvider
        .state('auth.auth.userList', {
            url: '/users',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleAuth/user/userList.html',
                    controller: 'UserListController'
                }
            }
        })
        .state('auth.auth.userNew', {
            url: '/users/new',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleAuth/user/user.html',
                    controller: 'UserController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isEdit: () => false,
                        user: function (): User {
                            return {
                                id: null,
                                password: '',
                                name: '',
                                email: '',
                                locked: false,
                                modules: []
                            };
                        }
                    }
                }
            }
        })
        .state('auth.auth.userShow', {
            url: '/users/show/{userId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleAuth/user/user.html',
                    controller: 'UserController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isEdit: () => false,
                        user: getUser,
                    }
                }
            }
        })
        .state('auth.auth.userEdit', {
            url: '/users/edit/{userId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleAuth/user/user.html',
                    controller: 'UserController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isEdit: () => true,
                        user: getUser,
                    }
                }
            }
        });

}
