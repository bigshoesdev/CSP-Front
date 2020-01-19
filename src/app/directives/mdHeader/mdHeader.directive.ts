/** @ngInject */
export function mdHeader($parse) {
    return {
        restrict: 'AE',
        templateUrl: 'app/directives/mdHeader/mdHeader.html',
        compile: function (tElement, tAttrs) {
            return function postLink(scope: any, elem, attr) {

            };
        }
    };
}

