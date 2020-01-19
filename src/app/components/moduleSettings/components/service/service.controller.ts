import {Service} from '../../../../model/rest/Service';
import {Taxes} from '../../../../model/rest/Taxes';
import {IToastrService} from "angular-toastr";
import {DialogService} from "../../../../services/dialog/dialog.service";
import {AbstractController} from "../../../../controllers/abstract.controller";

export class ServiceController extends AbstractController {
    /** @ngInject */
    constructor(service: Service,
                $scope,
                $state: ng.ui.IStateService,
                isEdit: boolean,
                taxes: Taxes[],
                _,
                Restangular,
                toastr: IToastrService,
                UnsavedChanges,
                DialogService: DialogService,
                StateStack) {

        super(initForm(event, isEdit), $state, Restangular, _, DialogService, toastr, UnsavedChanges, StateStack);

        function initForm(model, isEdit: boolean): any {
            $scope.modelParams = {
                elementTitle: 'Service',
                elementUrl: 'services',
                elementList: 'auth.settings.serviceList',
            };

            $scope.model = service;
            $scope.taxes = taxes;
            $scope.isEdit = isEdit;
            $scope.displayItem = (item: Taxes) => item && item.title;
            return $scope;
        }
    }


}
