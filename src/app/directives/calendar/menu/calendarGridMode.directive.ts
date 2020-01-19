import {CalendarMode_Ns} from '../../../model/CalendarMode';
import CalendarModeEnum = CalendarMode_Ns.CalendarMode;

/** @ngInject */
export function calendarGridMode(_) {
    return {
        restrict: 'A',
        templateUrl: 'app/directives/calendar/menu/calendarGridMode.html',
        scope: {
            gridMode: '=calendarGridMode',
            onGridModeChange: '&calendarGridModeChange'
        },
        link: function postLink(scope, element, attrs) {

            scope.allGridModes = CalendarMode_Ns.$all;

            scope.getCalendarGridModeName = (gridMode: CalendarModeEnum) => {
                return CalendarMode_Ns.toString(gridMode);
            };

            scope.getCalendarGridModeIconName = (gridMode: CalendarModeEnum) => {
                switch (gridMode) {
                    case CalendarModeEnum.everyDay:
                        return 'view_day';
                    case CalendarModeEnum.everyWeek:
                        return 'view_week';
                    default:
                        return 'date_range';
                }
            };

        }
    };
}
