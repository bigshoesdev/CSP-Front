export namespace ConcreteEventState_Ns {
    export enum ConcreteEventState {
        tentative = <any> 'tentative',
        confirmed = <any> 'confirmed',
        cancelled = <any> 'cancelled',
        completed = <any> 'completed'
    }

    export const $all: any[] = [
        ConcreteEventState.tentative,
        ConcreteEventState.confirmed,
        ConcreteEventState.cancelled,
        ConcreteEventState.completed
    ];
}
