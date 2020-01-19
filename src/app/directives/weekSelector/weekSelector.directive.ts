
/** @ngInject */
export function weekSelector() {
    return {
        restrict: 'A',
        templateUrl: 'app/directives/weekSelector/weekSelector.html',
        controller: 'WeekSelectorController',
        controllerAs: 'ctrl',
        scope: {
            selected: '=weekSelector', // number[]
            disabledDays: '=disabledDays'
        },
        link: function postLink(scope, element, attrs) {

            scope.selectedText = () => {
                const length = scope.selected.length;
                if (length === 0) {
                    return 'None day';
                } else if (length < scope.items.length) {
                    return ('' + length + ' day' + (length > 1 ? 's' : '') + ' selected');
                } else {
                    return 'Every week days';
                }
            };

        }
    };
}

