import {SsColumnType_Ns} from './SsColumnType';
import {BaseColumnDefinition} from './BaseColumnDefinition';
import SsColumnType = SsColumnType_Ns.SsColumnType;

export interface SsColumnDefinition extends BaseColumnDefinition {
    // object used in UI setup
    id: number;
    title: string;
    type: SsColumnType;
    position: number;

    customColumnId: number;
}
