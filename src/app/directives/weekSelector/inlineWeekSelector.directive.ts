
/** @ngInject */
export function inlineWeekSelector() {
    return {
        restrict: 'A',
        templateUrl: 'app/directives/weekSelector/inlineWeekSelector.html',
        controller: 'WeekSelectorController',
        controllerAs: 'ctrl',
        scope: {
            selected: '=inlineWeekSelector', // number[]
            ngDisabled: '=ngDisabled'// boolean
        }
    };
}
