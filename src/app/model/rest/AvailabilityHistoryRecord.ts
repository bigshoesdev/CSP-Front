import {AvHistoryState} from './AvHistoryState';
import {UserSimple} from './UserSimple';

export interface AvailabilityHistoryRecord {
    id: number;
    editDate: string;
    prevState: AvHistoryState;
    newState: AvHistoryState;
    userSimple: UserSimple;
}
