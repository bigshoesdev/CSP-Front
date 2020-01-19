export namespace AvailabilityType_Ns {
    export enum AvailabilityType {
        available = <any>'A',
        unavailable = <any>'U',
        undefined = <any>''
    }

    export const $all: any[] = [
        AvailabilityType.available,
        AvailabilityType.unavailable,
        AvailabilityType.undefined
    ];

    export const toString = (type) => {
        if (type === AvailabilityType.available) {
            return 'Available';
        } else if (type === AvailabilityType.unavailable) {
            return 'Unavailable';
        } else {
            return 'Undefined';
        }
    };
}
