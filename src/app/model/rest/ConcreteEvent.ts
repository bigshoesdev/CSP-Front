import {BaseConcreteEvent} from './BaseConcreteEvent';
import {CompositeTime} from './CompositeTime';
import {ConcreteEventState_Ns} from './ConcreteEventState';
import ConcreteEventState = ConcreteEventState_Ns.ConcreteEventState;
import {Event} from './Event';
import {Therapist} from './Therapist';
import {Room} from './Room';
import {Service} from "./Service";
import {Client} from "./Client";
import {Session} from "./Session";

export interface ConcreteEvent extends BaseConcreteEvent {
    // concrete event or service on date.
    id: number; // id of concrete event
    service: Service; // null for event item
    event: Event;
    room: Room;
    therapist: Therapist;
    client: Client;
    session: Session;
    note: string;
    date: string; // date for event
    time: string; // time for event
    duration: CompositeTime;
    state: ConcreteEventState;
    subStatus: string; // can be any value, values defined only in client-side (ConcreteEventSubStatus.name)
}
