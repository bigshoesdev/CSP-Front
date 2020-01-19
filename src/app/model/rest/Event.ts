
import {CompositeTime} from './CompositeTime';
import {Taxes} from './Taxes';
import {EventTypes} from './EventTypes';

export interface Event {
    id: number;
    name: string;
    time: CompositeTime;
    tax?: Taxes;
    eventType?: EventTypes;
}
