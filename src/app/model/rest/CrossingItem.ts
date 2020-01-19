import {CrossingType_Ns} from './CrossingType';
import CrossingType = CrossingType_Ns.CrossingType;

export interface CrossingItem {
    // info about crosses with event
    crossType: CrossingType;
    time: string;
    duration: number; // minutes from start
    clientName: string;
    serviceName: string;
    roomName: string;
}
