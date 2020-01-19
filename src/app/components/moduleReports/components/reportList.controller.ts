import {AbstractListController} from '../../../controllers/abstractList.controller';
import {TableConf} from '../../../model/TableConf';
import {DialogService} from '../../../services/dialog/dialog.service';
import {IToastrService} from 'angular-toastr';
import {LoDashStatic} from '@types/lodash';
import {Event} from '../../../model/rest/Event';

export class ReportListController extends AbstractListController {
    /** @ngInject */
    constructor($scope,
                $state: ng.ui.IStateService,
                Restangular,
                _: LoDashStatic,
                DialogService: DialogService,
                toastr: IToastrService) {
        super(fillUpScope(), $state, Restangular, _, DialogService, toastr);

        function fillUpScope() {
            $scope.collectionUrl = 'reports';
            $scope.elementUrl = 'reports';
            $scope.sort = '+id';
            $scope.filterParams = null;
            return $scope;
        }

        $scope.listTitle = 'Report list';
    }

    getTableConf(taxesList): TableConf {
        const self = this;
        return {
            thList: [
                {title: 'ID', sortKey: 'id'},
                {title: 'type', sortKey: 'type'},
                {title: 'Date from', sortKey: 'dateFrom'},
                {title: 'Date to', sortKey: 'dateTo'},
                {title: 'autoupdate', sortKey: 'autoupdate'},
                {title: 'Url key', sortKey: 'url'},
            ],
            trList: taxesList.map((model) => {
                return {
                    model,
                    tdList: [
                        {
                            renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.id'}
                        },
                        {
                            renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.type'}
                        },
                        {
                            renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.dateFrom'}
                        },
                        {
                            renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.dateTo'}
                        },
                        {
                            renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.autoupdate'}
                        },
                        {
                            renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.url'}
                        }
                    ]
                };
            }),
            itemClick: (item) => {
                // self.$state.go('auth.reports.reportEdit', {reportId: item.id})
                // return false;
            },
            actions: [
                {
                    fn: (item: Event, event: Event) => {
                        this.deleteItemConfirm(item, event);
                    },
                    buttonClass: 'md-warn',
                    label: 'Delete',
                    iconName: 'delete_forever',
                }]
        };
    }

    canLoadData(): boolean {
        return true;
    }

}
