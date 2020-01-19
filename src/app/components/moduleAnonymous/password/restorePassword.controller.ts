export class RestorePasswordController {
    /** @ngInject */
    constructor($scope, Restangular, $stateParams, $state: ng.ui.IStateService, toastr) {

        $scope.restoreData = {
            email: $stateParams.email,
            securityKey: $stateParams.securityKey,
            password: ''
        };

        $scope.restorePassword = function () {
            toastr.clear();
            $scope.waitResponse = true;

            Restangular
                .one('restore')
                .customPUT($scope.restoreData)
                .then((resp) => {
                    toastr.info('password changed successfully');
                    $state.go('authless.login');
                }, (err) => {
                    $scope.waitResponse = false;
                });
        };
    }
}

