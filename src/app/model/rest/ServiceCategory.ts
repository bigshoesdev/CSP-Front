import {Service} from './Service';

export interface ServiceCategory {
    id: number;
    name: string;
    services: Service[];
}
