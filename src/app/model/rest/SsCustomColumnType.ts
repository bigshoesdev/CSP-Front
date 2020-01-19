/**
 * types of custom columns
 */
export namespace SsCustomColumnType_Ns {
    export enum SsCustomColumnType {
        input = <any>'input',
        checkbox = <any>'checkbox',
        select = <any>'select'
    }

    export const $all: any[] = [
        SsCustomColumnType.input,
        SsCustomColumnType.checkbox,
        SsCustomColumnType.select
    ];
}
