import {dateFormat} from '../../../../services/app.constant';
import {Id} from '../../../../model/rest/Id';
import {Therapist} from '../../../../model/rest/Therapist';
import {AvailabilityRequest} from '../../../../model/rest/AvailabilityRequest';
import {AvailabilityTherapistRequest} from '../../../../model/rest/AvailabilityTherapistRequest';
import {Session} from '../../../../model/rest/Session';
import {AvailabilityStatus_Ns} from '../../../../model/rest/AvailabilityStatus';
import {AvailabilityTherapistDayRecord} from '../../../../model/rest/AvailabilityTherapistDayRecord';
import {CalendarConf} from '../../../../model/CalendarConf';
import {CalendarMode_Ns} from '../../../../model/CalendarMode';
import AvailabilityStatus = AvailabilityStatus_Ns.AvailabilityStatus;
import CalendarModeEnum = CalendarMode_Ns.CalendarMode;
import {DialogService} from '../../../../services/dialog/dialog.service';
import {Utils} from '../../../../services/utils.service';
import * as restangular from 'restangular';
import {IToastrService}from 'angular-toastr';
import {AbstractController} from "../../../../controllers/abstract.controller";

interface ITherapistsCheckItem {
    checked: boolean;
    message: string;
    status: AvailabilityStatus;
    therapist: Therapist;
}

declare let angular: any;

export class RequestController extends AbstractController {
    /** @ngInject */
    constructor(request: AvailabilityRequest,
                therapists: Therapist[],
                sessions: Session[],
                isEdit: boolean,
                isReadOnly: boolean,
                $scope,
                $state: ng.ui.IStateService,
                Restangular: restangular.IService,
                toastr: IToastrService,
                DialogService: DialogService,
                UnsavedChanges,
                moment,
                Utils: Utils,
                $timeout: ng.ITimeoutService,
                _,
                StateStack) {

        super(initForm(), $state, Restangular, _, DialogService, toastr, UnsavedChanges, StateStack);

        function initForm() {
            $scope.modelParams = {
                elementTitle: 'Request',
                elementUrl: 'availability/request',
                elementList: 'auth.availability.requestList',
            };

            $scope.isEdit = isEdit;
            $scope.isReadOnly = isReadOnly;
            $scope.model = request;
            $scope.showTherapistCalendar = {};
            /**
             * Try to define default session of our request
             */
            const ses = sessions;
            if (ses) {
                for (const session of ses) {
                    let thatSession: number = 0;
                    session.therapists.forEach((rapist: Therapist) => {
                        const requestRapists: AvailabilityTherapistRequest[] = request.therapistsRequests;
                        requestRapists.forEach((RequestRapist: AvailabilityTherapistRequest) => {
                            if (RequestRapist.therapistId == rapist.id) { thatSession++; }
                        });
                    });
                    if (thatSession == request.therapistsRequests.length) {
                        $scope.session = session;
                        $timeout(() => {
                                $scope.applySession(session);
                            }
                        );
                        break;
                    }
                } // end sessions for
            }

            initFormModel();

            if (isEdit) {
                UnsavedChanges.register($scope, $scope.formModel);
            }
            // init sessions
            if (!isReadOnly) {
                Utils.getAllCollection('sessions').then((sessions: Session[]) => {
                    $scope.sessions = sessions;
                });
            }

            return $scope;
        }

        $scope.displayItem = (item) => item && item.name;

        let currentSessionId = -1;
        $scope.applySession = (session: Session) => {
            if (!session || currentSessionId == session.id) {
                return;
            } else {
                currentSessionId = session.id;
            }

            $scope.formModel.startDate = moment(session.startDate, dateFormat).toDate() || new Date();
            $scope.formModel.endDate = moment(session.endDate, dateFormat).toDate() || new Date();
            const currentList: ITherapistsCheckItem[] = $scope.formModel.therapistsCheckList;

            $scope.formModel.therapistsCheckList = session.therapists.map((therapist: Therapist): ITherapistsCheckItem => {
                let applyItem: ITherapistsCheckItem;
                currentList.forEach((currentRapist: ITherapistsCheckItem) => {
                    if (currentRapist.therapist.id == therapist.id) {
                        applyItem = currentRapist;
                    }
                });

                return applyItem ||
                    {
                        checked: false,
                        message: '',
                        status: null,
                        therapist: therapist
                    };
            });
        };

        $scope.isAllChecked = () => {
            const therapistsCheckList: ITherapistsCheckItem[] = $scope.formModel.therapistsCheckList;
            return therapistsCheckList.length
                && therapistsCheckList.every((therapistsCheckItem) => therapistsCheckItem.checked);
        };

        $scope.isSomeChecked = () => {
            const therapistsCheckList: ITherapistsCheckItem[] = $scope.formModel.therapistsCheckList;
            return therapistsCheckList.length
                && therapistsCheckList.some((therapistsCheckItem) => therapistsCheckItem.checked);
        };

        $scope.isAllCheckedIndeterminate = () => {
            const therapistsCheckList: ITherapistsCheckItem[] = $scope.formModel.therapistsCheckList;
            return therapistsCheckList.some((therapistsCheckItem) => therapistsCheckItem.checked)
                && therapistsCheckList.some((therapistsCheckItem) => !therapistsCheckItem.checked);
        };

        $scope.toggleAll = () => {
            const value = !$scope.isAllChecked();
            $scope.formModel.therapistsCheckList.forEach((therapistsCheckItem: ITherapistsCheckItem) => {
                therapistsCheckItem.checked = value;
            });
        };

        function initFormModel() {

            return $scope.formModel = {
                startDate: Utils.initDateFromStr(request.startDate) || new Date(),
                endDate: Utils.initDateFromStr(request.endDate) || new Date(),
                therapistsCheckList: request.therapistsRequests.map((therapistsRequest: AvailabilityTherapistRequest): ITherapistsCheckItem => {
                    const therapistId = therapistsRequest.therapistId;
                    const therapist: Therapist = _.find(therapists, (therapist: Therapist): boolean => {
                        return therapist.id == therapistId;
                    });
                    return {
                        checked: true,
                        therapist: therapist,
                        message: therapistsRequest.message,
                        status: therapistsRequest.status
                    };
                }),
                messageForAll: ''
            };
        }

        function _updateModelToSave(request) {
            request.startDate = Utils.dateToFormat($scope.formModel.startDate);
            request.endDate = Utils.dateToFormat($scope.formModel.endDate);

            $scope.model.therapistsRequests = $scope.formModel.therapistsCheckList
                .reduce((result: AvailabilityTherapistRequest[], therapistsCheckItem: ITherapistsCheckItem) => {
                    if (therapistsCheckItem.checked) {
                        const availabilityTherapistRequest: AvailabilityTherapistRequest = {
                            therapistId: therapistsCheckItem.therapist.id,
                            message: therapistsCheckItem.message || $scope.formModel.messageForAll,
                            status: AvailabilityStatus.created
                        };
                        result.push(availabilityTherapistRequest);
                    }
                    return result;
                }, []);

            return request;
        }

        function update() {
            return Restangular
                .one('availability/request', request.id)
                .customPUT(_updateModelToSave($scope.model));
        }

        function create() {
            return Restangular
                .all('availability/request')
                .post(_updateModelToSave($scope.model));
        }

        function saveId(response: Id) {
            if (!$scope.model.id && response) {// save right after creation
                $scope.model.id = response.id;
            }
        }

        $scope.save = function ($event) {
            toastr.clear();
            $scope.waitResponse = true;

            DialogService.dialogConfirm({
                title: 'Confirm Request',
                textContent: 'This state overrides previous states of the therapists if they confirm the availability.',
                targetEvent: $event,
                cancel: 'Cancel',
                ok: 'Save'
            }).then(() => {
                if (isEdit) {
                    return update()
                        .then(() => {
                            toastr.info('request updated successfully');
                            $scope.waitResponse = false;
                            UnsavedChanges.register($scope, $scope.model);
                            $state.go('auth.availability.requestList');
                        });

                } else {
                    return create()
                        .then(saveId)
                        .then(() => {
                            toastr.info('request created successfully');
                            $state.go('auth.availability.requestList');
                        });
                }
            }).then(null, (err) => {
                $scope.waitResponse = false;
            });
        };

        $scope.cancel = function () {
            if (!isEdit && StateStack.canGoBack()) {
                StateStack.goBack();
            } else {
                $state.go('auth.availability.requestList');
            }
        };

        $scope.delete = function ($event) {
            toastr.clear();

            DialogService
                .dialogConfirm({
                    title: 'Delete Request',
                    textContent: 'Are you sure to delete Request ' + $scope.model.id + '?',
                    targetEvent: $event,
                    cancel: 'Cancel',
                    ok: 'Delete'
                })
                .then(() => {
                    $scope.waitResponse = true;

                    remove()
                        .then((result) => {
                            toastr.info('request deleted successfully');
                            UnsavedChanges.deregister();
                            $state.go('auth.settings.requestList');
                        }, (err) => {
                            $scope.waitResponse = false;
                        });
                });

        };

        $scope.isUnsaved = () => {
            return UnsavedChanges.isChanged();
        };

        // $scope.dateToFormat = (date) => Utils.dateToFormat(date);

        $scope.offerTherapistAvailability = (therapistId, $event) => {

            if (!$scope.showTherapistCalendar[therapistId]) {
                _.forEach($scope.showTherapistCalendar, (isShow, therapistId, collection) => {
                    collection[therapistId] = false;
                });
                $scope.showTherapistCalendar[therapistId] = true;
            } else {
                $scope.showTherapistCalendar[therapistId] = false;
            }

            const calendarConf: CalendarConf = {
                model: [],
                startDate: Utils.dateToFormat($scope.formModel.startDate),
                endDate: Utils.dateToFormat($scope.formModel.endDate),
                defaultGridMode: CalendarModeEnum.dates,
                isReadOnly: isReadOnly
            };
            $scope.calendarConf = calendarConf;
        };

        $scope.addTimeInfo = (therapistId) => {
            const model: AvailabilityTherapistDayRecord[] = $scope.calendarCtrl.applyModel();
            putRequestTimeInfo(therapistId, model);
        };
        $scope.discardTimeInfo = () => {
            $scope.calendarCtrl.resetModel();
        };

        function remove() {
            return Restangular
                .one('availability/request', request.id)
                .remove();
        }

        function putRequestTimeInfo(therapistId, dayRecords: AvailabilityTherapistDayRecord[]) {
            const requestId = $scope.model.id;
            // PUT /availability/request/{requestId}/therapists/{therapistId}
            return Restangular
                .one('availability/request', requestId)
                .one('therapists', therapistId)
                .customPUT(dayRecords);
        }

    }
}
