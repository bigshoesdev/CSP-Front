
/** @ngInject */
export function renderNames($compile, $parse) {
    return {
        restrict: 'A',
        template: '{{value}}',
        compile: function (tElement, tAttrs, transclude) {
            const fn = $parse(tAttrs.renderNames, /* interceptorFn */ null, /* expensiveChecks */ true);
            return function postLink(scope, element, attrs) {
                const items = fn(scope) || [];
                scope.value = items.map((s) => s.name).join(' | ');
            };
        }

    };
}
