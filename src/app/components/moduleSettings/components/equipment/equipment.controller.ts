import {maxCapacity} from '../../../../services/app.constant';
import {Equipment} from '../../../../model/rest/Equipment';
import {DialogService} from '../../../../services/dialog/dialog.service';
import {IToastrService}from 'angular-toastr';
import {AbstractController} from "../../../../controllers/abstract.controller";

export class EquipmentController extends AbstractController{
    /** @ngInject */
    constructor(equipment: Equipment,
                isEdit: boolean,
                $scope,
                _,
                $state: ng.ui.IStateService,
                Restangular,
                toastr: IToastrService,
                DialogService: DialogService,
                UnsavedChanges,
                StateStack) {

        super(initForm(), $state, Restangular, _, DialogService, toastr, UnsavedChanges, StateStack);

        function initForm() {
            $scope.modelParams = {
                elementTitle: 'Equipment',
                elementUrl: 'equipment',
                elementList: 'auth.settings.equipmentList',
            };

            $scope.isEdit = isEdit;
            $scope.model = equipment;
            if (isEdit) {
                UnsavedChanges.register($scope, $scope.equipment);
            }

            $scope.maxCapacity = maxCapacity;
            return $scope;
        }

    }
}
