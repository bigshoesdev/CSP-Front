import {DialogService} from '../../../../services/dialog/dialog.service';
import {IToastrService} from 'angular-toastr';
import {Event} from '../../../../model/rest/Event';
import {Taxes} from '../../../../model/rest/Taxes';
import {EventTypes} from '../../../../model/rest/EventTypes';
import {LoDashStatic} from '@types/lodash';
import {AbstractController} from "../../../../controllers/abstract.controller";

declare let angular: any;

export class EventController extends AbstractController {
    /** @ngInject */
    constructor(isEdit: boolean,
                event: Event,
                taxes: Taxes[],
                eventTypes: EventTypes[],
                $scope: any,
                _: LoDashStatic,
                $state: ng.ui.IStateService,
                Restangular,
                toastr: IToastrService,
                DialogService: DialogService,
                UnsavedChanges,
                StateStack) {
        super(initForm(event, isEdit), $state, Restangular, _, DialogService, toastr, UnsavedChanges,StateStack);

        function initForm(event, isEdit): any {
            $scope.modelParams = {
                elementTitle: 'Event',
                elementUrl: 'events',
                elementList: 'auth.settings.eventList',
            };

            $scope.title = isEdit ? event.name : 'New Event';
            $scope.model = event;
            $scope.isEdit = isEdit;
            $scope.taxes = taxes;
            $scope.eventTypes = eventTypes;

            if (isEdit) {
                UnsavedChanges.register($scope, $scope.room);
            }

            $scope.displayItem = (item: Taxes) => item && item.title;
            return $scope;
        }

    }
}
