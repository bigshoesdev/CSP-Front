import {AvailabilityTherapistRequest} from '../../model/rest/AvailabilityTherapistRequest';

/** @ngInject */
export function renderTherapistsRequests() {
    return {
        template: '{{ viewed }}-viewed, {{ approved }}-approved, {{ rejected }}-rejected',
        restrict: 'A',
        scope: {
            requestArr: '=renderTherapistsRequests'
        },
        link: function (scope, iElement, iAttrs) {

            scope.viewed = 0;
            scope.approved = 0;
            scope.rejected = 0;

            scope.requestArr.forEach((therapistsRequest: AvailabilityTherapistRequest) => {
                if (therapistsRequest.status) {
                    scope['' + therapistsRequest.status] += 1;
                }
            });

        }
    };


}
