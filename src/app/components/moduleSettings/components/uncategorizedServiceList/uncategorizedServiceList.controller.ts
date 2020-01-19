import {AbstractListController} from '../../../../controllers/abstractList.controller';
import {Service} from '../../../../model/rest/Service';
import {TableConf} from '../../../../model/TableConf';
import {DialogService} from '../../../../services/dialog/dialog.service';
import {IToastrService} from 'angular-toastr';

export class UncategorizedServiceListController extends AbstractListController {

    getTableConf(categoryList): TableConf {
        return {
            thList: [
                {title: 'ID', sortKey: 'id'},
                {title: 'Name', sortKey: 'name'},
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
                        renderAsConf: {directiveName: 'render-check-service', directiveVal: 'tr.model.id'}
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
                $rootScope) {

        super(fillUpScope($scope), $state, Restangular, _, DialogService, toastr);

        function fillUpScope($scope) {
            $scope.collectionUrl = 'services/uncategorized';
            $scope.elementUrl = '';
            $scope.sort = '+id';
            $scope.filterParams = null;
            return $scope;
        }

        $scope.$on('$destroy', function () {
            $rootScope.selectedServices = []; // $rootScope for using in render-check-service directive.
        });

        $scope.ifServicesChecked = () => {
            return $rootScope.selectedServices && $rootScope.selectedServices.length;
        };

        $scope.creteCategory = function () {

            Restangular
                .all('services/uncategorized')
                .get('count')
                .then((countObj) => countObj.count)
                .then(getAllUncategorizedServices)
                .then(prepareBlankServiceCategory);

            function getAllUncategorizedServices(count) {
                const params = {
                    pageId: 1,
                    pageSize: count, // get all
                    sort: '+id'
                };
                return Restangular
                    .all('services/uncategorized')
                    .getList(params);
            }

            function prepareBlankServiceCategory(response) {
                const allUncategorizedServicesList: Service[] = response.plain();

                $rootScope.blankServiceCategory = {
                    id: null,
                    name: '',
                    services: _.map($rootScope.selectedServices, (serviceId) => {
                        return _.find(allUncategorizedServicesList, (service) => service.id == serviceId);
                    })
                };

                $state.go('auth.settings.categoryNew');
            }

        };

    }

    canLoadData(): boolean {
        return true;
    }

}
