import {DialogService} from '../../../../services/dialog/dialog.service';
import {IToastrService} from 'angular-toastr';
import {EventTypes} from '../../../../model/rest/EventTypes';
import {AbstractController} from "../../../../controllers/abstract.controller";

export class EventTypesController extends AbstractController {
    /** @ngInject */
    constructor(isEdit: boolean,
                eventType: EventTypes,
                $scope,
                $state: ng.ui.IStateService,
                _,
                Restangular,
                toastr: IToastrService,
                DialogService: DialogService,
                UnsavedChanges,
                StateStack) {

        super(initForm(eventType, isEdit), $state, Restangular, _, DialogService, toastr, UnsavedChanges, StateStack);

        function initForm(room, isEdit) {
            $scope.modelParams = {
                elementTitle: 'Event type',
                elementUrl: 'eventTypes',
                elementList: 'auth.settings.eventTypesList',
            };

            $scope.isEdit = isEdit;
            $scope.model = eventType;

            if (isEdit) {
                UnsavedChanges.register($scope, eventType);
            }

            return $scope;
        }
    }
}
