import {dateFormat} from '../../../../services/app.constant';
import {DialogService, IDialogInputConf} from '../../../../services/dialog/dialog.service';
import {AvailabilityRequest} from '../../../../model/rest/AvailabilityRequest';
import {Therapist} from '../../../../model/rest/Therapist';
import {AvailabilityTherapistRequest} from '../../../../model/rest/AvailabilityTherapistRequest';
import {AvailabilityStatus_Ns} from '../../../../model/rest/AvailabilityStatus';
import AvailabilityStatus = AvailabilityStatus_Ns.AvailabilityStatus;
import {Utils} from '../../../../services/utils.service';
import {IToastrService}from 'angular-toastr';

declare let angular: any;

export class MyRequestController {
    /** @ngInject */
    constructor(request: AvailabilityRequest,
                therapists: Therapist[],
                $scope,
                $state: ng.ui.IStateService,
                StateStack,
                Restangular,
                toastr: IToastrService,
                DialogService: DialogService,
                Utils: Utils) {

        view();

        initForm();

        function initForm() {
            $scope.request = request;

            $scope.isReadOnly = request.therapistsRequests.some((request: AvailabilityTherapistRequest) => request.status === AvailabilityStatus.approved);

            $scope.startDate = Utils.initDateFromStr(request.startDate, dateFormat);
            $scope.endDate = Utils.initDateFromStr(request.endDate, dateFormat);

            $scope.id2NameMap = therapists.reduce((map, therapist) => {
                map[therapist.id] = therapist.name;
                return map;
            }, []);
        }

        function approve() {
            return Restangular
                .one('availability/request', request.id)
                .one('approve')
                .post();
        }

        function decline(message: string) {
            return Restangular
                .one('availability/request', request.id)
                .post('decline', {
                    message: message
                });
        }

        function view() {
            // set request as viewed
            return Restangular
                .one('availability/request', request.id)
                .one('view')
                .post();
        }

        function updateRequest() {
            return Restangular
                .one('availability/request', request.id)
                .get()
                .then((o) => o.plain())
                .then((request) => {
                    $scope.request = request;
                });
        }

        $scope.approve = function ($event) {
            toastr.clear();
            $scope.waitResponse = true;

            DialogService.dialogConfirm({
                title: 'Approve request',
                textContent: 'Are you sure to APPROVE this request? The changes will take effect immediately.',
                targetEvent: $event,
                cancel: 'Cancel',
                ok: 'Approve'
            })
                .then(approve)
                .then(() => {
                    toastr.info('Request approved successfully');
                    $scope.waitResponse = false;
                    $scope.isReadOnly = true;
                    updateRequest();
                }, () => {
                    $scope.waitResponse = false;
                });
        };

        $scope.decline = function ($event) {
            toastr.clear();
            $scope.waitResponse = true;

            DialogService.dialogInput({
                title: 'Decline request',
                textContent: 'Are you sure to DECLINE this request? The changes will take effect immediately.',
                inputLabel: 'Please specify the reason',
                inputText: '',
                targetEvent: $event,
                btnCancel: 'Cancel',
                btnHide: 'Decline'
            })
                .then((conf: IDialogInputConf) => {
                    return conf.inputText;
                })
                .then(decline)
                .then(() => {
                    toastr.info('Request declined successfully');
                    $scope.waitResponse = false;
                    updateRequest();
                }, () => {
                    $scope.waitResponse = false;
                });
        };

        $scope.cancel = function () {
            if (StateStack.canGoBack()) {
                StateStack.goBack();
            } else {
                $state.go('auth.therapist.availability.requestList');
            }
        };

    }
}
