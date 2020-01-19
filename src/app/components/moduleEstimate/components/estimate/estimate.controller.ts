import {Estimate} from '../../../../model/rest/Estimate';
import {Session} from '../../../../model/rest/Session';
import {Client} from '../../../../model/rest/Client';
import {EstimateService} from '../../services/estimate.service';
import {Service} from '../../../../model/rest/Service';
import {ConcreteEventReconcileAction, ConcreteEventReconcileRow, } from '../../directives/concreteEventReconcileList.directive';
import {DialogService, IDialogEstimateEventsSelectConf, IDialogEstimateEventsSelectRes} from '../../../../services/dialog/dialog.service';
import {Room} from '../../../../model/rest/Room';
import {ServiceCategory} from '../../../../model/rest/ServiceCategory';
import {Therapist} from '../../../../model/rest/Therapist';
import {Restriction} from '../../../../model/rest/Restriction';
import {ConcreteEventSubStatus} from '../../../../model/rest/ConcreteEventSubStatus';
import {Utils} from '../../../../services/utils.service';
import {ApiBookingService} from '../../../../services/api/api-booking.service';
import {ApiReconcileService} from '../../../../services/api/api-reconcile.service';
import {ConcreteEventReconcile} from '../../../../model/rest/ConcreteEventReconcile';
import {ConcreteEventState_Ns} from '../../../../model/rest/ConcreteEventState';
import ConcreteEventState = ConcreteEventState_Ns.ConcreteEventState;
import {ConcreteEventReconcileState_Ns} from '../../../../model/rest/ConcreteEventReconcileState';
import ConcreteEventReconcileState = ConcreteEventReconcileState_Ns.ConcreteEventReconcileState;
import {ApiEstimateService} from '../../../../services/api/api-estimate.service';
import {Id} from '../../../../model/rest/Id';
import {IToastrService} from 'angular-toastr';

declare const angular: any;

export class EstimateController {

    concreteEventSubStatusesNames: string[];

    private dialogSelectionConf: IDialogEstimateEventsSelectConf;

    isAdditionMode: boolean;

    private itemActions: ConcreteEventReconcileAction[] = [{
        title: 'Delete',
        fn: (row: ConcreteEventReconcileRow, $event) => this.onRemoveOne(row, $event),
        iconName: 'delete',
    }];

    /** @ngInject */
    constructor(protected estimate: Estimate,
                protected isCreationMode: boolean,
                protected isReadOnly: boolean,
                protected sessions: Session[],
                protected clients: Client[],
                protected services: Service[],
                protected therapists: Therapist[],
                protected rooms: Room[],
                protected categories: ServiceCategory[],
                protected restrictions: Restriction[],
                protected concreteEventSubStatuses: ConcreteEventSubStatus[],
                // injexted
                protected $scope,
                protected $state: ng.ui.IStateService,
                protected _,
                protected Utils: Utils,
                protected toastr: IToastrService,
                protected DialogService: DialogService,
                protected ApiBookingService: ApiBookingService,
                protected ApiReconcileService: ApiReconcileService,
                protected ApiEstimateService: ApiEstimateService,
                protected EstimateService: EstimateService) {

        this.isAdditionMode = false;

        this.$scope.sessions = this.sessions;
        this.$scope.clients = this.clients;
        this.concreteEventSubStatusesNames = this.concreteEventSubStatuses.map(ss => ss.name);

        this.initEstimate();

        $scope.onSelect = ($event) => this.onSelect($event);
        $scope.onAddSelected = ($event) => this.onAddSelected($event);
        $scope.onCancel = ($event) => this.onCancel($event);
        $scope.onCreate = ($event) => this.onCreate($event);
        $scope.onSendEstimation = ($event) => this.onSendEstimation($event);
        $scope.onRowChecked = (eventReconcileRow: ConcreteEventReconcileRow) => this.onRowChecked(eventReconcileRow);

        $scope.selectionActions = [];
        if (!this.isCreationMode && !this.isReadOnly) {
            $scope.itemActions = this.itemActions;
        }

        this.dialogSelectionConf = {
            sessions: this.sessions,
            session: null,
            clients: [],
            client: null,
            fromDate: null,
            toDate: null,
            selectedStates: [ConcreteEventReconcileState.reconciled.toString()],
        };
    }

    private initEstimate() {
        this.$scope.estimate = this._.cloneDeep(this.estimate);
        this.$scope.reconcileEventRows = this.EstimateService.makeEventRows(this.estimate.events, this.services, this.clients) || [];
    }

    private updateEstimate(): Promise<Estimate> {
        return this.ApiEstimateService.getEstimate(this.estimate.id)
            .then((estimate: Estimate) => {
                this.estimate = estimate;
                this.initEstimate();
                return estimate;
            });
    }

    private onSelect($event) {
        this.dialogSelectionConf.targetEvent = $event;
        this.DialogService.dialogEstimateEventsSelect(this.dialogSelectionConf)
            .then((res: IDialogEstimateEventsSelectRes) => {
                this._.assign(this.dialogSelectionConf, res);
                this.selectEvents()
                    .then((rows: ConcreteEventReconcileRow[]) => this.handleSelectedEventsRows(rows));
            });
    }

    private handleSelectedEventsRows(rows: ConcreteEventReconcileRow[]) {
        rows.forEach((row: ConcreteEventReconcileRow) => row.selected = true);
        this.$scope.ifSomeRowSelected = rows.length > 0;

        if (this.isCreationMode) {
            this.$scope.reconcileEventRows = rows;
        } else {
            this.isAdditionMode = true;
            this.$scope.itemActions = []; // you can't remove in addition mode

            const reconcileEventRows: ConcreteEventReconcileRow[] = this.$scope.reconcileEventRows;
            reconcileEventRows.forEach((row: ConcreteEventReconcileRow) => {
                row.selected = false;
                row.disabled = true;
            });

            // only new event will be selected after merging
            this.$scope.reconcileEventRows = this.Utils.mergeArrays(rows, reconcileEventRows, (row: ConcreteEventReconcileRow) => row.reconcileEvent.id);
        }
    }

    private onCreate($event) {
        const clientId: number = this.dialogSelectionConf.client.id;
        const concreteEventReconcileIds: number[] = this.$scope.reconcileEventRows
            .filter((row: ConcreteEventReconcileRow) => row.selected)
            .map((row: ConcreteEventReconcileRow) => row.reconcileEvent.id);

        this.ApiEstimateService.postEstimateForClient(clientId, concreteEventReconcileIds)
            .then((idResponse: Id) => {
                this.toastr.info('Estimate successfully created');
                this.$state.go('auth.estimate.edit', {
                    estimateId: idResponse.id,
                });
            });
    }

    private onSendEstimation($event) {
        this.ApiEstimateService.postEstimateSend(this.estimate.id)
            .then(() => {
                this.toastr.info('Estimate successfully sent to remote server');
                this.updateEstimate();
            });
    }

    private onCancel($event) {
        this.updateEstimate()
            .then(() => {
                this.$scope.itemActions = this.itemActions;
                this.isAdditionMode = false;
            });
    }

    private onAddSelected($event) {
        const estimateId: number = this.estimate.id;
        const reconcileEventRows: ConcreteEventReconcileRow[] = this.$scope.reconcileEventRows;
        const eventsIds: number[] = reconcileEventRows
            .filter((row: ConcreteEventReconcileRow) => row.selected)
            .map((row: ConcreteEventReconcileRow): number => row.reconcileEvent.id);
        this.ApiEstimateService.putEstimateEvents(estimateId, eventsIds)
            .then(() => {
                this.$scope.itemActions = this.itemActions;
                this.isAdditionMode = false;
                this.toastr.info('Events successfully added to Estimate');
                this.updateEstimate();
            }, () => {
                this.$scope.itemActions = this.itemActions;
                this.isAdditionMode = false;
                this.updateEstimate();
            });
    }

    private onRemoveOne(row: ConcreteEventReconcileRow, $event) {
        const estimateId: number = this.estimate.id;
        const eventId: number = row.reconcileEvent.id;
        this.ApiEstimateService.deleteEstimateEvent(estimateId, eventId)
            .then(() => {
                this.toastr.info('Event removed from Estimate successfully');
                this.updateEstimate();
            });
    }


    private selectEvents(): Promise<ConcreteEventReconcileRow[]> {
        const dateStart = this.Utils.dateToFormat(this.dialogSelectionConf.fromDate);
        const dateEnd = this.Utils.dateToFormat(this.dialogSelectionConf.toDate);
        const clientId = this.dialogSelectionConf.client.id;
        return this.ApiReconcileService.getReconcileEventsBetweenDate(dateStart, dateEnd, clientId)
            .then((reconcileEvents: ConcreteEventReconcile[]) => {
                const rows: ConcreteEventReconcileRow[] = this.EstimateService.makeEventRows(reconcileEvents, this.services, this.clients) || [];
                return this.filterByStatuses(rows, this.dialogSelectionConf.selectedStates);
            });
    }

    private onRowChecked(eventReconcileRow: ConcreteEventReconcileRow) {
        this.$scope.ifSomeRowSelected = this.$scope.reconcileEventRows.some((row: ConcreteEventReconcileRow) => row.selected);
    }

    private filterByStatuses(rows: ConcreteEventReconcileRow[], statuses: string[]): ConcreteEventReconcileRow[] {
        return rows.filter((row: ConcreteEventReconcileRow): boolean => {
            const eventReconcile: ConcreteEventReconcile = row.reconcileEvent;

            const eventState: string = ConcreteEventState[eventReconcile.concreteEvent.state];
            const reconcileState: string = ConcreteEventReconcileState[eventReconcile.reconcileState];
            return statuses.indexOf(eventState) >= 0
                || statuses.indexOf(reconcileState) >= 0;
        });
    }

}
