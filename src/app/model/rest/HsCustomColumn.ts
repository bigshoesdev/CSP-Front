import {BaseCustomColumn} from './BaseCustomColumn';
import {HsCustomColumnType_Ns} from './HsCustomColumnType';
import {HsCustomColumnValue} from './HsCustomColumnValue';
import HsCustomColumnType = HsCustomColumnType_Ns.HsCustomColumnType;

export interface HsCustomColumn extends BaseCustomColumn {
    id: number;
    title: string;
    type: HsCustomColumnType;
    values: HsCustomColumnValue[];
}
