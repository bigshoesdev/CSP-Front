/** @ngInject */
export function chipsStringSelector() {
    return {
        restrict: 'A',
        templateUrl: 'app/directives/selectors/chipsStringSelector/chipsStringSelector.html',
        scope: {
            selectedList: '=chipsStringSelector', // string[]
            allList: '=chipsStringSelectorAll', // string[]
            title: '@chipsStringSelectorTitle', // string[]
            multiple: '@multiple'
        },
        compile: function compile(tElement, tAttrs, transclude) {
            return function postLink(scope, element, attrs) {
                scope.multiple = (tAttrs.multiple === 'false') ? 'false' : 'true';
            };
        }
    };
}

