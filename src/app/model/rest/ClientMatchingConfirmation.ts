import {PreliminaryEvent} from './PreliminaryEvent';

export interface ClientMatchingConfirmation {
    secret: string;
    items: PreliminaryEvent[];
}
