import {HsSelectColumn} from './HsSelectColumn';
import {HsCustomColumn} from './HsCustomColumn';
import {HsColumnType_Ns} from './HsColumnType';
import {BaseColumn} from './BaseColumn';
import HsColumnType = HsColumnType_Ns.HsColumnType;

export interface HsColumn extends BaseColumn {
    id: number;
    title: string;
    type: HsColumnType;
    position: number;
    editable?: boolean;
    permanent?: boolean;

    customColumn: HsCustomColumn;
    selectColumn: HsSelectColumn;
}
