
/** @ngInject */
export function mdSticky($mdSticky, $compile) {
    return {
        restrict: 'A',
        compile: function (tElement, tAttrs) {
            const selector = tAttrs.mdSticky;
            const tSelectedElement = tElement.find(selector);
            const template = tSelectedElement[0].outerHTML;
            return function postLink(scope, iElement) {
                const iSelectedElement = iElement.find(selector);
                $mdSticky(scope, iSelectedElement, $compile(template)(scope));
            };
        }
    };

}

