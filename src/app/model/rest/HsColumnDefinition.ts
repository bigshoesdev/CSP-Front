import {BaseColumnDefinition} from './BaseColumnDefinition';
import {HsColumnType_Ns} from './HsColumnType';
import HsColumnType = HsColumnType_Ns.HsColumnType;

export interface HsColumnDefinition extends BaseColumnDefinition {
    id: number;
    title: string;
    type: HsColumnType;
    position: number;

    customColumnId: number;
    selectColumnId: number;
}
