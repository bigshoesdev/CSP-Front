/**
 * Health Profile
 */
export namespace HtColumnType_Ns {
    export enum HtColumnType {
        name_ = <any>'name',
        status = <any>'status',
        flag = <any>'flag',
        custom = <any>'custom'
    }

    export const $standard: any[] = [
        HtColumnType.name_,
        HtColumnType.status,
        HtColumnType.flag
    ];
}
