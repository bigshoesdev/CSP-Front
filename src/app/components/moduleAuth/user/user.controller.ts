import {modulesKeys} from '../../../services/app.constant';
import {User} from '../../../model/rest/User';
import {DialogService} from '../../../services/dialog/dialog.service';
import {IToastrService} from 'angular-toastr';
import {AbstractController} from "../../../controllers/abstract.controller";

export class UserController extends AbstractController {
    /** @ngInject */
    constructor(user: User,
                isEdit: boolean,
                $scope,
                $state: ng.ui.IStateService,
                Restangular,
                _,
                toastr: IToastrService,
                DialogService: DialogService,
                UnsavedChanges,
                StateStack) {

        super(initForm(), $state, Restangular, _, DialogService, toastr, UnsavedChanges, StateStack);

        function initForm() {

            $scope.modelParams = {
                elementTitle: 'User',
                elementUrl: 'user',
                elementList: 'auth.auth.userList',
            };

            $scope.isEdit = isEdit;

            user.password = ''; // don't save hash to not break user
            $scope.model = user;

            if (isEdit) {
                UnsavedChanges.register($scope, $scope.user);
            }
            $scope.modules = modulesKeys;
            return $scope;
        }

    }
}
