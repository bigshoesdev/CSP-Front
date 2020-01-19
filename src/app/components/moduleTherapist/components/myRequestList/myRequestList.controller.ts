import {AbstractListController} from '../../../../controllers/abstractList.controller';
import {TableConf} from '../../../../model/TableConf';
import {DialogService} from '../../../../services/dialog/dialog.service';

export class MyRequestListController extends AbstractListController {

    getTableConf(categoryList): TableConf {
        const __this = this;
        return {
            thList: [
                {title: 'Start Date', sortKey: 'startDate'},
                {title: 'End Date', sortKey: 'endDate'},
                {title: 'Message', sortKey: null},
                {title: 'Therapists Requests', sortKey: null}
            ],
            trList: categoryList.map((category) => {
                return {
                    model: category,
                    tdList: [{
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.startDate'}
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.endDate'}
                    }, {
                        renderAsConf: {
                            directiveName: 'render-body',
                            directiveVal: 'tr.model.therapistsRequests[0].message'
                        }
                    }, {
                        renderAsConf: {
                            directiveName: 'render-therapists-requests',
                            directiveVal: 'tr.model.therapistsRequests'
                        }
                    }]
                };
            }),
            actions: [{// edit button
                fn: (item, event) => {
                    __this.$state.go('auth.therapist.availability.request', {requestId: item.id});
                },
                buttonClass: 'md-primary',
                label: 'Edit',
                iconName: 'edit'
            }]
        };

    }


    /** @ngInject */
    constructor($scope,
                $state: ng.ui.IStateService,
                Restangular,
                _,
                DialogService: DialogService,
                toastr) {

        super(fillUpScope($scope), $state, Restangular, _, DialogService, toastr);

        function fillUpScope($scope) {
            $scope.collectionUrl = '/availability/requests/mine';
            $scope.elementUrl = 'availability/request';
            $scope.sort = '+id';
            $scope.filterParams = null;
            return $scope;
        }

    }

    canLoadData(): boolean {
        return true;
    }

}
