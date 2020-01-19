
/** @ngInject */
export function renderBody() {
    return {
        template: '{{value}}',
        restrict: 'A',
        scope: {value: '=renderBody'},
        // link: function (scope, iElement, iAttrs) {
        // }
    };


}
