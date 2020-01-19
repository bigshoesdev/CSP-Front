import {PreliminaryEventType_Ns} from './PreliminaryEventType';
import {BaseConcreteEvent} from './BaseConcreteEvent';
import PreliminaryEventType = PreliminaryEventType_Ns.PreliminaryEventType;
import {Room} from './Room';
import {Therapist} from './Therapist';
import {CompositeTime} from './CompositeTime';
import {Service} from "./Service";
import {Client} from "./Client";
import {Session} from "./Session";

export interface PreliminaryEvent extends BaseConcreteEvent {
    // suggested service item data
    id: number;
    // complex id
    service: Service;
    client: Client;
    session: Session;

    note: string;
    room: Room;
    therapist: Therapist;
    date: string;

    // fields required for matching board
    time?: string; // time for event in format 'HH:mm'. if null = not set yet
    duration?: CompositeTime; // duration in minutes
    state?: PreliminaryEventType;
}
