import {Moment} from '../../../../bower_components/moment/moment.d';

/** @ngInject */
export function dateNav(moment) {
    return {
        restrict: 'A',
        templateUrl: 'app/directives/dateNav/dateNav.html',
        scope: {
            date: '=dateNav', // Date instance
            minDate: '=min', // Date instance
            maxDate: '=max', // Date instance
            onDateChange: '=onChange',
            ngDisabled: '=ngDisabled',
            ngRequired: '=ngRequired'
        },
        link: function postLink(scope, iElement, iAttrs) {

            scope.isPrevDisabled = () => {
                const min: Moment = scope.minDate && moment(scope.minDate);
                const d: Moment = moment(scope.date);
                return min && d.isSameOrBefore(min);
            };

            scope.isNextDisabled = () => {
                const max: Moment = scope.maxDate && moment(scope.maxDate);
                const d: Moment = moment(scope.date);
                return max && d.isSameOrAfter(max);
            };

            scope.previousDay = (date) => {
                const min: Moment = scope.minDate && moment(scope.minDate);
                const d: Moment = moment(date);
                if (!(min && d.isSameOrBefore(min))) {
                    scope.date = d.subtract(1, 'd').toDate();
                    scope.onDateChange(scope.date);
                }
            };

            scope.nextDay = (date) => {
                const max: Moment = scope.maxDate && moment(scope.maxDate);
                const d: Moment = moment(date);
                if (!(max && d.isSameOrAfter(max))) {
                    scope.date = d.add(1, 'd').toDate();
                    scope.onDateChange(scope.date);
                }
            };

            scope.goToday = () => {
                scope.date = moment().toDate();
                scope.onDateChange(scope.date);
            };
        }
    };
}
