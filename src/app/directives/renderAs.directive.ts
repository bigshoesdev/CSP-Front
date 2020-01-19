import {RenderAsConf} from '../model/RenderAsConf';

declare let angular: any;

/** @ngInject */
export function renderAs($compile, $parse) {
    return {
        restrict: 'A',
        compile: (tElement, tAttrs, transclude) => {
            const fn = $parse(tAttrs.renderAs, /* interceptorFn */ null, /* expensiveChecks */ true);

            return (scope, element, attrs) => {
                const config = fn(scope);
                element.removeAttr('render-as');
                element.removeAttr('data-render-as');
                if (angular.isArray(config)) {
                    config.forEach((item: RenderAsConf) => {
                        element.attr(item.directiveName, item.directiveVal);
                    });
                } else {
                    element.attr(config.directiveName, config.directiveVal);
                }
                $compile(element)(scope);
            };
        }

    };
}
