import {DialogService} from '../../../../services/dialog/dialog.service';
import {IToastrService} from 'angular-toastr';
import {Taxes} from '../../../../model/rest/Taxes';
import {AbstractController} from "../../../../controllers/abstract.controller";

export class TaxesController extends AbstractController  {
    /** @ngInject */
    constructor(isEdit: boolean,
                tax: Taxes,
                _,
                $scope,
                $state: ng.ui.IStateService,
                Restangular,
                toastr: IToastrService,
                DialogService: DialogService,
                UnsavedChanges,
                StateStack) {

        super(initForm(),$state, Restangular, _, DialogService, toastr, UnsavedChanges, StateStack);

        function initForm() {
            $scope.modelParams = {
                elementTitle: 'Tax',
                elementUrl: 'taxes',
                elementList: 'auth.settings.taxesList',
            };

            $scope.isEdit = isEdit;
            $scope.model = tax;

            if (isEdit) {
                UnsavedChanges.register($scope, $scope.model);
            }

            return $scope;
        }
    }
}
