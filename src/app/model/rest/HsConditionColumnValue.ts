import {HsType_Ns} from './HsType';
import HsType = HsType_Ns.HsType;

export interface HsConditionColumnValue {
    id: number;
    title: string;
    defaultFlagColor: string;
    sections: HsType[];
}
