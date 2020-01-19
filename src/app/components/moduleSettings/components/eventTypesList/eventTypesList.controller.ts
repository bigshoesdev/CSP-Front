import {AbstractListController} from '../../../../controllers/abstractList.controller';
import {TableConf} from '../../../../model/TableConf';
import {DialogService} from '../../../../services/dialog/dialog.service';
import {IToastrService} from 'angular-toastr';
import {LoDashStatic} from '@types/lodash';
import {EventTypes} from '../../../../model/rest/EventTypes';

export class EventTypesListController extends AbstractListController {
    /** @ngInject */
    constructor($scope,
                $state: ng.ui.IStateService,
                Restangular,
                _: LoDashStatic,
                DialogService: DialogService,
                toastr: IToastrService) {
        super(fillUpScope($scope), $state, Restangular, _, DialogService, toastr);

        function fillUpScope($scope) {
            $scope.collectionUrl = 'eventTypes';
            $scope.elementUrl = 'eventTypes';
            $scope.sort = '+id';
            $scope.filterParams = null;
            return $scope;
        }

        $scope.listTitle = 'Event types';
    }

    getTableConf(taxesList): TableConf {
        const self = this;
        return {
            thList: [
                {title: 'ID', sortKey: 'id', width: 10},
                {title: 'name', sortKey: 'name'},
            ],
            trList: taxesList.map((model) => {
                return {
                    model,
                    tdList: [{
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.id'}
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.name'}
                    }
                    ]
                };
            }),
            itemClick: () => false,
            actions: [
                {
                    fn: (item: EventTypes, event: Event) => {
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
