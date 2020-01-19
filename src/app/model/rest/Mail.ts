import {MailType} from './MailType';
import {MailExpression} from './MailExpression';

export interface Mail {
    id: number;
    type: MailType;
    body: string;
    subject: string;
    active: boolean;
    expressions: MailExpression[];
}
