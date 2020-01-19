import {AvailabilityHistoryRecord} from '../../../../model/rest/AvailabilityHistoryRecord';
import {AvailabilityType_Ns} from '../../../../model/rest/AvailabilityType';
import {CalendarService} from '../../../../services/calendar.service';

declare let angular: any;

export class AvailabilityTherapistHistoryRecordController {


    /** @ngInject */
    constructor(therapistId: number,
                recordId: number,
                availabilityHistoryRecord: AvailabilityHistoryRecord,
                $scope, CalendarService: CalendarService) {

        $scope.record = availabilityHistoryRecord;

        $scope.convertMin2Time = (min) => CalendarService.dayMinutes2time(min);

        $scope.availabilityType2String = (type) => AvailabilityType_Ns.toString(type);
    }

}

