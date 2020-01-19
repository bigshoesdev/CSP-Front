import {Service} from './rest/Service';
import {ServiceCategory} from './rest/ServiceCategory';
import {RestrictionType_Ns} from './rest/RestrictionType';
import RestrictionType = RestrictionType_Ns.RestrictionType;

export class ServiceOrCategory {
    id: string;
    type: RestrictionType;
    item: Service | ServiceCategory;
}
