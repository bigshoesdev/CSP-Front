import {AbstractListController} from '../../../../controllers/abstractList.controller';
import {TableConf} from '../../../../model/TableConf';
import {DialogService} from '../../../../services/dialog/dialog.service';

export class CalendarEventListController extends AbstractListController {
    /** @ngInject */
    constructor(collectionUrl,
                $scope,
                $state: ng.ui.IStateService,
                Restangular,
                _,
                DialogService: DialogService,
                toastr) {

        super(fillUpScope($scope), $state, Restangular, _, DialogService, toastr);

        function fillUpScope($scope) {
            $scope.collectionUrl = collectionUrl;
            $scope.elementUrl = 'calendarEvents';
            $scope.sort = '+id';
            $scope.filterParams = null;
            return $scope;
        }

    }

    getTableConf(calendarEventList): TableConf {
        const __this = this;
        return {
            thList: [
                {title: 'Name', sortKey: 'name'},
                {title: 'Therapist', sortKey: 'therapist'},
                {title: 'Capacity', sortKey: 'capacity'},
                {title: 'Start date', sortKey: 'dateStart'},
                {title: 'End date', sortKey: 'dateEnd'}


            ],
            trList: calendarEventList.map((calendarEvent) => {
                return {
                    model: calendarEvent,
                    tdList: [
                        {
                            renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.name'}
                        },
                        {
                            renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.therapist.name'}
                        },
                        {
                            renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.capacity'}
                        },
                        {
                            renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.dateStart'}
                        },
                        {
                            renderAsConf: {directiveName: 'render-body', directiveVal: 'tr.model.dateEnd'}
                        }
                    ]
                };
            }),
            itemClick: (item) => __this.$state.go('auth.events.calendarEvent.show', {calendarEventId: item.id}),
            actions: [
                {
                    fn: (item, event) => {
                        __this.deleteItemConfirm(item, event);
                    },
                    buttonClass: 'md-warn',
                    label: 'Delete',
                    iconName: 'delete_forever'
                }]
        };

    }

    getDeleteConfirmQuestion(item): string {
        return 'Are you sure to delete calendar event "' + item.name + '"?';
    }

    canLoadData(): boolean {
        return true;
    }

}
