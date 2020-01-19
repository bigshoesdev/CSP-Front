import {Therapist} from './Therapist';
import {Room} from './Room';
import {CrossingDataType} from './CrossingDataType';
import {Client} from './Client';

export interface CrossingDataItem {
    time: string;
    duration: number; // duration in minutes
    therapist: Therapist; // crossed therapist if present
    room: Room; // crossed room if present
    clients: Client[]; // crossed if not empty
    type: CrossingDataType;
}
