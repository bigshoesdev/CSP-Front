import {AbstractListController} from '../../../../controllers/abstractList.controller';
import {TableConf} from '../../../../model/TableConf';
import {DialogService} from '../../../../services/dialog/dialog.service';
import {IToastrService} from 'angular-toastr';
import {LoDashStatic} from '@types/lodash';
import {Therapist} from '../../../../model/rest/Therapist';

export class TherapistListController extends AbstractListController {
    /** @ngInject */
    constructor($scope,
                $state: ng.ui.IStateService,
                Restangular,
                _: LoDashStatic,
                DialogService: DialogService,
                toastr: IToastrService) {

        super(fillUpScope($scope), $state, Restangular, _, DialogService, toastr);

        function fillUpScope($scope) {
            $scope.collectionUrl = 'therapists';
            $scope.elementUrl = 'therapist';
            $scope.sort = '+id';
            $scope.filterParams = null;
            return $scope;
        }

        $scope.listTitle = 'Therapists';
    }

    getTableConf(therapistsList): TableConf {
        const self = this;
        return {
            thList: [
                {title: 'ID', sortKey: 'id', width: 10},
                {title: 'Name', sortKey: 'name'},
                {title: 'Email', sortKey: 'email'}
            ],
            trList: therapistsList.map((model) => {
                return {
                    model,
                    tdList: [{
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.id'}
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.name'}
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.email'}
                    }]
                };
            }),
            itemClick: (item) => self.$state.go('auth.settings.therapistShow', {therapistId: item.id}),
            actions: [
                {
                    fn: (item: Therapist, event: Event) => {
                        self.deleteItemConfirm(item, event);
                    },
                    buttonClass: 'md-warn',
                    label: 'Delete',
                    iconName: 'delete_forever'
                }]
        };
    }

    canLoadData(): boolean {
        return true;
    }
}

