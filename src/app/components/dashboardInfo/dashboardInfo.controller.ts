import {IToastrService} from "angular-toastr";
import {DialogService} from "../../services/dialog/dialog.service";

declare const angular: any;

export class DashboardInfoController {
    /** @ngInject */
    constructor($scope,
                model: any,
                $state: ng.ui.IStateService,
                Restangular,
                _,
                DialogService: DialogService,
                toastr: IToastrService,
                StateStack) {

        $scope.model = model;
        $scope.title = model.name || model.title || 'Detailed information';
        $scope.cancel = function () {
            if (StateStack.canGoBack()) {
                StateStack.goBack();
            } else {
                $state.go('auth.settings.serviceList');
            }
        };
    }

}