import {AvailabilityTimeRecord} from './AvailabilityTimeRecord';

export interface AvailabilityTherapistDayRecord {
    date: string;
    timeItems: AvailabilityTimeRecord[];
}
