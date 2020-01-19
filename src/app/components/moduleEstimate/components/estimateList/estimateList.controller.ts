import {AbstractListController} from '../../../../controllers/abstractList.controller';
import {TableConf} from '../../../../model/TableConf';
import {DialogService} from '../../../../services/dialog/dialog.service';
import {Estimate} from '../../../../model/rest/Estimate';
import {ConcreteEventReconcile} from '../../../../model/rest/ConcreteEventReconcile';
import {Client} from '../../../../model/rest/Client';
import {Collection} from '../../../../model/Collection';
import {Utils} from '../../../../services/utils.service';
import {dateFormat} from '../../../../services/app.constant';
import {Moment} from '../../../../../../bower_components/moment/moment';

class EstimateInfo {
    estimate: Estimate;
    startDate: string;
    endDate: string;
    eventCount: number;
    sum: number;
    clientName: string;
}

export class EstimateListController extends AbstractListController {

    private id2Client: Collection<Client> = {};

    /** @ngInject */
    constructor(clients: Client[],
                // injectes
                $scope,
                $state: ng.ui.IStateService,
                Restangular,
                _,
                DialogService: DialogService,
                private Utils: Utils,
                private moment,
                toastr) {

        super(fillUpScope($scope), $state, Restangular, _, DialogService, toastr);

        function fillUpScope($scope) {
            $scope.collectionUrl = 'estimates';
            $scope.elementUrl = 'estimates';
            $scope.sort = '+id';
            $scope.filterParams = null;
            return $scope;
        }

        this.id2Client = _.keyBy(clients, 'id');

    }

    getTableConf(dataList: Estimate[]): TableConf {
        const estimateInfoList: EstimateInfo[] = dataList.map((estimate: Estimate): EstimateInfo => {
            let sum: number = 0;

            const first: ConcreteEventReconcile = estimate.events[0];
            let startDate: Moment = this.moment(first.concreteEvent.date, dateFormat);
            let endDate: Moment = this.moment(first.concreteEvent.date, dateFormat);
            estimate.events.forEach((event: ConcreteEventReconcile) => {
                sum += event.cost;

                const date: Moment = this.moment(event.concreteEvent.date, dateFormat);
                if (date.isValid()) {
                    if (date.isAfter(endDate)) {
                        endDate = date;
                    }
                    if (date.isBefore(startDate)) {
                        startDate = date;
                    }
                }
            });

            const client: Client = this.id2Client[estimate.clientId];
            const clientName = client && client.name;

            return {
                estimate: estimate,
                startDate: startDate.format(dateFormat),
                endDate: endDate.format(dateFormat),
                eventCount: estimate.events.length,
                sum: sum,
                clientName: clientName,
            } as EstimateInfo;
        });

        return {
            thList: [
                {title: 'Start date', sortKey: null},
                {title: 'End date', sortKey: null},
                {title: 'Event count', sortKey: null},
                {title: 'Sum', sortKey: null},
                {title: 'Client name', sortKey: null},
                {title: 'Sent to external', sortKey: null},
            ],
            trList: estimateInfoList.map((estimateInfo: EstimateInfo) => {
                return {
                    model: estimateInfo,
                    tdList: [{
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.startDate'},
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.endDate'},
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.eventCount'},
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.sum'},
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.clientName'},
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.estimate.sent'},
                    }],
                };
            }),
            actions: [{
                fn: (item: EstimateInfo, event) => {
                    const estimate: Estimate = item.estimate;
                    this.$state.go('auth.estimate.edit', {estimateId: estimate.id});
                },
                buttonClass: 'md-primary',
                label: 'Edit',
                iconName: 'edit',
            }, {
                fn: (item: EstimateInfo, event) => {
                    const estimate: Estimate = item.estimate;
                    if (estimate.sent) {
                        this.toastr.error('You can\'t delete an estimate. The estimate have already sent.');
                    } else {
                        this.deleteItemConfirm(estimate, event);
                    }
                },
                buttonClass: 'md-warn',
                label: 'Delete',
                iconName: 'delete_forever',
            }],
        };


    }

    canLoadData(): boolean {
        return true;
    }
}
