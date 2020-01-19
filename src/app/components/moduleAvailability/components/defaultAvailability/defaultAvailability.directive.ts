
/** @ngInject */
export function defaultAvailability(DefaultAvailabilityService) {
    return {
        restrict: 'E',
        templateUrl: 'app/components/moduleAvailability/components/defaultAvailability/defaultAvailability.html',
        link: function (scope, iElement, iAttrs) {
            scope.defaultAvailability = DefaultAvailabilityService.get();

            scope.applyDefaultAvailability = (defaultAvailability: string) => {
                DefaultAvailabilityService.set(defaultAvailability);
            };
        }
    };
}
