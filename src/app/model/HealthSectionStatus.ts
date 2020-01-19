export namespace HealthSectionStatus_Ns {
    export enum HealthSectionStatus {
        edit = <any>'edit',
        done = <any>'done',
        notStarted = <any>'not_started'
    }

    export const $all: any[] = [
        HealthSectionStatus.edit,
        HealthSectionStatus.done,
        HealthSectionStatus.notStarted
    ];

    export const toString = (healthSectionStatus) => {
        switch (healthSectionStatus) {
            case HealthSectionStatus.edit:
                return 'Processing';
            case HealthSectionStatus.done:
                return 'Complete';
            case HealthSectionStatus.notStarted:
            default:
                return 'Not started';
        }
    };
}
