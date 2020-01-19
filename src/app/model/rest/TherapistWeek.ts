import {BaseConcreteEvent} from './BaseConcreteEvent';
import {Therapist} from './Therapist';


export interface TherapistWeek {
    id: number;
    name: String;
    therapists: Therapist[];
}
