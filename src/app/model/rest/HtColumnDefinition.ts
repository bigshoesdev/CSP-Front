import {HtColumnType_Ns} from './HtColumnType';
import {BaseColumnDefinition} from './BaseColumnDefinition';
import HtColumnType = HtColumnType_Ns.HtColumnType;

export interface HtColumnDefinition extends BaseColumnDefinition {
    id: number;
    title: string;
    type: HtColumnType;
    position: number;

    customColumnId: number;
}
