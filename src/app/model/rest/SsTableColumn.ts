import {SsCustomColumn} from './SsCustomColumn';
import {SsColumnType_Ns} from './SsColumnType';
import {BaseColumn} from './BaseColumn';
import SsColumnType = SsColumnType_Ns.SsColumnType;

export interface SsTableColumn extends BaseColumn {
    // information for rendering colums for suggested services
    id: number;
    title: string;
    type: SsColumnType;
    position: number;
    editable?: boolean;
    permanent?: boolean;

    customColumn: SsCustomColumn;
}
