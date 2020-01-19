import {Client} from '../../../../model/rest/Client';
import {Entity} from '../../../../model/Entity';
import {ConcreteEventReconcile} from '../../../../model/rest/ConcreteEventReconcile';
import {Service} from '../../../../model/rest/Service';
import {ConcreteEvent} from '../../../../model/rest/ConcreteEvent';
import {ConcreteEventEstimateState_Ns} from '../../../../model/rest/ConcreteEventEstimateState';
import {Utils} from '../../../../services/utils.service';
import {Collection} from '../../../../model/Collection';
import {Therapist} from '../../../../model/rest/Therapist';
import {ConcreteEventState_Ns} from '../../../../model/rest/ConcreteEventState';
import {ConcreteEventReconcileState_Ns} from '../../../../model/rest/ConcreteEventReconcileState';
import {
    DialogService,
    IDialogCheckboxListConf,
    IDialogConcreteEventConf,
    IDialogConcreteEventRes,
    IDialogInputConf,
    IMdDialogPreset,
} from '../../../../services/dialog/dialog.service';
import {SignatureInfo} from '../../../../model/rest/SignatureInfo';
import {ApiReconcileService} from '../../../../services/api/api-reconcile.service';
import {ApiEstimateService} from '../../../../services/api/api-estimate.service';
import {Estimate} from '../../../../model/rest/Estimate';
import {Room} from '../../../../model/rest/Room';
import {ServiceCategory} from '../../../../model/rest/ServiceCategory';
import {Session} from '../../../../model/rest/Session';
import {Restriction} from '../../../../model/rest/Restriction';
import {ConcreteEventSubStatus} from '../../../../model/rest/ConcreteEventSubStatus';
import {ApiBookingService} from '../../../../services/api/api-booking.service';
import {
    ConcreteEventReconcileAction,
    ConcreteEventReconcileRow,
    ConcreteEventReconcileSelectionAction,
} from '../../directives/concreteEventReconcileList.directive';
import {EstimateService} from '../../services/estimate.service';
import ConcreteEventEstimateState = ConcreteEventEstimateState_Ns.ConcreteEventEstimateState;
import ConcreteEventReconcileState = ConcreteEventReconcileState_Ns.ConcreteEventReconcileState;
import ConcreteEventState = ConcreteEventState_Ns.ConcreteEventState;
import {Id} from '../../../../model/rest/Id';
import {IToastrService} from 'angular-toastr';

declare const angular: any;


export class ReconcileController {

    private id2Client: Collection<Client> = {};
    private clientId2UnsentEstimate: Collection<Estimate>;

    concreteEventSubStatusesNames: string[];

    /** @ngInject */
    constructor(protected reconcileEvents: ConcreteEventReconcile[],
                protected unsentEstimates: Estimate[],
                protected date: string,
                protected services: Service[],
                protected therapists: Therapist[],
                protected clients: Client[],
                protected rooms: Room[],
                protected categories: ServiceCategory[],
                protected sessions: Session[],
                protected restrictions: Restriction[],
                protected concreteEventSubStatuses: ConcreteEventSubStatus[],
                //
                protected $scope,
                protected $q: any,
                protected moment,
                protected $state: ng.ui.IStateService,
                protected Utils: Utils,
                protected toastr: IToastrService,
                protected DialogService: DialogService,
                protected ApiReconcileService: ApiReconcileService,
                protected ApiEstimateService: ApiEstimateService,
                protected ApiBookingService: ApiBookingService,
                protected EstimateService: EstimateService,
                protected _) {

        this.id2Client = _.keyBy(clients, 'id');
        this.clientId2UnsentEstimate = _.keyBy(unsentEstimates, 'clientId');

        this.initForm();

        $scope.onDateChange = (date) => this.onDateChange(date);

        $scope.updateReconcileEventRows = () => this.updateReconcileEventRows();

        $scope.selectionActions = [{
            title: 'Select to audit',
            fn: (rows: ConcreteEventReconcileRow[]) => this.selectToAudit(rows),
        }, {
            title: 'Select to reconcile',
            fn: (rows: ConcreteEventReconcileRow[]) => this.selectToReconcile(rows),
        }, {
            title: 'Select to estimate',
            fn: (rows: ConcreteEventReconcileRow[]) => this.selectToEstimate(rows),
        }] as ConcreteEventReconcileSelectionAction[];

        $scope.isAuditAvailable = () => this.isAuditAvailable();
        $scope.isReconcileAvailable = () => this.isReconcileAvailable();
        $scope.isEstimateAvailable = () => this.isEstimateAvailable();

        $scope.makeAudit = ($event) => {
            this.makeAudit($event).then(() => {
                this.toastr.info('Selected event audited successfully');
                this.update();
            });
        };
        $scope.makeReconcile = ($event) => {
            this.makeReconcile($event).then(() => {
                this.toastr.info('Selected event reconciled successfully');
                this.update();
            });
        };
        $scope.makeEstimate = ($event) => {
            this.makeEstimate($event).then(() => {
                this.toastr.info('Selected event estimated successfully');
                this.update();
            });
        };

        $scope.itemActions = [{
            title: 'Edit',
            fn: (row: ConcreteEventReconcileRow, $event) => {
                const reconcileEvent: ConcreteEventReconcile = row.reconcileEvent;
                const concreteEvent: ConcreteEvent = angular.copy(reconcileEvent.concreteEvent);
                return this.onEdit(concreteEvent, $event);
            },
            iconName: 'edit',
        }, {
            title: 'Delete',
            fn: (row: ConcreteEventReconcileRow, $event) => {
                const reconcileEvent: ConcreteEventReconcile = row.reconcileEvent;
                const concreteEvent: ConcreteEvent = reconcileEvent.concreteEvent;
                this.onDelete(concreteEvent, $event);
            },
            iconName: 'delete',
        }] as ConcreteEventReconcileAction[];


        $scope.onAdd = ($event) => {
            const concreteEvent: ConcreteEvent = {
                id: null,
                event: null,
                service: null,
                room: null,
                therapist: null,
                client: null,
                session: null,
                note: '',
                time: null,
                date: this.date,
                state: ConcreteEventState.tentative,
                subStatus: '',
                duration: {
                    prep: 0,
                    processing: 0, // item.timeEnd - item.timeStart,// initial duration. Real duration will be get from event in dialog
                    clean: 0,
                },
            } as ConcreteEvent;
            return this.onAdd(concreteEvent, $event);
        };
    }

    private initForm() {
        this.concreteEventSubStatusesNames = this.concreteEventSubStatuses.map(ss => ss.name);

        if (this.date) {
            this.$scope.date = this.Utils.initDateFromStr(this.date);
        } else {
            this.$scope.date = new Date();
            this.date = this.Utils.dateToFormat(this.$scope.date);
        }

        this.$scope.filteredClients = [];
        this.$scope.filteredTherapists = [];

        this.applyReconcileEvents(this.reconcileEvents);
    }

    private applyReconcileEvents(reconcileEvents: ConcreteEventReconcile[]) {
        const $scope = this.$scope;

        this.reconcileEvents = reconcileEvents;

        this.updateReconcileEventRows();

        let totalCost = 0;
        const id2Client: Collection<Client> = {};
        const id2Therapist: Collection<Client> = {};
        reconcileEvents.forEach((event: ConcreteEventReconcile) => {
            totalCost += event.cost;

            const therapist: Therapist = event.concreteEvent.therapist;
            id2Therapist[therapist.id] = therapist;

            const clientId = event.concreteEvent.client.id;
            id2Client[clientId] = event.concreteEvent.client as Client;
        });

        $scope.totalCost = totalCost;
        $scope.clients = this._.map(id2Client, c => c);
        $scope.therapists = this._.map(id2Therapist, t => t);
    }

    private filterSelected(): ConcreteEventReconcileRow[] {
        const reconcileEventRows: ConcreteEventReconcileRow[] = this.$scope.reconcileEventRows;
        return reconcileEventRows.filter((row: ConcreteEventReconcileRow) => row.selected);
    }

    private isAuditAvailable(): boolean {
        const selected: ConcreteEventReconcileRow[] = this.filterSelected();
        return selected.length && selected
            .every((row: ConcreteEventReconcileRow) => row.reconcileEvent.concreteEvent.state == ConcreteEventState.completed
                && row.reconcileEvent.reconcileState == ConcreteEventReconcileState.none);
    }

    private isReconcileAvailable(): boolean {
        const selected: ConcreteEventReconcileRow[] = this.filterSelected();
        return selected.length && selected
            .every((row: ConcreteEventReconcileRow) => row.reconcileEvent.reconcileState == ConcreteEventReconcileState.audited);
    }

    private isEstimateAvailable(): boolean {
        const selected: ConcreteEventReconcileRow[] = this.filterSelected();
        return selected.length && selected
            .every((row: ConcreteEventReconcileRow) => row.reconcileEvent.reconcileState == ConcreteEventReconcileState.reconciled
                && row.reconcileEvent.estimateState == ConcreteEventEstimateState.none);
    }

    private makeAudit($event): Promise<void> {
        return this.DialogService.dialogInput({
            title: 'Audit',
            textContent: 'Please enter your name and surname',
            inputLabel: 'Name and surname',
            inputText: '',
            targetEvent: $event,
            btnCancel: 'Cancel',
            btnHide: 'Audit',
        }).then((conf: IDialogInputConf): Promise<void> => {
            const events: number[] = this.filterSelected().map((row: ConcreteEventReconcileRow) => row.reconcileEvent.id);
            const signatureInfo: SignatureInfo = {
                name: conf.inputText,
                events: events,
            };
            return this.ApiReconcileService.postAudit(signatureInfo);
        });
    }

    private makeReconcile($event): Promise<void> {
        return this.DialogService.dialogInput({
            title: 'Reconciliation',
            textContent: 'Please enter your name and surname',
            inputLabel: 'Name and surname',
            inputText: '',
            targetEvent: $event,
            btnCancel: 'Cancel',
            btnHide: 'Reconciliation',
        }).then((conf: IDialogInputConf): Promise<void> => {
            const events: number[] = this.filterSelected().map((row: ConcreteEventReconcileRow) => row.reconcileEvent.id);
            const signatureInfo: SignatureInfo = {
                name: conf.inputText,
                events: events,
            };
            return this.ApiReconcileService.postReconcile(signatureInfo);
        });
    }

    private makeEstimate($event): Promise<void[]> {
        const selectedRows: ConcreteEventReconcileRow[] = this.filterSelected();
        const clientId2EventRows: Collection<ConcreteEventReconcileRow[]> = this._.groupBy(selectedRows, (row: ConcreteEventReconcileRow) => row._client.id);

        const estimates: Estimate[] = this._.map(clientId2EventRows, (rows: ConcreteEventReconcileRow[], clientId: number): Estimate => {
            const events: ConcreteEventReconcile[] = rows.map((row: ConcreteEventReconcileRow) => row.reconcileEvent);
            const found: Estimate = this.clientId2UnsentEstimate[clientId];
            const id: number | void = found && found.id;
            return {
                id: id,
                clientId: clientId,
                events: events,
            };
        });

        const needNewEstimates: Estimate[] = estimates
            .filter((estimate: Estimate) => !estimate.id);

        const haveUnsentEstimates: Estimate[] = estimates
            .filter((estimate: Estimate) => !!estimate.id);

        if (haveUnsentEstimates.length) {

            const checkboxLabels: string[] = haveUnsentEstimates.map((estimate: Estimate): string => {
                const client: Client = this.id2Client[estimate.clientId];
                return client && client.name;
            });
            const checkboxValues: boolean[] = checkboxLabels.map(() => false);

            return this.DialogService.dialogCheckboxList({
                title: 'Unsent Estimates found',
                textContent: 'Chose if you want to create new Estimates',
                checkboxLabels: checkboxLabels,
                checkboxValues: checkboxValues,
                btnCancel: 'Cancel',
                btnHide: 'Estimate it',
                targetEvent: $event,
            } as IDialogCheckboxListConf)
                .then((conf: IDialogCheckboxListConf) => {
                    const estimatesToCreate: Estimate[] = needNewEstimates;
                    const estimatesToAppend: Estimate[] = [];

                    conf.checkboxValues.forEach((isCreateNew: boolean, idx: number) => {
                        const estimate: Estimate = haveUnsentEstimates[idx];
                        if (isCreateNew) {
                            estimatesToCreate.push(estimate);
                        } else {
                            estimatesToAppend.push(estimate);
                        }
                    });

                    return this.saveEstimations(estimatesToCreate, estimatesToAppend);
                });
        } else {
            return this.saveEstimations(needNewEstimates, []);
        }
    }

    private saveEstimations(estimatesToCreate: Estimate[], estimatesToAppend: Estimate[]): Promise<void[]> {
        const create: Promise<any>[] = estimatesToCreate.map((estimate: Estimate): Promise<Id> => {
            const concreteEventReconcileIds: number[] = estimate.events.map((event: ConcreteEventReconcile) => event.id);
            return this.ApiEstimateService.postEstimateForClient(estimate.clientId, concreteEventReconcileIds);
        });

        const update: Promise<any>[] = estimatesToAppend.map((estimate: Estimate): Promise<void> => {
            const concreteEventReconcileIds: number[] = estimate.events.map((event: ConcreteEventReconcile) => event.id);
            return this.ApiEstimateService.putEstimateEvents(estimate.id, concreteEventReconcileIds);
        });

        return this.$q.all(create.concat(update));
    }

    update() {
        return this.ApiReconcileService.getReconcileEventsOfDate(this.date)
            .then((reconcileEvents: ConcreteEventReconcile[]) => this.applyReconcileEvents(reconcileEvents));
    }

    private selectToAudit(reconcileEventRows: ConcreteEventReconcileRow[]) {
        reconcileEventRows.forEach((row: ConcreteEventReconcileRow) => {
            row.selected = (row.reconcileEvent.concreteEvent.state == ConcreteEventState.completed
                && row.reconcileEvent.reconcileState == ConcreteEventReconcileState.none);
        });
    }

    private selectToReconcile(reconcileEventRows: ConcreteEventReconcileRow[]) {
        reconcileEventRows.forEach((row: ConcreteEventReconcileRow) => {
            row.selected = (row.reconcileEvent.reconcileState == ConcreteEventReconcileState.audited);
        });
    }

    private selectToEstimate(reconcileEventRows: ConcreteEventReconcileRow[]) {
        reconcileEventRows.forEach((row: ConcreteEventReconcileRow) => {
            row.selected = (row.reconcileEvent.reconcileState == ConcreteEventReconcileState.reconciled
                && row.reconcileEvent.estimateState == ConcreteEventEstimateState.none);
        });
    }

    private onDateChange(date) {
        this.$state.go('auth.reconcile.reconcile', {
            date: this.Utils.dateToFormat(date),
        });
    }

    private updateReconcileEventRows() {
        const reconcileEvents: ConcreteEventReconcile[] = this.applyFilters(this.reconcileEvents);
        this.$scope.reconcileEventRows = this.EstimateService.makeEventRows(reconcileEvents, this.services, this.clients) || [];
    }

    private applyFilters(reconcileEvents: ConcreteEventReconcile[]): ConcreteEventReconcile[] {
        return this.filterEventsByClients(this.filterEventsByTherapists(reconcileEvents));
    }

    private filterEventsByClients(reconcileEvents: ConcreteEventReconcile[]): ConcreteEventReconcile[] {
        const filteredClients: Client[] = this.$scope.filteredClients;
        if (filteredClients && filteredClients.length) {
            return this._.filter(reconcileEvents, (event: ConcreteEventReconcile) => {
                const clientId = event.concreteEvent.client.id;
                return filteredClients.some(c => c.id === clientId);
            });
        } else {
            return reconcileEvents;
        }
    }

    private filterEventsByTherapists(reconcileEvents: ConcreteEventReconcile[]): ConcreteEventReconcile[] {
        const filteredTherapists: Therapist[] = this.$scope.filteredTherapists;
        if (filteredTherapists && filteredTherapists.length) {
            return this._.filter(reconcileEvents, (event: ConcreteEventReconcile) => {
                const therapistId = event.concreteEvent.therapist.id;
                return filteredTherapists.some(t => t.id === therapistId);
            });
        } else {
            return reconcileEvents;
        }
    }

    private findEntityById(entities: Entity[], id: number): Entity {
        return this._.find(entities, e => e.id === id);
    }

    protected onAdd(concreteEvent: ConcreteEvent, $event) {

        const dialogConf: IDialogConcreteEventConf = {
            targetEvent: $event,
            canEdit: true,
            canRemove: false,

            // events: this.events,
            services: this.services,
            categories: this.categories,
            rooms: this.rooms,
            therapists: this.therapists,
            clients: this.clients,
            sessions: this.sessions,
            restrictions: this.restrictions,
            subStatuses: this.concreteEventSubStatusesNames,
        };
        return this.DialogService.dialogConcreteEvent(concreteEvent, dialogConf)
            .then(res => this.onAddDialogConcreteEvent(res, $event));


    }

    protected onEdit(concreteEvent: ConcreteEvent, $event): Promise<any> {

        const dialogConf: IDialogConcreteEventConf = {
            targetEvent: $event,
            canEdit: true,
            canRemove: true,

            // events: this.events,
            services: this.services,
            categories: this.categories,
            rooms: this.rooms,
            therapists: this.therapists,
            clients: this.clients,
            sessions: this.sessions,
            restrictions: this.restrictions,
            subStatuses: this.concreteEventSubStatusesNames,
        };

        return this.DialogService.dialogConcreteEvent(concreteEvent, dialogConf)
            .then((res: IDialogConcreteEventRes) => this.onEditDialogConcreteEvent(res, $event));
    }

    protected onDelete(concreteEvent: ConcreteEvent, $event) {
        const noEmails = false;

        const dialigConf: IMdDialogPreset = {
            title: 'Warning',
            textContent: 'Are you sure to remove the Concrete Calendar Event?',
            targetEvent: $event,
            cancel: 'Cancel',
            ok: 'Remove',
        };
        this.DialogService.dialogConfirm(dialigConf)
            .then(() => this.deleteEvent(concreteEvent, noEmails));
    }

    private onAddDialogConcreteEvent(res: IDialogConcreteEventRes, $event): Promise<any> {
        const concreteEvent: ConcreteEvent = res.baseConcreteEvent;
        const noEmails: boolean = res.noEmails;

        return this.postEvent(concreteEvent, $event, noEmails, false);
    }

    private onEditDialogConcreteEvent(res: IDialogConcreteEventRes, $event): Promise<any> {
        const concreteEvent: ConcreteEvent = res.baseConcreteEvent;
        const noEmails: boolean = res.noEmails;

        if (concreteEvent) {// edited
            return this.putEvent(concreteEvent, $event, noEmails, false);
        } else { // removed
            return this.deleteEvent(concreteEvent, noEmails);
        }
    }

    private postEvent(concreteEvent: ConcreteEvent, $event, noEmails: boolean, force: boolean): Promise<any> {
        return this.ApiReconcileService.postEvent(concreteEvent, noEmails, force)
        // .then(
        //     (ignore: ConcreteEvent) => ignore,
        //     (err) => this.handleAddConcreteCrossing(concreteEvent, err, $event, noEmails),
        // )
            .then(() => this.update())
            .then(() => {
                this.toastr.info('Concrete event created successfully');
            });
    }


    private putEvent(concreteEvent: ConcreteEvent, $event, noEmails: boolean, force: boolean): Promise<any> {
        return this.ApiReconcileService.putEvent(concreteEvent, noEmails, force)
        // .then(
        //     (ignore: CrossingData) => ignore,
        //     (err) => this.handleEditConcreteCrossing(concreteEvent, err, $event, noEmails),
        // )
            .then(() => this.update())
            .then(() => {
                this.toastr.info('Concrete event edited successfully');
            });
    }

    private deleteEvent(concreteEvent: ConcreteEvent, noEmails: boolean): Promise<any> {
        return this.ApiBookingService.removeEvent(concreteEvent, noEmails)
            .then(() => this.update())
            .then(() => {
                this.toastr.info('Concrete event deleted successfully');
            });
    }

    // private handleEditConcreteCrossing(concreteEvent: ConcreteEvent, err, $event, noEmails: boolean): Promise<any> {
    //     const crossingData: CrossingData = err.data as CrossingData;
    //     return this.handleErrorCrossing(crossingData, $event)
    //         .then((force: boolean) => {
    //             if (force) {
    //                 return this.putEvent(concreteEvent, $event, noEmails, true);
    //             } else {
    //                 return this.onEdit(concreteEvent, $event);
    //             }
    //         });
    // }

    // private handleAddConcreteCrossing(concreteEvent: ConcreteEvent, err, $event, noEmails: boolean): Promise<any> {
    //     const crossingData: CrossingData = err.data as CrossingData;
    //     return this.handleErrorCrossing(crossingData, $event)
    //         .then((force: boolean) => {
    //             if (force) {
    //                 return this.postEvent(concreteEvent, $event, noEmails, true);
    //             } else {
    //                 return this.onAdd(concreteEvent, $event);
    //             }
    //         });
    // }

    // private handleErrorCrossing(crossingData: CrossingData, $event): Promise<boolean> {
    //     const dataArr: CrossingData[] = [crossingData];
    //     const useForce: boolean = this.shouldUseForce(dataArr);
    //     const dialogConf: IDialogCrossingDataConf = {
    //         targetEvent: $event,
    //         useConfirmBtn: useForce,
    //         useEditBtn: true,
    //     };
    //     return this.DialogService.dialogCrossingData(dataArr, dialogConf);
    // }

    // private shouldUseForce(crossingDataArr: CrossingData[]): boolean {
    //     const hist: Collection<number> = this.Utils.calculateCrossingHistogram(crossingDataArr);
    //     if (hist[CrossingDataType.calendar] || hist[CrossingDataType.concrete]) {
    //         return false;
    //     } else if (hist[CrossingDataType.unavailable]) {
    //         return true;
    //     } else {// hist[CrossingDataType.confirmation]
    //         return false;
    //     }
    // }

}
