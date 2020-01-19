import {AbstractListController} from '../../../../controllers/abstractList.controller';
import {TableConf} from '../../../../model/TableConf';
import {DialogService} from '../../../../services/dialog/dialog.service';
import {IToastrService} from 'angular-toastr';

export class NoaccountTherapistListController extends AbstractListController {

    getTableConf(categoryList): TableConf {
        return {
            thList: [
                {title: 'ID', sortKey: 'id'},
                {title: 'Name', sortKey: 'name'},
                {title: 'Email', sortKey: 'email'},
                {title: 'Check', sortKey: ''}
            ],
            trList: categoryList.map((category) => {
                return {
                    model: category,
                    tdList: [{
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.id'}
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.name'}
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.email'}
                    }, {
                        renderAsConf: [
                            {directiveName: 'render-check-item', directiveVal: 'tr.model.id'},
                            {directiveName: 'render-check-list', directiveVal: 'selectedTherapistIds'}
                        ]
                    }]
                };
            }),
            actions: []
        };

    }

    /** @ngInject */
    constructor($scope,
                $state: ng.ui.IStateService,
                Restangular,
                _,
                DialogService: DialogService,
                toastr: IToastrService,
                $q) {

        super(fillUpScope($scope), $state, Restangular, _, DialogService, toastr);

        const __this = this;

        function fillUpScope($scope) {
            $scope.collectionUrl = 'therapists/noaccount';
            $scope.elementUrl = '';
            $scope.sort = '+id';
            $scope.filterParams = null;

            $scope.selectedTherapistIds = [];
            return $scope;
        }


        $scope.ifSomeChecked = () => {
            return $scope.selectedTherapistIds && $scope.selectedTherapistIds.length;
        };

        $scope.creteAccounts = function () {
            $scope.waitResponse = true;
            const promises = $scope.selectedTherapistIds.map((therapistId) => {
                return Restangular
                    .one('therapist', therapistId)
                    .all('account')
                    .post();
            });

            $q.all(promises).then(() => {
                $scope.waitResponse = false;
                toastr.info('Therapists created successfully');
                // $state.go('auth.settings.unassignedTherapistList');//
                __this.loadPage();
            }, () => {
                $scope.waitResponse = false;
            });

        };

    }

    canLoadData(): boolean {
        return true;
    }

}
