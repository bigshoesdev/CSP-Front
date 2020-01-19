export namespace HsType_Ns {
    export enum HsType {
        physical = <any>'physical',
        structural = <any>'structural',
        emotional = <any>'emotional',
        protocols = <any>'protocols',
        packages = <any>'packages',
        goals = <any>'goals',
        contraindications = <any>'contraindications'
    }

    export const $all: any[] = [
        HsType.physical,
        HsType.structural,
        HsType.emotional,
        HsType.protocols,
        HsType.packages,
        HsType.goals,
        HsType.contraindications
    ];
    export const $flagAvailable: any[] = [
        HsType.physical,
        HsType.structural,
        HsType.emotional
    ];
    export const $conditionAvailable: any[] = [
        HsType.physical,
        HsType.structural,
        HsType.emotional,
        HsType.contraindications
    ];
}
