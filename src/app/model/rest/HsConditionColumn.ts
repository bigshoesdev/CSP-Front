import {HsConditionColumnValue} from './HsConditionColumnValue';
import {HsType_Ns} from './HsType';
import HsType = HsType_Ns.HsType;

export interface HsConditionColumn {
    id: number;
    sectionType: HsType;
    values: HsConditionColumnValue[];
}
