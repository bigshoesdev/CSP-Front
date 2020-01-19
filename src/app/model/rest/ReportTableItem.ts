import {Room} from './Room';
import {Therapist} from './Therapist';
import {Client} from './Client';

export interface ReportTableItem {
    date: Date;
    serviceName: string;
    price: number;
    time: string;
    duration: number;
    room: Room;
    therapist: Therapist;
    client: Client;
}
