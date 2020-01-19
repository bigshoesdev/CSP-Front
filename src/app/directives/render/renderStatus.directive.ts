
/** @ngInject */
export function renderStatus() {
    return {
        template: ' <span>' +
        '               <md-tooltip md-direction="top" md-delay="800">{{value ? "Locked" : "Unlocked"}}</md-tooltip>' +
        '               <md-icon md-font-set="material-icons">{{value ? "lock" : "lock_open"}}</md-icon>' +
        '           </span>',
        restrict: 'A',
        scope: {value: '=renderStatus'},
        // link: function (scope, iElement, iAttrs) {
        // }
    };


}
