import {AbstractListController} from '../../../../controllers/abstractList.controller';
import {TableConf} from '../../../../model/TableConf';
import {DialogService} from '../../../../services/dialog/dialog.service';
import {IToastrService} from 'angular-toastr';
import {Event} from '../../../../model/rest/Event';
import {Service} from '../../../../model/rest/Service';

export class ServiceListController extends AbstractListController {

    /** @ngInject */
    constructor($scope,
                $state: ng.ui.IStateService,
                Restangular,
                _,
                DialogService: DialogService,
                toastr: IToastrService,) {

        super(fillUpScope($scope), $state, Restangular, _, DialogService, toastr);

        function fillUpScope($scope) {
            $scope.collectionUrl = 'services';
            $scope.elementUrl = 'services';
            $scope.sort = '+id';
            $scope.filterParams = null;
            return $scope;
        }
    }

    getTableConf(serviceList): TableConf {
        const self = this;
        return {
            thList: [
                {title: 'ID', sortKey: 'id', width: 10},
                {title: 'name', sortKey: 'name', width: 30},
                {title: 'price', sortKey: 'price'},
                {title: 'Duration', sortKey: 'time.processing', width: 10},
                {title: 'Clean time', sortKey: 'time.clean'},
                {title: 'Tax', sortKey: 'tax.id'},
            ],
            trList: serviceList.map((model) => {
                console.log('MODEL', model);
                return {
                    model,
                    tdList: [{
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.id'}
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.name'}
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.price'}
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.time.processing'}
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.time.clean'}
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.tax.title'}
                    }]
                };
            }),
            itemClick: (item: Service) => self.$state.go('auth.settings.serviceShow', {serviceId: item.id}),
            actions: [
                {
                    fn: (item: Service, event: Event) => {
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
