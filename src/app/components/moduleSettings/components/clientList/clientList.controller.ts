import {AbstractListController} from '../../../../controllers/abstractList.controller';
import {TableConf} from '../../../../model/TableConf';
import {DialogService} from '../../../../services/dialog/dialog.service';
import * as restangular from 'restangular';
import {LoDashStatic} from '@types/lodash';
import {IToastrService} from 'angular-toastr';

export class ClientListController extends AbstractListController {
    /** @ngInject */
    constructor($scope,
                $state: ng.ui.IStateService,
                Restangular: restangular.IService,
                _: LoDashStatic,
                DialogService: DialogService,
                toastr: IToastrService) {

        super(fillUpScope($scope), $state, Restangular, _, DialogService, toastr);

        function fillUpScope($scope) {
            $scope.collectionUrl = 'clients';
            $scope.elementUrl = 'client';
            $scope.sort = '+id';
            $scope.filterParams = null;
            return $scope;
        }

        $scope.listTitle = 'Clients';
    }

    getTableConf(clientList): TableConf {
        const self = this;
        return {
            thList: [
                {title: 'ID', sortKey: 'id', width: 10},
                {title: 'Name', sortKey: 'name'}
            ],
            trList: clientList.map((model) => {
                return {
                    model,
                    tdList: [{
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.id'}
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.name'}
                    }]
                };
            }),
            itemClick: (item) => self.$state.go('auth.settings.clientShow', {clientId: item.id}),
            actions: [
                {
                    fn: (item, event) => {
                        this.deleteItemConfirm(item, event);
                    },
                    buttonClass: 'md-warn',
                    label: 'Delete',
                    iconName: 'delete_forever'
                }
            ]
        };
    }

    canLoadData(): boolean {
        return true;
    }
}
