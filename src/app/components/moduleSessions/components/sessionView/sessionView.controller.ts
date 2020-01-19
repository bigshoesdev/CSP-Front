import {dateFormat} from '../../../../services/app.constant';
import {Session} from '../../../../model/rest/Session';
import {Utils} from '../../../../services/utils.service';

export class SessionViewController {
    /** @ngInject */
    constructor(session: Session,
                $scope,
                $state: ng.ui.IStateService,
                StateStack,
                Utils: Utils) {


        initForm(session);

        function initForm(session: Session) {
            $scope.session = session;
            $scope.startDate = Utils.initDateFromStr(session.startDate, dateFormat);
            $scope.endDate = Utils.initDateFromStr(session.endDate, dateFormat);
        }

        $scope.cancel = function () {
            if (StateStack.canGoBack()) {
                StateStack.goBack();
            } else {
                $state.go('auth.sessions.archiveSessionList');
            }
        };

    }
}

