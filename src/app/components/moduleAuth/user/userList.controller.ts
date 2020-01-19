import {AbstractListController} from '../../../controllers/abstractList.controller';
import {TableConf} from '../../../model/TableConf';
import {DialogService} from '../../../services/dialog/dialog.service';

export class UserListController extends AbstractListController {

    /** @ngInject */
    constructor($scope,
                $state: ng.ui.IStateService,
                Restangular,
                _,
                DialogService: DialogService,
                toastr) {

        super(fillUpScope($scope), $state, Restangular, _, DialogService, toastr);

        function fillUpScope($scope) {
            $scope.collectionUrl = 'users';
            $scope.elementUrl = 'user';
            $scope.sort = '+name';
            $scope.filterParams = null;
            return $scope;
        }

    }

    getTableConf(userList): TableConf {
        const __this = this;
        return {
            thList: [
                {title: 'Username', sortKey: 'name'},
                {title: 'Email', sortKey: 'email'},
                {title: 'State', sortKey: 'locked'}
            ],
            trList: userList.map((user) => {
                return {
                    model: user,
                    tdList: [{
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.name'}
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.email'}
                    }, {
                        renderAsConf: {directiveName: 'render-status', directiveVal: 'tr.model.locked'}
                    }]
                };
            }),
            itemClick: (item) => __this.$state.go('auth.auth.userShow', {userId: item.id}),
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
        return 'Are you sure to delete User "' + item.name + '" (' + item.email + ')?';
    }

    canLoadData(): boolean {
        return true;
    }
}
