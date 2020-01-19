import {ConcreteEventReconcile} from '../../../model/rest/ConcreteEventReconcile';
import {Client} from '../../../model/rest/Client';
import {ConcreteEventEstimateState_Ns} from '../../../model/rest/ConcreteEventEstimateState';
import ConcreteEventEstimateState = ConcreteEventEstimateState_Ns.ConcreteEventEstimateState;

export class ConcreteEventReconcileRow {
    selected: boolean;
    disabled: boolean;
    reconcileEvent: ConcreteEventReconcile;

    serviceName: string;
    therapistName: string;
    _client: Client;
    clientName: string;
    roomName: string;
    date: string;
    time: string;
    durationTotal: string;
    status: string;
    estimateLink: string;
    price: number;
}

export class ConcreteEventReconcileAction {
    title: string;
    fn: (reconcileEventRow: ConcreteEventReconcileRow, event: any) => void;
    iconName: string;
}

export class ConcreteEventReconcileSelectionAction {
    title: string;
    fn: (reconcileEventRows: ConcreteEventReconcileRow[]) => void;
}

/** @ngInject */
export function concreteEventReconcileList() {
    return {
        templateUrl: 'app/components/moduleEstimate/directives/concreteEventReconcileList.html',
        restrict: 'A',
        scope: {
            reconcileEventRows: '=concreteEventReconcileList', // ConcreteEventReconcileRow[]
            selectionEnabled: '=selectionEnabled', // boolean
            selectionActions: '=selectionActions', // ConcreteEventReconcileSelectionAction[]
            itemActions: '=itemActions', // ConcreteEventReconcileAction[]
            onRowChecked: '=onRowChecked'
        },
        link: function postLink(scope, iElement, iAttrs, controller) {

            scope.selectedStatusIcon = (): string => {
                const number = countSelected();
                if (number === scope.reconcileEventRows.length) {
                    return 'check_box';
                } else if (number === 0) {
                    return 'check_box_outline_blank';
                } else {
                    return 'indeterminate_check_box';
                }
            };

            scope.selectAll = () => setSelected(true);

            scope.unselectAll = () => setSelected(false);

            scope.ifEstimated = (estimateState: any) => estimateState && estimateState != ConcreteEventEstimateState.none;

            function setSelected(selected: boolean) {
                const reconcileEventRows: ConcreteEventReconcileRow[] = scope.reconcileEventRows;
                reconcileEventRows.forEach((row: ConcreteEventReconcileRow) => {
                    row.selected = selected;
                });
            }

            function  countSelected(): number {
                const reconcileEventRows: ConcreteEventReconcileRow[] = scope.reconcileEventRows;
                return reconcileEventRows.reduce((count: number, reconcileEventRow: ConcreteEventReconcileRow): number => {
                    return reconcileEventRow.selected ? count + 1 : count;
                }, 0);
            }

        },
    };
}


