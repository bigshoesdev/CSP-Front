import {AbstractListController} from '../../../../controllers/abstractList.controller';
import {TableConf} from '../../../../model/TableConf';
import {DialogService} from '../../../../services/dialog/dialog.service';
import {IToastrService} from 'angular-toastr';

export class CategoryListController extends AbstractListController {
    /** @ngInject */
    constructor($scope,
                $state: ng.ui.IStateService,
                Restangular,
                _,
                DialogService: DialogService,
                toastr: IToastrService) {

        super(fillUpScope($scope), $state, Restangular, _, DialogService, toastr);

        function fillUpScope($scope) {
            $scope.tableTitle = 'Categories';
            $scope.collectionUrl = 'serviceCategories';
            $scope.elementUrl = 'serviceCategory';
            $scope.sort = '+id';
            $scope.filterParams = null;
            return $scope;
        }
    }

    getTableConf(categoryList): TableConf {
        return {
            thList: [
                {title: 'Category', sortKey: 'name'},
                {title: 'Services', sortKey: null},
            ],
            trList: categoryList.map((category) => {
                return {
                    model: category,
                    tdList: [{
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.name'},
                    }, {
                        renderAsConf: {directiveName: 'render-names', directiveVal: 'tr.model.services'},
                    }],
                };
            }),
            itemClick: (item) => this.$state.go('auth.settings.categoryShow', {categoryId: item.id}),
            actions: [
                {
                    fn: (item, event) => {
                        console.log('ITEM', item);
                        this.deleteItemConfirm(item, event);
                    },
                    buttonClass: 'md-warn',
                    label: 'Delete',
                    iconName: 'delete_forever',
                }],
        };

    }

    canLoadData(): boolean {
        return true;
    }

}
