import {AvailabilityType_Ns} from './AvailabilityType';
import AvailabilityType = AvailabilityType_Ns.AvailabilityType;

export interface AvailabilityTimeRecord {
    id: number;
    timeStart: number;
    timeEnd: number;
    type: AvailabilityType;
}
