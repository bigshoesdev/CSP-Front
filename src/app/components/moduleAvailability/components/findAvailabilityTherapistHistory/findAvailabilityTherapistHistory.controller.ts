
import {Therapist} from '../../../../model/rest/Therapist';
import {Session} from '../../../../model/rest/Session';
import {Utils} from '../../../../services/utils.service';

declare let angular: any;

export class FindAvailabilityTherapistHistoryController {
    /** @ngInject */
    constructor(therapists: Therapist,
                $scope,
                $state: ng.ui.IStateService,
                Utils: Utils,
                _,
                StateStack) {


        initForm(therapists);

        function initForm(therapists: Therapist) {
            $scope.therapists = therapists;
            // init sessions
            Utils.getAllCollection('sessions').then((sessions: Session[]) => {
                $scope.sessions = sessions;
            });
        }

        $scope.displayItem = (item) => item && item.name;

        $scope.$watch('session.id', (newSessionId, prevSessionId) => {
            if (newSessionId === prevSessionId) {
                return;
            }

            const sessionsTherapists = $scope.session.therapists;
            $scope.therapists.sort((a: Therapist, b: Therapist) => {
                const exist = sessionsTherapists.some((therapist: Therapist) => therapist.id === a.id);
                if (exist) {
                    return -1;
                } else {
                    return 1;
                }
            });
        });

        $scope.goToHistory = () => {
            $state.go('auth.availability.therapistHistoryView', {
                therapistId: $scope.therapist.id
            });
        };

        $scope.cancel = function () {
            if (StateStack.canGoBack()) {
                StateStack.goBack();
            } else {
                $state.go('auth.availability.requestList');
            }
        };


    }
}
