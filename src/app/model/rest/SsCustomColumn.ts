import {SsCustomColumnValue} from './SsCustomColumnValue';
import {SsCustomColumnType_Ns} from './SsCustomColumnType';
import {BaseCustomColumn} from './BaseCustomColumn';
import SsCustomColumnType = SsCustomColumnType_Ns.SsCustomColumnType;

export interface SsCustomColumn extends BaseCustomColumn {
    // holds info about custom column definition
    id: number;
    title: string;
    type: SsCustomColumnType;
    values: SsCustomColumnValue[];
}
