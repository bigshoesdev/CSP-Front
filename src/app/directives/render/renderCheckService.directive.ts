
/** @ngInject */
export function renderCheckService($rootScope, _) {
    return {
        template: '<md-checkbox ng-checked="ifSelected()" ng-click="toggle()" aria-label="{{serviceId}}"></md-checkbox>',
        restrict: 'A',
        scope: {serviceId: '=renderCheckService'},
        link: function (scope, iElement, iAttrs) {

            if (!$rootScope.selectedServices) {
                $rootScope.selectedServices = [];
            }

            const serviceId = scope.serviceId;

            scope.ifSelected = () => {
                return _.includes($rootScope.selectedServices, serviceId);
            };

            scope.toggle = () => {
                if (scope.ifSelected()) {
                    $rootScope.selectedServices = _.filter($rootScope.selectedServices, (id) => id != serviceId);
                } else {
                    $rootScope.selectedServices.push(serviceId);
                }
            };

        }
    };


}
