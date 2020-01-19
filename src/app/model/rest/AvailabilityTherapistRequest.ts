import {AvailabilityStatus_Ns} from './AvailabilityStatus';
import AvailabilityStatus = AvailabilityStatus_Ns.AvailabilityStatus;

export interface AvailabilityTherapistRequest {
    therapistId: number;
    message: string;
    status: AvailabilityStatus;
}
