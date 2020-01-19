import {MdSelectType} from './TherapistInfo';

export interface Client {
    id: number;
    name: string;
    firstName?: string;
    lastName?: string;
    preferredName?: string;
    clientSince?: Date;
    birthday?: Date;
    gender?: number;
    phoneMobile?: string;
    phoneHome?: string;
    phoneWork?: string;
    city?: string;
    postcode?: string;
    state?: MdSelectType | string;
    country?: MdSelectType | string;
    street?: string;
    email?: string;
    cycle?: string;
    programLength?: string;
}
