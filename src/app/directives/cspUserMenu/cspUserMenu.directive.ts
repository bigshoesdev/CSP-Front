
/** @ngInject */
export function cspUserMenu(_, AuthService, $state: ng.ui.IStateService) {
    return {
        templateUrl: 'app/directives/cspUserMenu/cspUserMenu.html',
        restrict: 'AE',
        link: postLink
    };

    function postLink(scope, iElement, iAttrs) {

        AuthService
            .getCurrentUserProfilePromise()
            .then((profile) => {
                scope.currentUser = profile.currentUser;
            });

        scope.logout = function () {
            AuthService.logout().then((resp) => {
                $state.go('authless.login');
            }, () => {
                $state.go('authless.login');
            });
        };

    }
}


