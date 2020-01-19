import {ClientMatchingConfirmation} from './ClientMatchingConfirmation';
import {PreliminaryEvent} from './PreliminaryEvent';

export interface ClientServiceMatchingData {
    // pack of mised data - matching it not send to confirm and confirmation
    clientId: number;
    clientName: string;
    matchingData: PreliminaryEvent[];
    confirmationData: ClientMatchingConfirmation;
}
