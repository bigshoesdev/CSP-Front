import {AbstractListController} from '../../../../controllers/abstractList.controller';
import {TableConf} from '../../../../model/TableConf';
import {DialogService} from '../../../../services/dialog/dialog.service';

export class ArchiveSessionListController extends AbstractListController {

    getTableConf(SessionList): TableConf {
        const __this = this;
        return {
            thList: [
                {title: 'Name', sortKey: 'name'},
                {title: 'Start Date', sortKey: 'startDate'},
                {title: 'End Date', sortKey: 'endDate'},
                {title: 'Clients', sortKey: null},
                {title: 'Therapists', sortKey: null}
            ],
            trList: SessionList.map((session) => {
                return {
                    model: session,
                    tdList: [{
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.name'}
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.startDate'}
                    }, {
                        renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.endDate'}
                    }, {
                        renderAsConf: {directiveName: 'render-names', directiveVal: 'tr.model.clients'}
                    }, {
                        renderAsConf: {directiveName: 'render-names', directiveVal: 'tr.model.therapists'}
                    }]
                };
            }),
            actions: [{// view button
                fn: (item, event) => {
                    __this.$state.go('auth.sessions.sessionView', {sessionId: item.id});
                },
                buttonClass: 'md-primary',
                label: 'View',
                iconName: 'search'
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
            $scope.collectionUrl = 'sessions/archive';
            $scope.elementUrl = 'session';
            $scope.sort = '+id';
            $scope.filterParams = null;
            return $scope;
        }

        $scope.listTitle = 'Sessions in archive';
    }

    canLoadData(): boolean {
        return true;
    }

}
