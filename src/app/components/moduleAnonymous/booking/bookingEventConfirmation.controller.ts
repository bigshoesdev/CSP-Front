
import {ConcreteEventChangeCode} from '../../../model/rest/ConcreteEventChangeCode';
import {ConcreteEventChangeValue} from '../../../model/rest/ConcreteEventChangeValue';
import {ApiBookingService} from '../../../services/api/api-booking.service';
import {IToastrService} from 'angular-toastr';

export class BookingEventConfirmationController {
    /** @ngInject */
    constructor(eventCode: string,
                concreteEventChangeCode: ConcreteEventChangeCode,
                $scope, toastr: IToastrService, ApiBookingService: ApiBookingService, _) {

        $scope.eventChange = concreteEventChangeCode;

        const value: ConcreteEventChangeValue = concreteEventChangeCode.newValue || concreteEventChangeCode.preValue;

        $scope.fields = _.map(value, (val, key) => key);

        $scope.confirm = () => {
            $scope.waitResponse = true;

            ApiBookingService.confirmEvent(eventCode).then(() => {
                toastr.info('The changes mark as confirmed');
            }, () => {
                $scope.waitResponse = false;
            });
        };

        $scope.decline = () => {
            $scope.waitResponse = true;

            ApiBookingService.declineEvent(eventCode).then(() => {
                toastr.info('The changes mark as declined');
            }, () => {
                $scope.waitResponse = false;
            });
        };

    }
}


