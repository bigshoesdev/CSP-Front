import {TAction} from './TAction';
import {Tr} from './Tr';
import {Th} from './Th';

export interface TableConf {
    thList: Th[];
    trList: Tr[];
    itemClick?: Function;
    actions: TAction[];
}
