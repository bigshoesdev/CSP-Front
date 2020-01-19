import {ConcreteEventReconcile} from './ConcreteEventReconcile';

export interface Estimate {
    id?: number;
    externalId?: number;
    clientId: number;
    sent?: boolean;
    events: ConcreteEventReconcile[];
}
