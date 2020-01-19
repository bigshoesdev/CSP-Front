export class ChangePasswordController {
    /** @ngInject */
    constructor($scope, Restangular, toastr) {

        $scope.$on('$destroy', function() {
            toastr.clear();
        });

        $scope.changePassword = function () {
            toastr.clear();
            $scope.waitResponse = true;

            Restangular
                .one('password')
                .customPUT({
                    password: $scope.newPassword
                })
                .then((resp) => {
                    toastr.info('password changed successfully');
                }, (err) => {
                    $scope.waitResponse = false;
                });
        };
    }
}

