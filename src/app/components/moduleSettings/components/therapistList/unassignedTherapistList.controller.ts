import {AbstractListController} from '../../../../controllers/abstractList.controller';
import {TableConf} from '../../../../model/TableConf';
import {DialogService} from '../../../../services/dialog/dialog.service';

export class UnassignedTherapistListController extends AbstractListController {

    getTableConf(therapistsList): TableConf {
        const __this = this;
        return {
            thList: [
                {title: 'ID', sortKey: 'id'},
                {title: 'Name', sortKey: 'name'},
                {title: 'Email', sortKey: 'email'}
            ],
            trList: therapistsList.map((category) => {
                return {
                    model: category,
                    tdList: [{
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.id'}
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.name'}
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.email'}
                    }]
                };
            }),
            actions: [{// edit button
                fn: (item, event) => {
                    __this.$state.go('auth.settings.therapistEdit', {therapistId: item.id});
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
            $scope.collectionUrl = 'therapists/unassigned';
            $scope.elementUrl = 'therapist';
            $scope.sort = '+id';
            $scope.filterParams = null;
            return $scope;
        }

        $scope.listTitle = 'Unassigned Therapists';

    }

    canLoadData(): boolean {
        return true;
    }

}

