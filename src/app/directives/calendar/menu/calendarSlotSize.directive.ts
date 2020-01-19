import {SlotSize_Ns} from '../../../model/SlotSize';

/** @ngInject */
export function calendarSlotSize(_) {
    return {
        restrict: 'A',
        templateUrl: 'app/directives/calendar/menu/calendarSlotSize.html',
        scope: {
            slotSize: '=calendarSlotSize',
            onSlotSizeChange: '&calendarSlotSizeChange'
        },
        link: function postLink(scope, element, attrs) {
            scope.allSlotSize = SlotSize_Ns.$all;
        }
    };
}
