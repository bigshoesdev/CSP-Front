import {AbstractListController} from '../../../../controllers/abstractList.controller';
import {TableConf} from '../../../../model/TableConf';
import {DialogService} from '../../../../services/dialog/dialog.service';
import * as restangular from 'restangular';
import {IToastrService} from 'angular-toastr';
import {LoDashStatic} from '@types/lodash';

export class RoomListController extends AbstractListController {
    /** @ngInject */
    constructor($scope,
                $state: ng.ui.IStateService,
                Restangular: restangular.IService,
                _: LoDashStatic,
                DialogService: DialogService,
                toastr: IToastrService) {

        super(fillUpScope($scope), $state, Restangular, _, DialogService, toastr);

        function fillUpScope($scope) {
            $scope.collectionUrl = 'rooms';
            $scope.elementUrl = 'room';
            $scope.sort = '+id';
            $scope.filterParams = null;
            return $scope;
        }
    }

    getTableConf(roomList): TableConf {
        const __this = this;
        return {
            thList: [
                {title: 'ID', sortKey: 'id', width: 10},
                {title: 'Name', sortKey: 'name'},
                {title: 'capacity', sortKey: 'capacity', width: 10}
            ],
            trList: roomList.map((room) => {
                return {
                    model: room,
                    tdList: [{
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.id'}
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.name'}
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.capacity'}
                    }]
                };
            }),
            itemClick: (item) => __this.$state.go('auth.settings.roomShow', {roomId: item.id}),
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
        return 'Are you sure to delete Room "' + item.name + '"?';
    }

    canLoadData(): boolean {
        return true;
    }
}
