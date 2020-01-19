import {LocalStorageService} from './services/storage/local-storage.service';

/** @ngInject */
export function routerConfig($stateProvider/*:angular.ui.IStateProvider*/,
                             $urlRouterProvider/*:angular.ui.IUrlRouterProvider*/) {
    $urlRouterProvider.otherwise('/');

    // For all logined users
    $stateProvider
        .state('auth', {
            views: {
                '@': {
                    templateUrl: 'app/components/dashboard/dashboard.html',
                    controller: 'DashboardController',
                    controllerAs: 'DashboardController',
                },
                'sidebar@': {
                    templateUrl: 'app/directives/sidebar/sidebar.html',
                    controller: 'SidebarController',
                    resolve: {
                        items: () => [],
                    },
                },
            },
            resolve: {
                isSignedIn: isSignedIn,
                forgotPasswordInit: forgotPasswordInit,
                modulesSelectorInit: modulesSelectorInit,
            },
        })
        .state('auth.home', {
            url: '/',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/welcome.html',
                    controller: 'WelcomeController',
                },
            },
            resolve: {
                _unselectModule: unselectModule,
            },
        })
        .state('auth.password', {
            url: '/password',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleCommon/password/changePassword.html',
                    controller: 'ChangePasswordController',
                    controllerAs: 'password',
                },
            },
            resolve: {
                _unselectModule: unselectModule,
            },
        });

    /** @ngInject */
    function isSignedIn(LocalStorageService: LocalStorageService, $q: any, $state: ng.ui.IStateService, $location) {
        const promis = $q((resolve, reject) => {

            const token = LocalStorageService.getItem('AuthKey');
            /**
             * Write current url with params for back available
             */
            const isSystem = $state.includes('authless');

            if (!isSystem) {
                LocalStorageService.setItem('urlCache', $location.url());
            }
            if (token) { resolve(token); } else { reject(); }
        });
        promis.then(null, () => {
            $state.go('authless.login');
        });
        return promis;
    }

    /** @ngInject */
    function forgotPasswordInit($window: ng.IWindowService, LocalStorageService: LocalStorageService) {
        /** Forgot password when window close. */
        $window.addEventListener('beforeunload', function () {
            if (!LocalStorageService.getItem('rememberMe')) {
                LocalStorageService.removeItem('AuthKey');
                LocalStorageService.removeItem('rememberMe');
                LocalStorageService.removeItem('currentUserProfile');
            }
        });
    }

    /** @ngInject */
    function modulesSelectorInit($rootScope, ModulesSelectorConf, AuthService, _) {
        /** Configuration for module selector */
        $rootScope.modulesSelectorConf = {
            modulesConfigs: [],
            selectedKey: null,
        }; // need for rendering

        return AuthService.getCurrentUserProfilePromise().then((profile) => {
            // show only allowed modules for current user
            const usersModulesKeys = profile.currentUser.modules;
            $rootScope.modulesSelectorConf.modulesConfigs = ModulesSelectorConf.modulesConfigs.filter((module) => _.includes(usersModulesKeys, module.key));
        });
    }

    /** @ngInject */
    function unselectModule($rootScope) {
        $rootScope.modulesSelectorConf.selectedKey = null;
    }

}
