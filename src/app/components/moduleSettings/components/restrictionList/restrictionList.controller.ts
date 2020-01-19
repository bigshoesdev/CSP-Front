import {AbstractListController} from '../../../../controllers/abstractList.controller';
import {TableConf} from '../../../../model/TableConf';
import {DialogService} from '../../../../services/dialog/dialog.service';

export class RestrictionListController extends AbstractListController {
    /** @ngInject */
    constructor($scope,
                $state: ng.ui.IStateService,
                Restangular,
                _,
                DialogService: DialogService,
                toastr) {

        super(fillUpScope($scope), $state, Restangular, _, DialogService, toastr);

        function fillUpScope($scope) {
            $scope.collectionUrl = 'restrictions';
            $scope.elementUrl = 'restriction';
            $scope.sort = '+id';
            $scope.filterParams = null;
            return $scope;
        }
    }

    getTableConf(restrictionList): TableConf {
        const __this = this;
        return {
            thList: [
                {title: 'Name', sortKey: 'name'},
                {title: 'Type', sortKey: 'type'},
                {title: 'Linked Id', sortKey: 'linkedId'},
                {title: 'Rooms', sortKey: null},
                {title: 'Equipment', sortKey: null}
            ],
            trList: restrictionList.map((category) => {
                return {
                    model: category,
                    tdList: [{
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.name'}
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.type'}
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.linkedId'}
                    }, {
                        renderAsConf: {directiveName: 'render-names', directiveVal: 'tr.model.rooms'}
                    }, {
                        renderAsConf: {directiveName: 'render-names', directiveVal: 'tr.model.equipments'}
                    }]
                };
            }),
            itemClick: (item) => __this.$state.go('auth.settings.restrictionShow', {restrictionId: item.id}),
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
        return 'Are you sure to delete Restriction "' + item.name + '"?';
    }

    canLoadData(): boolean {
        return true;
    }

}
