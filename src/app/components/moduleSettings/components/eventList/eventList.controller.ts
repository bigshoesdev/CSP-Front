import {AbstractListController} from '../../../../controllers/abstractList.controller';
import {TableConf} from '../../../../model/TableConf';
import {DialogService} from '../../../../services/dialog/dialog.service';
import {IToastrService} from 'angular-toastr';
import {LoDashStatic} from '@types/lodash';
import {Event} from '../../../../model/rest/Event';

export class EventListController extends AbstractListController {
    /** @ngInject */
    constructor($scope,
                $state: ng.ui.IStateService,
                Restangular,
                _: LoDashStatic,
                DialogService: DialogService,
                toastr: IToastrService) {
        super(fillUpScope($scope), $state, Restangular, _, DialogService, toastr);

        function fillUpScope($scope: any) {
            $scope.collectionUrl = 'events';
            $scope.elementUrl = 'events';
            $scope.sort = '+id';
            $scope.filterParams = null;
            return $scope;
        }

        $scope.listTitle = 'Events';
        $scope.selected = {};
    }

    getTableConf(taxesList): TableConf {
        const self = this;
        return {
            thList: [
                {title: 'ID', sortKey: 'id', width: 8},
                {title: 'name', sortKey: 'name', width: 40},
                {title: 'price', sortKey: 'price', width: 10},
                {title: 'Duration', sortKey: 'time.processing', width: 10},
                {title: 'Clean time', sortKey: 'time.clean', width: 10},
                {title: 'Tax', sortKey: 'tax.id', width: 10},
                {title: 'Type', sortKey: 'tax.eventType', width: 10},
            ],
            trList: taxesList.map((model) => {
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
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.eventType.name'}
                    }]
                };
            }),
            itemClick: (item) => self.$state.go('auth.settings.eventShow', {eventId: item.id}),
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
