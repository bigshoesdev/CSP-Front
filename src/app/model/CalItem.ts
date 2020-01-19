import {Rectangle} from './Rectangle';
import {BaseCalItem} from './BaseCalItem';

export interface CalItem extends BaseCalItem {
    model: any;
    date: string; // DD-mm-yyyy
    timeStart: number; // minutes since start of day
    timeEnd: number; // minutes since start of day
    clazz?: string;
    rect?: Rectangle;
}
