export namespace ClientStatus_Ns {
    export enum ClientStatus {
        edit = <any>'edit',
        done = <any>'done',
        notStarted = <any>'not_started'
    }

    export const $all: any[] = [
        ClientStatus.edit,
        ClientStatus.done,
        ClientStatus.notStarted
    ];
}
