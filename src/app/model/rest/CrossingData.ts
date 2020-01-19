import {CrossingDataItem} from './CrossingDataItem';

export interface CrossingData {
    date: string;
    sessionId: number;
    items: CrossingDataItem[];
}
