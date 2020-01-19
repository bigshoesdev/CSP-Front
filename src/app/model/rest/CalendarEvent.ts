import {CompositeTime} from './CompositeTime';
import {Equipment} from './Equipment';
import {Event} from './Event';
import {Therapist} from './Therapist';
import {Room} from './Room';

export interface CalendarEvent {
    id?: number;
    name: string;
    archived?: boolean;
    event: Event;
    room?: Room;
    therapist?: Therapist;
    equipment?: Equipment[];
    capacity: number;
    dateStart: string;
    dateEnd: string;
    days: number[];
    time: string;
    duration?: CompositeTime;
}
