import {Session} from "./Session";
import {Client} from './Client';
import {Therapist} from './Therapist';
import {Room} from './Room';

export interface Report {
    id: number;
    type: string;
    dateFrom?: Date;
    dateTo?: Date;
    session?: Session;
    autoupdate: boolean;
    selectedAll: boolean;
    url: string;
    client: Client;
    therapist: Therapist;
    room: Room;
}
