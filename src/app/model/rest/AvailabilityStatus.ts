export namespace AvailabilityStatus_Ns {
    export enum AvailabilityStatus {
        created = <any>'created',
        viewed = <any>'viewed',
        approved = <any>'approved',
        rejected = <any>'rejected'
    }

    export const $all: any[] = [
        AvailabilityStatus.created,
        AvailabilityStatus.viewed,
        AvailabilityStatus.approved,
        AvailabilityStatus.rejected
    ];
}
