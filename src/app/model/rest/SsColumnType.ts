/**
 * types of columns
 */
export namespace SsColumnType_Ns {
    export enum SsColumnType {
        name_ = <any>'name',
        status = <any>'status',
        flag = <any>'flag',
        custom = <any>'custom'
    }

    export const $all: any[] = [
        SsColumnType.name_,
        SsColumnType.status,
        SsColumnType.flag,
        SsColumnType.custom
    ];
    export const $standard: any[] = [
        SsColumnType.name_,
        SsColumnType.status,
        SsColumnType.flag
    ];
}
