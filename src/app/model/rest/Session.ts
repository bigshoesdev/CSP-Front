import {Client} from './Client';
import {Therapist} from './Therapist';

export interface Session {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    clients: Client[];
    therapists: Therapist[];
}
