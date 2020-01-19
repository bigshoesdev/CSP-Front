export interface MdSelectType {
    id: number;
    name: string;
}

export interface TherapistInfo {
    id?: number;
    firstName: string;
    lastName?: string;
    gender: number;
    preferredName?: string;
    emailPersonal?: string;
    phoneMobile?: string;
    phoneHome?: string;
    phoneWork?: string;
    birthday?: Date;
    company?: string;
    street?: string;
    city?: string;
    postcode?: string;
    state?: MdSelectType | string;
    country?: MdSelectType | string;
}
