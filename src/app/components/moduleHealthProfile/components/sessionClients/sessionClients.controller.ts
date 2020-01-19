import {LocalStorageService} from '../../../../services/storage/local-storage.service';
import {Session} from '../../../../model/rest/Session';
declare let angular: any;

export class SessionClientsController {
    /** @ngInject */
    constructor(sessions: Session[],
                canEditData,
                canEditUi,
                $scope,
                LocalStorageService: LocalStorageService,
                _,
                $state) {

        initForm();

        function initForm() {
            $scope.sessions = sessions;
            $scope.sessionId = -1;

            $scope.canEditData = canEditData;
            $scope.canEditUi = canEditUi;

            const sessionId: number = +LocalStorageService.getItem('moduleHealthProfile.sessionId');
            if (!isNaN(sessionId)) {
                const session = _.find(sessions, (s) => s.id === sessionId);
                applySession(session);
            }

        }

        $scope.displayItem = (item) => item && item.name;

        $scope.applySession = applySession;

        function applySession(session: Session) {
            if (!session || $scope.sessionId === session.id) {
                return;
            }
            $scope.session = session;
            $scope.sessionId = session.id;
            LocalStorageService.setItem('moduleHealthProfile.sessionId', $scope.sessionId);
        }

        $scope.customize = () => {
            $state.go('auth.healthProfile.sessionClients.editColumns');
        };

    }
}
