import {LoDashStatic} from '@types/lodash';
import {AbstractListController} from '../../../../controllers/abstractList.controller';
import {TableConf} from '../../../../model/TableConf';
import {DialogService} from '../../../../services/dialog/dialog.service';
import {IToastrService} from 'angular-toastr';
import {Taxes} from '../../../../model/rest/Taxes';

export class TaxesListController extends AbstractListController {
    /** @ngInject */
    constructor($scope,
                $state: ng.ui.IStateService,
                Restangular,
                _: LoDashStatic,
                DialogService: DialogService,
                toastr: IToastrService) {
        super(fillUpScope($scope), $state, Restangular, _, DialogService, toastr);

        function fillUpScope($scope) {
            $scope.collectionUrl = 'taxes';
            $scope.elementUrl = 'taxes';
            $scope.sort = '+id';
            $scope.filterParams = null;
            return $scope;
        }

        $scope.listTitle = 'Taxes';
    }

    getTableConf(taxesList): TableConf {
        const self = this;
        return {
            thList: [
                {title: 'ID', sortKey: 'id', width: 10},
                {title: 'Code', sortKey: 'code', width: 20},
                {title: 'Title', sortKey: 'title'}
            ],
            trList: taxesList.map((model) => {
                return {
                    model,
                    tdList: [{
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.id'}
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.code'}
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.title'}
                    }]
                };
            }),
            itemClick: (item) => self.$state.go('auth.settings.taxShow', {taxId: item.id}),
            actions: [
                {
                    fn: (item: Taxes, event: Event) => {
                        this.deleteItemConfirm(item, event);
                    },
                    buttonClass: 'md-warn',
                    label: 'Delete',
                    iconName: 'delete_forever',
                }
            ]
        };
    }

    canLoadData(): boolean {
        return true;
    }
}
