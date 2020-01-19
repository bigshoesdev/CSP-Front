import {Id} from '../../../model/rest/Id';
import {Therapist} from '../../../model/rest/Therapist';
import {TherapistWeek} from '../../../model/rest/TherapistWeek';
import {DialogService} from '../../../services/dialog/dialog.service';
import {ApiBookingService} from '../../../services/api/api-booking.service';
import {IToastrService} from 'angular-toastr';
import {AbstractController} from '../../../controllers/abstract.controller';

export class TherapistWeekController extends AbstractController {
    /** @ngInject */
    constructor(week: TherapistWeek,
                therapists: Therapist[],
                isEdit: boolean,
                $scope,
                _,
                $rootScope,
                $state: ng.ui.IStateService,
                $q: any,
                ApiBookingService: ApiBookingService,
                Restangular,
                toastr: IToastrService,
                DialogService: DialogService,
                RightSidebarConfig,
                UnsavedChanges,
                StateStack) {

        super(initForm(week, therapists, isEdit), $state, Restangular, _, DialogService, toastr, UnsavedChanges, StateStack);

        function initForm(week: TherapistWeek,
                          therapists: Therapist[],
                          isEdit) {

            $scope.modelParams = {
                elementTitle: 'Therapist Week',
                elementUrl: 'week',
                elementList: 'auth.booking.weekList',
            };

            $scope.isEdit = isEdit;
            $scope.model = week;

            if (isEdit) {
                UnsavedChanges.register($scope, $scope.week);
            }

            $scope.therapists = therapists;

            // $scope.$on('$destroy', function () {
            //     $rootScope.blankServiceCategory = null;
            // });

            return $scope;
        }

        function create() {
            const therapists: Therapist[] = $scope.model.therapists;
            const selectedTherapistsIds: number[] = therapists.map((therapist: Therapist) => therapist.id);
            const therapistIds = $scope.model.therapists.filter(x => x.id);
            console.log('therapists ID controller', therapistIds);
            return ApiBookingService.postWeek($scope.model.name);
        }

        function update() {
            return ApiBookingService.putWeek(week.id, $scope.model.name);
        }

        function handleIfNotUniqueName(err) {
            $scope.waitResponse = false;
            const status = err.data.status;
            if (status == 409) {
                $scope.ctrl.form.cName.$setValidity('notUniqueName', false);
            }
            return $q.reject(err);
        }

        function saveId(response: Id) {
            if (!week.id && response) {// save right after creation
                week.id = response.id;
            }
        }

        function saveTherapistsIds() {
            const therapists: Therapist[] = $scope.model.therapists;
            const selectedTherapistsIds: number[] = therapists.map((therapist: Therapist) => therapist.id);
            return ApiBookingService.postTherapistIds(week.id, selectedTherapistsIds);
        }

        function deleteWeek() {
            return ApiBookingService.deleteTherapistWeek(week.id);
        }

        $scope.save = function () {
            toastr.clear();
            $scope.waitResponse = true;

            let promis;
            if ($scope.isEdit) {
                promis = update()
                    .then(null, handleIfNotUniqueName)
                    .then(saveTherapistsIds)
                    .then(() => {
                        toastr.info('Therapist week updated successfully');
                        $scope.waitResponse = false;
                        UnsavedChanges.register($scope, $scope.week);
                        $state.go('auth.booking.weekList');
                    });

            } else {
                promis = create()
                    .then(saveId, handleIfNotUniqueName)
                    .then(saveTherapistsIds)
                    .then(() => {
                        toastr.info('Therapist week created successfully');
                        $state.go('auth.booking.weekList');
                    });
            }

            promis.then(null, (err) => {
                $scope.waitResponse = false;
            });
        };

        $scope.onNameChange = () => {
            $scope.ctrl.form.cName.$setValidity('notUniqueName', true);
        };

        $scope.delete = function ($event) {
            toastr.clear();

            DialogService
                .dialogConfirm({
                    title: 'Delete Therapist Week',
                    textContent: 'Are you sure to delete Therapist Week "' + $scope.model.name + '"?',
                    targetEvent: $event,
                    cancel: 'Cancel',
                    ok: 'Delete',
                })
                .then(() => {
                    $scope.waitResponse = true;

                    deleteWeek()
                        .then(() => {
                            toastr.info('therapist week deleted successfully');
                            UnsavedChanges.deregister();
                            $state.go('auth.booking.weekList');
                        }, () => {
                            $scope.waitResponse = false;
                        });
                });
        };

        $scope.isUnsaved = () => {
            return UnsavedChanges.isChanged();
        };

    }
}

