import {HtCustomColumnValue} from './HtCustomColumnValue';
import {HtCustomColumnType_Ns} from './HtCustomColumnType';
import {BaseCustomColumn} from './BaseCustomColumn';
import HtCustomColumnType = HtCustomColumnType_Ns.HtCustomColumnType;

export interface HtCustomColumn extends BaseCustomColumn {
    id: number;
    title: string;
    type: HtCustomColumnType;
    values: HtCustomColumnValue[];
}
