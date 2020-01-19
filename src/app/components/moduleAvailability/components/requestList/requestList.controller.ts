import {AbstractListController} from '../../../../controllers/abstractList.controller';
import {TableConf} from '../../../../model/TableConf';
import {DialogService} from '../../../../services/dialog/dialog.service';
import * as restangular from 'restangular';

export class RequestListController extends AbstractListController {
    /** @ngInject */
    constructor($scope,
                $state: ng.ui.IStateService,
                Restangular: restangular.IService,
                _,
                DialogService: DialogService,
                toastr) {

        super(fillUpScope($scope), $state, Restangular,
            _, DialogService, toastr);

        function fillUpScope($scope) {
            $scope.collectionUrl = 'availability/requests';
            $scope.elementUrl = 'availability/request';
            $scope.sort = '+id';
            $scope.filterParams = null;
            return $scope;
        }

    }

    getTableConf(categoryList): TableConf {
        const __this = this;
        return {
            thList: [
                {title: 'Start Date', sortKey: 'startDate'},
                {title: 'End Date', sortKey: 'endDate'},
                {title: 'Therapists Requests', sortKey: null}
            ],
            itemClick: (item) => __this.$state.go('auth.availability.requestEdit', {requestId: item.id}),
            trList: categoryList.map((category) => {
                return {
                    model: category,
                    tdList: [{
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.startDate'}
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.endDate'}
                    }, {
                        renderAsConf: {
                            directiveName: 'render-therapists-requests',
                            directiveVal: 'tr.model.therapistsRequests'
                        }
                    }]
                };
            }),
            actions: [
                {
                    fn: (item, event) => {
                        __this.deleteItemConfirm(item, event);
                    },
                    buttonClass: 'md-warn',
                    label: 'Delete',
                    iconName: 'delete_forever'
                }
            ]
        };

    }

    getDeleteConfirmQuestion(item): string {
        return 'Are you sure to delete Availability Requests #' + item.id + '?';
    }

    canLoadData(): boolean {
        return true;
    }

}
