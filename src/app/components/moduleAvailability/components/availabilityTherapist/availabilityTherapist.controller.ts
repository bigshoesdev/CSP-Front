import {dateFormat} from '../../../../services/app.constant';
import {Session} from '../../../../model/rest/Session';
import {Therapist} from '../../../../model/rest/Therapist';
import {Utils} from '../../../../services/utils.service';

declare let angular: any;

export class AvailabilityTherapistController {
    /** @ngInject */
    constructor(isTemplateMode, // template mode OR edit mode
                isReadOnly,
                $scope,
                $state: ng.ui.IStateService,
                Utils: Utils) {

        initForm();

        function initForm() {
            $scope.isTemplateMode = isTemplateMode;
            $scope.isReadOnly = isReadOnly;
            $scope.startDate = new Date();
            $scope.endDate = new Date();
            // init sessions
            Utils.getAllCollection('sessions').then((sessions: Session[]) => {
                $scope.sessions = sessions;
            });

            if (isTemplateMode) {
                $scope.title = 'Set therapist availability by template';
            } else if (isReadOnly) {
                $scope.title = 'View therapist availability';
            } else {
                $scope.title = 'Edit therapist availability';
            }
        }

        $scope.displayItem = (item) => item && item.name;

        let previousSessionId; // for reinitialisation detecting
        $scope.applySession = (session: Session) => {
            if (!session || previousSessionId === session.id) {
                return;
            }
            previousSessionId = $scope.session.id;
            $scope.startDate = Utils.initDateFromStr(session.startDate, dateFormat) || new Date();
            $scope.endDate = Utils.initDateFromStr(session.endDate, dateFormat) || new Date();
            if (session.therapists.length === 1) {
                $scope.applyTherapist(session.therapists[0]);
            } else {
                $scope.therapist = null;
            }
        };

        let previousTherapistId; // for reinitialisation detecting
        $scope.applyTherapist = (therapist: Therapist) => {
            if (!therapist || previousTherapistId === therapist.id) {
                return;
            }
            previousTherapistId = therapist.id;
            $scope.therapist = therapist;
        };

        if (isTemplateMode) {
            $scope.goToTherapistAvailability = goTo.bind(null, 'auth.availability.templateTherapist');
        } else if (isReadOnly) {
            $scope.goToTherapistAvailability = goTo.bind(null, 'auth.availability.viewTherapist');
        } else {
            $scope.goToTherapistAvailability = goTo.bind(null, 'auth.availability.editTherapist');
        }

        function goTo(stateName) {
            $state.go(stateName, {
                therapistId: $scope.therapist.id,
                dateFrom: Utils.dateToFormat($scope.startDate),
                dateTo: Utils.dateToFormat($scope.endDate)
            });
        }

    }
}
