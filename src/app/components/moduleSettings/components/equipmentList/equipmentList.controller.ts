import {AbstractListController} from '../../../../controllers/abstractList.controller';
import {TableConf} from '../../../../model/TableConf';
import {DialogService} from '../../../../services/dialog/dialog.service';

export class EquipmentListController extends AbstractListController {

    /** @ngInject */
    constructor($scope,
                $state: ng.ui.IStateService,
                Restangular,
                _,
                DialogService: DialogService,
                toastr) {

        super(fillUpScope($scope), $state, Restangular, _, DialogService, toastr);

        function fillUpScope($scope) {
            $scope.collectionUrl = 'equipments';
            $scope.elementUrl = 'equipment';
            $scope.sort = '+id';
            $scope.filterParams = null;
            return $scope;
        }
    }

    getTableConf(equipmentList): TableConf {
        const __this = this;
        return {
            thList: [
                {title: 'ID', sortKey: 'id', width: 10},
                {title: 'Name', sortKey: 'name'},
                {title: 'capacity', sortKey: 'capacity', width: 10}
            ],
            trList: equipmentList.map((equipment) => {
                return {
                    model: equipment,
                    tdList: [{
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.id'}
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.name'}
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.capacity'}
                    }]
                };
            }),
            itemClick: (item) => __this.$state.go('auth.settings.equipmentShow', {equipmentId: item.id}),
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
        return 'Are you sure to delete Equipment "' + item.name + '"?';
    }

    canLoadData(): boolean {
        return true;
    }

}
