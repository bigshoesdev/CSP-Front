import {ConcreteEventChangeValue} from './ConcreteEventChangeValue';

export interface ConcreteEventChangeCode {
    concreteEventId: number;
    eventCode: string;
    preValue: ConcreteEventChangeValue;
    newValue: ConcreteEventChangeValue;
}
