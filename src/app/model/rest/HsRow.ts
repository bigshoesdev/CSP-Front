import {HsRowItem} from './HsRowItem';
import {HsType_Ns} from './HsType';
import HsType = HsType_Ns.HsType;

export interface HsRow {
    id: number;
    clientId: number;
    sessionId: number;
    section: HsType;
    values: HsRowItem[];
}
