/**
 * Very base concrete event interface.
 * Created for ConcreteCalendarEvent and ConcreteEvent.
 * Used in BimodelEventCalendarController .
 */
import {CompositeTime} from './CompositeTime';
import {Therapist} from './Therapist';
import {Room} from './Room';
import {Client} from './Client';

export interface BaseCrossEvent {
    room: Room;
    therapist: Therapist;
    clientsIds: number[];
    client: Client;
    date: string;
    time?: string;
    duration?: CompositeTime;
}
