import {AvailabilityType_Ns} from './AvailabilityType';
import AvailabilityType = AvailabilityType_Ns.AvailabilityType;

export interface AvHistoryState {
    id: number;
    date: string;
    timeStart: number;
    timeEnd: number;
    type: AvailabilityType;
}
