import {AvailabilityTherapistRequest} from './AvailabilityTherapistRequest';

export interface AvailabilityRequest {
    id: number;
    startDate: string;
    endDate: string;
    therapistsRequests: AvailabilityTherapistRequest[];
}
