import {EventRecord} from '../../../model/rest/EventRecord';
/** @ngInject */
export function eventSelector(_) {
    return {
        restrict: 'A',
        templateUrl: 'app/directives/selectors/eventSelector/eventSelector.html',
        scope: {
            eventRecords: '=eventSelector', // EventRecord[]
            allEventRecords: '=eventSelectorAll', // EventRecord[]
            title: '@eventSelectorTitle',
            disabled: '=',
        },
        link: function postLink(scope, element, attrs) {
            scope.unselect = (excludeEventId) => {
                scope.eventRecords = _.filter(scope.eventRecords, (eventRecord: EventRecord) => eventRecord.event.id != excludeEventId);
            };

            scope.displayItem = (item) => item && item.event.name;
        }
    };
}

