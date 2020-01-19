
import {LocalStorageService} from '../../../services/storage/local-storage.service';
import {LoginRequest} from '../../../model/rest/LoginRequest';
import {LoginRsponse} from '../../../model/rest/LoginRsponse';
import {IToastrService} from 'angular-toastr';


export class LoginController {

    /** @ngInject */
    constructor($scope,
                Restangular,
                $location,
                LocalStorageService: LocalStorageService,
                $state: ng.ui.IStateService,
                toastr: IToastrService,
                moment, $element) {

        $scope.$on('$destroy', function () {
            toastr.clear();
        });

        $scope.rememberMe = true;

        $element.find('form').on('keypress', (e) => {
            if (e.which === 13) {// enter key
                signIn();
            }
        });

        $scope.signIn = signIn;
        function signIn() {
            if (!$scope.username || $scope.username.length === 0) {
                toastr.error('Please enter valid Email');
                return;
            }
            if (!$scope.password || $scope.password.length === 0) {
                toastr.error('Please enter valid Password');
                return;
            }

            $scope.waitResponse = true;

            const bodyObj: LoginRequest = {
                username: $scope.username,
                password: $scope.password
            };

            Restangular
                .all('login')
                .post(bodyObj)
                .then((response: LoginRsponse) => {
                    toastr.clear();

                    const token = response.token;

                    if (token) {
                        // let defaults = {expires: moment().add(1, 'w').toDate()};// lifetime = one week

                        LocalStorageService.setItem('AuthKey', token/*, defaults*/);

                        if ($scope.rememberMe) {
                            LocalStorageService.setItem('rememberMe', $scope.rememberMe/*, defaults*/);
                        } else {
                            LocalStorageService.removeItem('rememberMe');
                        }
                    }
                    const url = LocalStorageService.getItem('urlCache');
                    url ?
                        $location.url(url) :
                    $state.go('auth.home');
                }, (err) => {
                    $scope.waitResponse = false;
                    $scope.signInForm.uPassword.$setValidity('wrongPassword', false);
                });

        }

        $scope.onChangePassword = () => {
            $scope.signInForm.uPassword.$setValidity('wrongPassword', true);
        };

    }

}
