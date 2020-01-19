import {dateFormat} from '../../../../services/app.constant';
import {AvailabilityTherapistDayRecord} from '../../../../model/rest/AvailabilityTherapistDayRecord';
import {AvailabilityTimeRecord} from '../../../../model/rest/AvailabilityTimeRecord';
import {CalendarConf} from '../../../../model/CalendarConf';
import {CalendarMode_Ns} from '../../../../model/CalendarMode';
import CalendarModeEnum = CalendarMode_Ns.CalendarMode;
import {DialogService} from '../../../../services/dialog/dialog.service';
import {Utils} from '../../../../services/utils.service';
import {ApiAvailabilityTherapistService} from '../../../../services/api/api-availability-therapist.service';
import {IToastrService}from 'angular-toastr';

declare let angular: any;

export class AvailabilityTherapistCalendarController {
    /** @ngInject */
    constructor(therapistId: number,
                dateFrom: string,
                dateTo: string,
                dayRecords: AvailabilityTherapistDayRecord[],
                isReadOnly: boolean,
                isTemplateMode: boolean,
                $scope,
                $state: ng.ui.IStateService,
                StateStack,
                // UnsavedChanges,
                DialogService: DialogService,
                toastr: IToastrService,
                ApiAvailabilityTherapistService: ApiAvailabilityTherapistService,
                Utils: Utils,
                _,
                $q) {

        let _backupModel;

        initForm();

        function initForm() {
            $scope.isTemplateMode = isTemplateMode;
            $scope.isReadOnly = isReadOnly;
            $scope.startDate = Utils.initDateFromStr(dateFrom, dateFormat);
            $scope.endDate = Utils.initDateFromStr(dateTo, dateFormat);

            let calendarConf: CalendarConf;
            if (isTemplateMode) {
                calendarConf = {
                    model: [],
                    startDate: dateFrom,
                    endDate: dateTo,
                    defaultGridMode: CalendarModeEnum.everyDay,
                    disableGridMode: true
                };
                $scope.calendarConf = calendarConf;

                $scope.title = 'Set therapist availability by template';
                _backupModel = angular.copy(calendarConf.model);
                // UnsavedChanges.register($scope, $scope.calendarConf);
            } else {
                calendarConf = {
                    model: angular.copy(dayRecords),
                    startDate: dateFrom,
                    endDate: dateTo,
                    defaultGridMode: CalendarModeEnum.dates,
                    disableGridMode: false,
                    isReadOnly: isReadOnly
                };
                $scope.calendarConf = calendarConf;

                if (isReadOnly) {
                    $scope.title = 'View therapist availability';
                } else {
                    $scope.title = 'Edit therapist availability';
                    _backupModel = angular.copy(calendarConf.model);
                    // UnsavedChanges.register($scope, $scope.calendarConf);
                }
            }

        }

        $scope.isModelChanged = () => {
            // return UnsavedChanges.isChanged();
            return true;
        };

        $scope.save = ($event) => {
            toastr.clear();
            $scope.waitResponse = true;

            DialogService.dialogConfirm({
                title: 'Confirm',
                textContent: 'This state overrides previous states of the therapists if they confirm the availability.',
                targetEvent: $event,
                cancel: 'Cancel',
                ok: 'Save'
            }).then(update).then(() => {
                toastr.info('Therapist Availability successfully installed');
                // UnsavedChanges.register($scope, $scope.calendarConf);
                $scope.waitResponse = false;
                _backupModel = angular.copy($scope.calendarConf.model);
            }, (err) => {
                $scope.waitResponse = false;
            });

        };

        $scope.cancel = () => {
            if (StateStack.canGoBack()) {
                // UnsavedChanges.deregister();
                StateStack.goBack();
            } else {
                $state.go('auth.availability.requestList');
            }
        };

        function update(): Promise<void> {
            const model: AvailabilityTherapistDayRecord[] = $scope.calendarCtrl.applyModel();
            const savedModel: AvailabilityTherapistDayRecord[] = _getChangedModel(_backupModel, model);
            if (savedModel.length === 0) {
                toastr.error('No changes detected');
                return $q.reject();
            }
            return ApiAvailabilityTherapistService.putAvailabilityTherapist(therapistId, savedModel);
        }

        /**
         * Detect changes, return only changed AvailabilityTherapistDayRecord
         */
        function _getChangedModel(prevModel: AvailabilityTherapistDayRecord[],
                                  newModel: AvailabilityTherapistDayRecord[]): AvailabilityTherapistDayRecord[] {
            const newRecords: AvailabilityTherapistDayRecord[] = newModel.slice();
            const changedRes = prevModel.reduce((changedRes: AvailabilityTherapistDayRecord[],
                                               prevRecord: AvailabilityTherapistDayRecord) => {
                const prevRecordDate = prevRecord.date;
                const foundId = _.findIndex(newRecords, (newRecord) => newRecord && newRecord.date === prevRecordDate);
                if (foundId < 0) {
                    // not found among the new -> remove
                    const emptyRecord: AvailabilityTherapistDayRecord = {
                        date: prevRecordDate,
                        timeItems: []
                    };
                    changedRes.push(emptyRecord);
                } else {
                    // found among the new
                    if (!_isDayRecordsEquals(newRecords[foundId], prevRecord)) {
                        // day record changed
                        changedRes.push(newRecords[foundId]);
                    }
                }
                return changedRes;
            }, []);

            const addedRes = newRecords.filter((newRecord: AvailabilityTherapistDayRecord) => {
                return !_.find(prevModel, (prevRecord: AvailabilityTherapistDayRecord) => {
                    return newRecord.date === prevRecord.date;
                });
            }); // filter out not changed records
            return changedRes.concat(addedRes);
        }

        function _isDayRecordsEquals(a: AvailabilityTherapistDayRecord, b: AvailabilityTherapistDayRecord) {
            return a.date === b.date
                && a.timeItems.length === b.timeItems.length
                && a.timeItems.every((aItem: AvailabilityTimeRecord) => {
                    return b.timeItems.some((bItem: AvailabilityTimeRecord) => {
                        return _isTimeRecordsEquals(aItem, bItem);
                    });
                });
        }

        function _isTimeRecordsEquals(aItem: AvailabilityTimeRecord, bItem: AvailabilityTimeRecord) {
            return bItem.type === aItem.type
                && bItem.timeStart === aItem.timeStart
                && bItem.timeEnd === aItem.timeEnd;
        }

    }

}
