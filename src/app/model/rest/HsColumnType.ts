export namespace HsColumnType_Ns {
    export enum HsColumnType {
        flag = <any>'flag',
        condition = <any>'condition',
        select = <any>'select',
        input = <any>'input',
        text = <any>'text',
        cost = <any>'cost',
        custom = <any>'custom'
    }

    export const $standard: any[] = [
        HsColumnType.flag,
        HsColumnType.condition,
        HsColumnType.select,
        HsColumnType.input,
        HsColumnType.text,
        HsColumnType.cost
    ];
}
