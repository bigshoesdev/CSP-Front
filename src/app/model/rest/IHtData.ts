import {HtDataItem} from './HtDataItem';

export interface IHtData {
    sessionId: number;
    clientId: number;
    values: HtDataItem[];
}
