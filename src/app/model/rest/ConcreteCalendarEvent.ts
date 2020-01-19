import {BaseCrossEvent} from './BaseCrossEvent';
import {CompositeTime} from './CompositeTime';
import {Therapist} from './Therapist';
import {Room} from './Room';
import {Event} from './Event';
import {Client} from './Client';
import {CalendarEvent} from "./CalendarEvent";

export interface ConcreteCalendarEvent extends BaseCrossEvent {
    id: number;
    calendarEvent: CalendarEvent;
    name: string;
    event: Event;
    clients: Client[];
    room: Room;
    therapist: Therapist;
    time: string;
    date: string;
    duration: CompositeTime;
}
