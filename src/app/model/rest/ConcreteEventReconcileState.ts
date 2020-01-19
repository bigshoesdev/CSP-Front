export namespace ConcreteEventReconcileState_Ns {
    export enum ConcreteEventReconcileState {
        none = <any>'none',
        audited = <any>'audited', // аудит проведен, можно сделать согласование
        reconciled = <any>'reconciled', // согласование проведено
        estimate = <any>'estimate' // отправлено на эстимацию
    }

    export const $all: any[] = [
        ConcreteEventReconcileState.none,
        ConcreteEventReconcileState.audited,
        ConcreteEventReconcileState.reconciled,
        ConcreteEventReconcileState.estimate
    ];
}
