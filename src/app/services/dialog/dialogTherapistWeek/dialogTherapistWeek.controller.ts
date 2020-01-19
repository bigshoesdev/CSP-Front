import {dateFormat, timeFormat} from '../../app.constant';
import {DialogService, IDialogConcreteCalendarEventConf} from '../dialog.service';
import {ConcreteCalendarEvent} from '../../../model/rest/ConcreteCalendarEvent';
import {CompositeTime} from '../../../model/rest/CompositeTime';
import {Utils} from '../../utils.service';
import {IAutocompleteListConf} from '../../../directives/autocompleteList/autocompleteList.directive';
import {ApiSettingsService} from '../../api/api-settings.service';
import {Client} from '../../../model/rest/Client';

export class DialogTherapistWeekController {
    /** @ngInject */
    constructor($mdDialog,
                $scope,
                Utils: Utils,
                moment,
                _,
                $q: any,
                $state,
                DialogService: DialogService,
                ApiSettingsService: ApiSettingsService,
                // Below values injected from locals:
                concreteCalendarEvent: ConcreteCalendarEvent,
                dialogConf: IDialogConcreteCalendarEventConf) {

        $scope.calendarEvent = concreteCalendarEvent;
        $scope.isReadOnly = dialogConf.isReadOnly;
        $scope.canRemove = dialogConf.canRemove;
        $scope.noEmails = true;

        $scope.date = Utils.initDateFromStr(concreteCalendarEvent.date, dateFormat);
        $scope.time = moment(concreteCalendarEvent.time, timeFormat).toDate();

        const duration: CompositeTime = concreteCalendarEvent.duration;
        const lenMin = duration.prep + duration.processing + duration.clean;
        $scope.maxTime = moment('00:00', timeFormat).add(1, 'd').subtract(lenMin, 'minutes'); // restriction
        // todo max and min time

        $scope.dateToString = (date) => Utils.dateToFormat(date, dateFormat);
        $scope.timeToString = (time) => Utils.dateToFormat(time, timeFormat);

        ApiSettingsService.getClients().then(clients => {
            $scope.clients = clients;
        });

        $scope.autocompleteClientsConfig = {
            collectedItems: $scope.calendarEvent.clients,
            getMatchesPromise: (searchText) => {
                if (!searchText || searchText.length < 3) {
                    return $q.reject();
                }
                return ApiSettingsService.findClients(searchText);
            },
            onItemsChanged: () => {
                $scope.calendarEvent.clients = $scope.autocompleteClientsConfig.collectedItems;
            },
            removeConfirmPromise: (excludedItem: Client, $event) => {
                return Promise.resolve({
                    then: (onFulfill, onReject) => {
                        $scope.calendarEvent.clients = $scope.calendarEvent.clients.filter(
                            (client: Client) => client.id !== excludedItem.id
                        );
                        onFulfill();
                    }
                });
            },
            minLength: 3,
            floatingLabel: 'Clients',
            noCache: true,
            delay: 100,
            autoselect: true
        } as IAutocompleteListConf;

        $scope.cancel = () => {
            $mdDialog.cancel();
        };

        $scope.remove = () => {
            $mdDialog.hide();
        };

        $scope.save = () => {
            $mdDialog.hide($scope.calendarEvent);
        };

        $scope.editCalendarEvent = (calendarEventId) => {
            $mdDialog.hide($scope.calendarEvent);
            $state.go('auth.events.calendarEvent.edit', {calendarEventId})
        };
    }

}
