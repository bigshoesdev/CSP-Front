import {Room} from './Room';
import {Therapist} from './Therapist';
import {CompositeTime} from './CompositeTime';
import {BaseCrossEvent} from './BaseCrossEvent';
import {Service} from "./Service";
import {Client} from "./Client";
import {Session} from "./Session";

export interface BaseConcreteEvent extends BaseCrossEvent {
    id: number;
    service: Service;
    client: Client;
    session: Session;
    note: string;

    room: Room;
    therapist: Therapist;

    date: string;
    time?: string;
    duration?: CompositeTime;
}
