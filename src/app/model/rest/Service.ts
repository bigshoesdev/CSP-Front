
import {CompositeTime} from './CompositeTime';

export interface Service {
    id: number;
    name: string;
    time: CompositeTime;
    price: number;
}
