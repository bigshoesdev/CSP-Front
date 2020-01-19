import {AbstractListController} from '../../../../controllers/abstractList.controller';
import {TableConf} from '../../../../model/TableConf';
import {DialogService} from '../../../../services/dialog/dialog.service';

export class SessionListController extends AbstractListController {
    /** @ngInject */
    constructor($scope,
                $state: ng.ui.IStateService,
                Restangular,
                _,
                DialogService: DialogService,
                toastr) {

        super(fillUpScope($scope), $state, Restangular, _, DialogService, toastr);

        function fillUpScope($scope) {
            $scope.collectionUrl = 'sessions';
            $scope.elementUrl = 'session';
            $scope.sort = '+id';
            $scope.filterParams = null;
            return $scope;
        }

        $scope.listTitle = 'Sessions';
    }

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
            itemClick: (item) => __this.$state.go('auth.sessions.sessionShow', {sessionId: item.id}),
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
        return 'Are you sure to move session " ' + item.name + '" to archive?';
    }

    public deleteItemConfirm(item, $event) {
        const __this = this;

        __this.DialogService
            .dialogConfirm({
                title: 'Move session to archive',
                textContent: __this.getDeleteConfirmQuestion(item),
                targetEvent: $event,
                cancel: 'Cancel',
                ok: 'Archive'
            })
            .then(() => {
                __this.deleteItem(item);
            });
    }

    canLoadData(): boolean {
        return true;
    }

}
