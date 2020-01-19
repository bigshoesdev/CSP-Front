import {HsColumn} from './HsColumn';
import {HsType_Ns} from './HsType';
import HsType = HsType_Ns.HsType;

export interface HealthSection {
    // id: number;
    type: HsType;
    title: string;
    columns: HsColumn[];
}
