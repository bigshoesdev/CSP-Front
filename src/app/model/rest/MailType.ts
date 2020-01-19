/**
 * Export type
 */
import {MailKey} from './MailKey';

export interface MailType {
    id: number;
    key: MailKey;
    title: string;
    order: number;
}
