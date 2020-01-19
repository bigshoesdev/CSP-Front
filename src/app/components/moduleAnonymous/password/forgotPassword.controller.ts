import {IToastrService} from 'angular-toastr';

export class ForgotPasswordController {
    /** @ngInject */
    constructor($scope, Restangular, toastr: IToastrService, $state) {

        $scope.sendRequest = function () {
            toastr.clear();
            $scope.waitResponse = true;

            Restangular
                .all('restore')
                .post({
                    email: $scope.email
                })
                .then((resp) => {
                    toastr.info('instructions sent to email ' + $scope.email);
                    $state.go('authless.restorePassword');
                }, (err) => {
                    $scope.waitResponse = false;
                });
        };
    }

}

