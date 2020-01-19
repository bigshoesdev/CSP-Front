
import {RemoteServerSettings} from '../../../../model/rest/RemoteServerSettings';
import {IToastrService} from 'angular-toastr';

export class RemoteServerController {
    /** @ngInject */
    constructor(settings: RemoteServerSettings,
                $scope,
                Restangular,
                toastr: IToastrService,
                UnsavedChanges,
                _) {

        $scope.settings = settings;
        UnsavedChanges.register($scope, $scope.settings);

        $scope.updatePeriods = [{
            title: '30 m',
            value: 30
        }, {
            title: '1 h',
            value: 60
        }, {
            title: '12 h',
            value: 12 * 60
        }, {
            title: '1 d',
            value: 24 * 60
        }];
        $scope.updatePeriod = _.find($scope.updatePeriods, (p) => p.value <= $scope.settings.updateTime);
        $scope.displayPeriod = (p) => p && p.title;
        $scope.updateUpdateTime = (updatePeriod) => {
            if (updatePeriod) {
                settings.updateTime = updatePeriod.value;
            }
        };

        $scope.update = function () {
            $scope.waitResponse = true;

            Restangular
                .all('remoteServer/update')
                .post()
                .then((result) => {
                    toastr.info(result.message);
                    $scope.waitResponse = false;
                }, (err) => {
                    $scope.waitResponse = false;
                });
        };

        $scope.save = function () {
            $scope.waitResponse = true;

            Restangular
                .all('remoteServer/settings')
                .post($scope.settings)
                .then((result) => {
                    toastr.info(result.message);
                    $scope.waitResponse = false;
                    UnsavedChanges.register($scope, $scope.settings);
                }, (err) => {
                    $scope.waitResponse = false;
                });
        };

    }
}
