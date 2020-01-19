import {AbstractListController} from '../../../controllers/abstractList.controller';
import {TableConf} from '../../../model/TableConf';
import {DialogService} from '../../../services/dialog/dialog.service';
import {IToastrService} from 'angular-toastr';
import {LoDashStatic} from '@types/lodash';
import {Event} from '../../../model/rest/Event';
import {LocalStorageService} from '../../../services/storage/local-storage.service';

export class TherapistWeekListController extends AbstractListController {
    /** @ngInject */
    constructor($scope,
                $state: ng.ui.IStateService,
                Restangular,
                _: LoDashStatic,
                private LocalStorageService: LocalStorageService,
                DialogService: DialogService,
                toastr: IToastrService) {
        super(fillUpScope($scope), $state, Restangular, _, DialogService, toastr);

        function fillUpScope($scope: any) {
            $scope.collectionUrl = 'week';
            $scope.elementUrl = 'week';
            $scope.sort = '+id';
            $scope.filterParams = null;
            return $scope;
        }

        $scope.listTitle = 'Therapist Week';
        $scope.selected = {};
    }

    getTableConf(weekList): TableConf {
        this.LocalStorageService.setItem('lscache-weeks', weekList);
        const self = this;
        return {
            thList: [
                {title: 'Week', sortKey: 'name'},
                {title: 'Therapist', sortKey: null},
            ],
            trList: weekList.map((week) => {
                return {
                    model: week,
                    tdList: [{
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.name'}
                    }, {
                        renderAsConf: {directiveName: 'render-names', directiveVal: 'tr.model.therapists'}
                    }]
                };
            }),
            itemClick: (item) => self.$state.go('auth.booking.weekShow', {weekId: item.id}),
            actions: [
                {
                    fn: (item, event) => {
                        this.deleteItemConfirm(item, event);
                    },
                    buttonClass: 'md-warn',
                    label: 'Delete',
                    iconName: 'delete_forever',
                }]
        };
    }

    canLoadData(): boolean {
        return true;
    }

}
