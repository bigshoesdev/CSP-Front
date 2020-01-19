import {Event} from './Event';

export interface EventRecord {
    id?: number;
    event: Event;
    capacity: number;
}
