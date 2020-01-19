import {Room} from './Room';
import {EventRecord} from './EventRecord';
import {Service} from './Service';
import {ServiceCategory} from './ServiceCategory';
import {TherapistInfo} from './TherapistInfo';

export interface Therapist {
    id: number;
    name: string;
    email: string;
    therapistInfo?: TherapistInfo;
    serviceCategories?: ServiceCategory[];
    services?: Service[];
    events?: EventRecord[];
    preferredRooms?: Room[];
}
