
/** @ngInject */
export function cspHeader($window: ng.IWindowService) {
    return {
        templateUrl: 'app/directives/cspHeader/cspHeader.html',
        restrict: 'AE',
        link: postLink
    };

    function postLink(scope, iElement, iAttrs) {
        scope.buildVersion = $window.__env.buildVersion;
    }
}



