import {HsFlagColumnValue} from './HsFlagColumnValue';
import {HsType_Ns} from './HsType';
import HsType = HsType_Ns.HsType;

export interface HsFlagColumn {
    id: number;
    sectionType: HsType;
    values: HsFlagColumnValue[];
}
