import {dateFormat} from '../../app.constant';
import {Moment} from '../../../../../bower_components/moment/moment';
import {AvailabilityTherapistDayRecord} from '../../../model/rest/AvailabilityTherapistDayRecord';
import {CalendarMode_Ns} from '../../../model/CalendarMode';
import CalendarModeEnum = CalendarMode_Ns.CalendarMode;
import {Utils} from '../../utils.service';

export class DialogAvailabilityTimeRecordController {
    /** @ngInject */
    constructor($mdDialog, $scope, Utils: Utils, moment,
                // Below values injected from locals:
                dayRecord: AvailabilityTherapistDayRecord,
                isEdit = true,
                calendarMode: CalendarModeEnum = CalendarModeEnum.dates) {

        $scope.isEdit = isEdit;
        $scope.dayRecord = dayRecord;
        const timeItem = dayRecord.timeItems[0];
        $scope.timeItem = timeItem;

        $scope.date = Utils.initDateFromStr(dayRecord.date, dateFormat);
        const startOfDay = moment().startOf('day');
        $scope.timeStart = moment(startOfDay).add(timeItem.timeStart, 'm').toDate();
        $scope.timeEnd = moment(startOfDay).add(timeItem.timeEnd, 'm').toDate();
        $scope.dateToString = (date) => Utils.dateToFormat(date, dateFormat);
        $scope.minOfDay = (date) => {
            const time: Moment = moment(date);
            const startOfDay: Moment = moment(time).startOf('day');
            return time.diff(startOfDay, 'm');
        };

        $scope.showDate = calendarMode === CalendarModeEnum.dates;

        $scope.cancel = () => {
            $mdDialog.cancel();
        };

        $scope.save = () => {
            $mdDialog.hide($scope.dayRecord);
        };

        $scope.remove = () => {
            $mdDialog.hide(null);
        };


    }

}
