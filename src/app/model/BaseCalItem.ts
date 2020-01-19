import {Rectangle} from './Rectangle';

export interface BaseCalItem {
    model: any;
    timeStart: number; // minutes since start of day
    timeEnd: number; // minutes since start of day
    rect?: Rectangle;

}
