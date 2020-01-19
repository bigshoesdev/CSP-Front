import {ConcreteEventEstimateState_Ns} from './ConcreteEventEstimateState';
import {ConcreteEventReconcileState_Ns} from './ConcreteEventReconcileState';
import {ConcreteEvent} from './ConcreteEvent';
import ConcreteEventEstimateState = ConcreteEventEstimateState_Ns.ConcreteEventEstimateState;
import ConcreteEventReconcileState = ConcreteEventReconcileState_Ns.ConcreteEventReconcileState;

export interface ConcreteEventReconcile { // concrete event or service on date with specific to reconcile info
    id: number; // id of concrete event
    estimateId: number;
    estimateExternalId: number; // link base for external estimate
    concreteEvent: ConcreteEvent;
    cost: number; // ($float) cost for client in CAD
    reconcileState: ConcreteEventReconcileState;
    estimateState: ConcreteEventEstimateState;
}
