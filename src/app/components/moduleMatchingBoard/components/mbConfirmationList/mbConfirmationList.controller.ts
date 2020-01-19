import {LocalStorageService} from '../../../../services/storage/local-storage.service';
import {Entity} from '../../../../model/Entity';
import {Session} from '../../../../model/rest/Session';
import {ClientServiceMatchingData} from '../../../../model/rest/ClientServiceMatchingData';
import {ApiMatchingBoardService} from '../../../../services/api/api-matching-board.service';
import {DialogService} from '../../../../services/dialog/dialog.service';
declare let angular: any;


export class MbConfirmationListController {

    /** @ngInject */
    constructor(sessions: Session[],
                $scope, LocalStorageService: LocalStorageService, _, StateStack, $state: ng.ui.IStateService, DialogService: DialogService,
                ApiMatchingBoardService: ApiMatchingBoardService) {

        initForm();

        function initForm() {
            $scope.sessions = sessions;
            $scope.session = null;
            $scope.sessionId = null;

            $scope.matchingDataArr = [];
            $scope.matchingData = null; // used in child components

            const sessionId: number = +LocalStorageService.getItem('moduleMatchingBoard.sessionId');

            if (!isNaN(sessionId)) {
                const session: Session = _.find(sessions, (s) => s.id === sessionId);
                $scope.session = session;
                applySession(session);
            }

        }

        $scope.displayEntity = (item: Entity) => item && item.name;

        $scope.backOrDone = () => {
            StateStack.goBack();
        };

        $scope.applySession = applySession;
        function applySession(session: Session) {
            let sessionId;
            if (!session || $scope.sessionId === (sessionId = session.id)) {
                return;
            }

            $scope.sessionId = sessionId;
            LocalStorageService.setItem('moduleMatchingBoard.sessionId', sessionId);

            update(sessionId);
        }

        function update(sessionId) {
            return ApiMatchingBoardService.getClientsMixed(sessionId)
                .then(applyMatchingData);
        }

        function applyMatchingData(matchingDataArr: ClientServiceMatchingData[]) {
            $scope.matchingDataArr = matchingDataArr.filter((matchingData: ClientServiceMatchingData) => !!matchingData.confirmationData);
        }

        $scope.viewConfirmation = (matchingData: ClientServiceMatchingData, $event) => {
            $state.go('auth.matchingBoard.confirmationView', {
                sessionId: $scope.session.id,
                clientId: matchingData.clientId
            });
        };

        $scope.applyConfirmation = (matchingData: ClientServiceMatchingData, $event) => {

            DialogService.dialogConfirm({
                title: 'Apply Confirmation',
                textContent: 'Are you sure to apply the confirmation?',
                cancel: 'Back',
                ok: 'Ok',
                targetEvent: $event
            }).then(() => {
                return ApiMatchingBoardService.postConfirmation($scope.session.id, matchingData.clientId)
                    .then(() => {
                        update($scope.session.id);
                    });
            });
        };

        $scope.cancelConfirmation = (matchingData: ClientServiceMatchingData, $event) => {
            DialogService.dialogConfirm({
                title: 'Cancel Confirmation',
                textContent: 'Are you sure to return items to non-confirmed state?',
                cancel: 'Back',
                ok: 'Ok',
                targetEvent: $event
            }).then(() => {
                return ApiMatchingBoardService.deleteConfirmation($scope.session.id, matchingData.clientId)
                    .then(() => {
                        update($scope.session.id);
                    });
            });
        };

    }
}

