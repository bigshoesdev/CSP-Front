import {AbstractListController} from '../../../../controllers/abstractList.controller';
import {LocalStorageService} from '../../../../services/storage/local-storage.service';
import {dateFormat} from '../../../../services/app.constant';
import {AvailabilityHistoryRecord} from '../../../../model/rest/AvailabilityHistoryRecord';
import {TableConf} from '../../../../model/TableConf';
import {DialogService} from '../../../../services/dialog/dialog.service';
import {Utils} from '../../../../services/utils.service';
import * as restangular from 'restangular';
import {IToastrService}from 'angular-toastr';
declare let angular: any;

export class AvailabilityTherapistHistoryController extends AbstractListController {

    getTableConf(historyList: AvailabilityHistoryRecord[]): TableConf {
        const __this = this;
        return {
            thList: [
                {title: 'Edit date', sortKey: 'editDate'},
                {title: 'User name', sortKey: 'userSimple.name'},
                {title: 'User email', sortKey: 'userSimple.email'}
            ],
            trList: historyList.map((history: AvailabilityHistoryRecord) => {
                return {
                    model: history,
                    tdList: [{
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.editDate'}
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.userSimple.name'}
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.userSimple.email'}
                    }]
                };
            }),
            actions: [{// view button
                fn: (item: AvailabilityHistoryRecord, $event) => {

                    const therapistId = __this.$scope.therapist.id;
                    const recordId = item.id;

                    __this.$state.go('auth.availability.viewTherapistHistoryRecord', {
                        therapistId: therapistId,
                        recordId: recordId
                    });
                },
                buttonClass: 'md-primary',
                label: 'View',
                iconName: 'pageview'
            }]
        };

    }

    /** @ngInject */
    constructor(public therapist,
                public $scope,
                public $state: ng.ui.IStateService,
                public Restangular: restangular.IService,
                public _,
                public DialogService: DialogService,
                public toastr: IToastrService,
                public Utils: Utils,
                public LocalStorageService: LocalStorageService,
                public moment,
                public $mdDialog) {

        super(fillUpScope($scope), $state, Restangular, _, DialogService, toastr);

        function fillUpScope($scope) {
            $scope.therapist = therapist;
            $scope.collectionUrl = 'availability/therapist/' + therapist.id + '/history';
            $scope.elementUrl = 'availability/history';
            $scope.sort = '+id';
            $scope.filterParams = {
                dateFrom: null,
                dateTo: null
            };
            $scope.hideOflineFilter = true;

            const historyDateFrom = LocalStorageService.getItem('moduleAvailability.historyDateFrom');
            if (historyDateFrom) {
                const momentFrom = moment(historyDateFrom, dateFormat);
                $scope.dateFrom = momentFrom.toDate();
                $scope.filterParams.dateFrom = momentFrom.isValid() ? momentFrom.format(dateFormat) : null;
            }

            const historyDateTo = LocalStorageService.getItem('moduleAvailability.historyDateTo');
            if (historyDateTo) {
                const momentTo = moment(historyDateTo, dateFormat);
                $scope.dateTo = momentTo.toDate();
                $scope.filterParams.dateTo = momentTo.isValid() ? momentTo.format(dateFormat) : null;
            }

            return $scope;
        }

        $scope.apply = () => {
            this.apply();
        };
        $scope.dateFrom = new Date();
        $scope.dateTo = new Date();
        $scope.clearDateFrom = () => {
            $scope.dateFrom = null;
            this.LocalStorageService.setItem('moduleAvailability.historyDateFrom', null);
            this.apply();
        };
        $scope.clearDateTo = () => {
            $scope.dateTo = null;
            this.LocalStorageService.setItem('moduleAvailability.historyDateTo', null);
            this.apply();
        };

        this.apply();
    }

    private apply() {
        if (this.$scope.dateFrom && this.$scope.dateTo) {
            const dateFrom = this.Utils.dateToFormat(this.$scope.dateFrom);
            this.LocalStorageService.setItem('moduleAvailability.historyDateFrom', dateFrom);

            const dateTo = this.Utils.dateToFormat(this.$scope.dateTo);
            this.LocalStorageService.setItem('moduleAvailability.historyDateTo', dateTo);

            this.$scope.filterParams = {
                dateFrom: dateFrom,
                dateTo: dateTo
            };
            this.loadData();
        }
    }

    canLoadData(): boolean {
        return this.$scope.dateFrom && this.$scope.dateTo;
    }
}

