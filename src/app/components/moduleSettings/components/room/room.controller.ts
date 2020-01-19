import {maxCapacity} from '../../../../services/app.constant';
import {Room} from '../../../../model/rest/Room';
import {DialogService} from '../../../../services/dialog/dialog.service';
import {IToastrService} from 'angular-toastr';
import {AbstractController} from "../../../../controllers/abstract.controller";

export class RoomController extends AbstractController {
    /** @ngInject */
    constructor(room: Room,
                isEdit: boolean,
                $scope,
                $state: ng.ui.IStateService,
                Restangular,
                _,
                toastr: IToastrService,
                DialogService: DialogService,
                UnsavedChanges,
                StateStack) {

        super(initForm(room, isEdit), $state, Restangular, _, DialogService, toastr, UnsavedChanges, StateStack);

        function initForm(room, isEdit) {
            $scope.modelParams = {
                elementTitle: 'Room',
                elementUrl: 'room',
                elementList: 'auth.settings.roomList',
            };

            $scope.isEdit = isEdit;
            $scope.model = room;

            if (isEdit) {
                UnsavedChanges.register($scope, $scope.model);
            }

            $scope.maxCapacity = maxCapacity;
            return $scope;
        }

    }
}
