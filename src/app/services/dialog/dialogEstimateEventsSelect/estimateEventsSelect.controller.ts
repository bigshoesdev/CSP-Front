import {IDialogEstimateEventsSelectConf, IDialogEstimateEventsSelectRes} from '../dialog.service';
import {Utils} from '../../utils.service';
import {Session} from '../../../model/rest/Session';
import {ConcreteEventReconcileState_Ns} from '../../../model/rest/ConcreteEventReconcileState';
import {ConcreteEventState_Ns} from '../../../model/rest/ConcreteEventState';
import ConcreteEventReconcileState = ConcreteEventReconcileState_Ns.ConcreteEventReconcileState;
import ConcreteEventState = ConcreteEventState_Ns.ConcreteEventState;

export class EstimateEventsSelectController {
    /** @ngInject */
    constructor(private $mdDialog,
                private $scope,
                private _,
                private Utils: Utils,
                // Below values injected from locals:
                private dialogConf: IDialogEstimateEventsSelectConf) {

        this.initForm();

        $scope.displayItem = (item) => (item && item.name);

        $scope.applySession = (session: Session) => this.applySession(session);

        $scope.apply = () => {
            const res: IDialogEstimateEventsSelectRes = {
                session: $scope.session,
                client: $scope.client,
                fromDate: $scope.fromDate,
                toDate: $scope.toDate,
                selectedStates: $scope.selectedStates,
            };

            $mdDialog.hide(res);
        };
        $scope.cancel = () => {
            $mdDialog.cancel();
        };
    }

    private initForm() {
        const $scope = this.$scope;

        const session: Session = this.dialogConf.session;
        $scope.session = session;
        $scope.sessions = this.dialogConf.sessions;

        $scope.client = this.dialogConf.client;
        if (session) {
            $scope.clients = session.clients;
        } else {
            $scope.clients = this.dialogConf.clients;
        }

        $scope.fromDate = this.dialogConf.fromDate;
        $scope.toDate = this.dialogConf.toDate;

        $scope.selectedStates = this.dialogConf.selectedStates;
        $scope.statuses = [
            ConcreteEventState.tentative,
            ConcreteEventState.cancelled,
            ConcreteEventState.confirmed,
            ConcreteEventState.completed,
            ConcreteEventReconcileState.reconciled,
            ConcreteEventReconcileState.audited,
            ConcreteEventReconcileState.estimate,
        ];

    }

    private applySession(session: Session) {
        if (session) {
            const $scope = this.$scope;
            $scope.clients = session.clients;
            if (!$scope.fromDate) {
                $scope.fromDate = this.Utils.initDateFromStr(session.startDate);
            }
            if (!$scope.toDate) {
                $scope.toDate = this.Utils.initDateFromStr(session.endDate);
            }
        }
    }

}
