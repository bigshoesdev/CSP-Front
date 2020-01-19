import {Moment} from '../../../../../../bower_components/moment/moment';
import {Utils} from '../../../../services/utils.service';


export class MyAvailabilityController {
    /** @ngInject */
    constructor($scope, moment, $state: ng.ui.IStateService, Utils: Utils) {

        initForm();

        function initForm() {
            const theDay: Moment = moment();
            $scope.startDate = moment(theDay).startOf('w').toDate();
            $scope.endDate = moment(theDay).add(1, 'w').startOf('w').toDate();
        }

        $scope.goToMyAvailability = ($event) => {
            $state.go('auth.therapist.availability.view', {
                dateFrom: Utils.dateToFormat($scope.startDate),
                dateTo: Utils.dateToFormat($scope.endDate)
            });
        };

    }
}
