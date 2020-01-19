import {HtCustomColumn} from './HtCustomColumn';
import {BaseColumn} from './BaseColumn';
import {HtColumnType_Ns} from './HtColumnType';
import HtColumnType = HtColumnType_Ns.HtColumnType;

export interface HtColumn extends BaseColumn {
    id: number;
    title: string;
    type: HtColumnType;
    position: number;
    editable?: boolean;
    permanent?: boolean;

    customColumn: HtCustomColumn;
}
