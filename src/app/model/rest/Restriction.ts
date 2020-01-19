import {Equipment} from './Equipment';
import {Room} from './Room';
import {RestrictionType_Ns} from './RestrictionType';
import RestrictionType = RestrictionType_Ns.RestrictionType;

export interface Restriction {
    id: number;
    name: string;
    type: RestrictionType;
    linkedId: number; // linked object id (service or category)
    rooms: Room[];
    equipments: Equipment[];
}
