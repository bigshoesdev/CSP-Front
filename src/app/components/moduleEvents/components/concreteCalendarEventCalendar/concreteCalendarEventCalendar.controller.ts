import {dateFormat} from '../../../../services/app.constant';
import {ConcreteCalendarEvent} from '../../../../model/rest/ConcreteCalendarEvent';
import {CalendarConf} from '../../../../model/CalendarConf';
import {CalendarMode_Ns} from '../../../../model/CalendarMode';
import CalendarModeEnum = CalendarMode_Ns.CalendarMode;
import {ApiCalendarEventsService} from '../../../../services/api/api-calendar-events.service';
import {Utils} from '../../../../services/utils.service';
import {IToastrService} from 'angular-toastr';
import {CalendarEvent} from "../../../../model/rest/CalendarEvent";

declare let angular: any;

export class ConcreteCalendarEventCalendarController {
    /** @ngInject */
    constructor(calendarEvent: CalendarEvent,
                dateStart: string,
                dateEnd: string,
                concreteCalendarEvents: ConcreteCalendarEvent[],
                isReadOnly: boolean,
                $scope, $state: ng.ui.IStateService, StateStack, toastr: IToastrService, Restangular, ApiCalendarEventsService: ApiCalendarEventsService, Utils: Utils, $q: any, _) {

        const initialConcreteCalendarEvents: ConcreteCalendarEvent[] = angular.copy(concreteCalendarEvents);

        initForm();

        function initForm() {
            $scope.isReadOnly = isReadOnly;

            $scope.startDate = Utils.initDateFromStr(dateStart, dateFormat);
            $scope.endDate = Utils.initDateFromStr(dateEnd, dateFormat);

            const calendarConf: CalendarConf = {
                model: angular.copy(concreteCalendarEvents),
                startDate: dateStart,
                endDate: dateEnd,
                defaultGridMode: CalendarModeEnum.dates,
                isReadOnly: isReadOnly,
            };
            $scope.calendarConf = calendarConf;

            $scope.title = 'View concrete calendar events';
        }


        $scope.save = ($event) => {
            toastr.clear();
            $scope.waitResponse = true;
            update();

        };

        $scope.cancel = function () {
            if (StateStack.canGoBack()) {
                StateStack.goBack();
            } else {
                $state.go('auth.events.calendarEvent.edit');
            }
        };

        function update() {

            $scope.calendarCtrl.applyModel();
            const resultEvents: ConcreteCalendarEvent[] = $scope.calendarConf.model;

            toastr.clear();
            $scope.waitResponse = true;

            // detect changes
            const promises = initialConcreteCalendarEvents.reduce((promises, initialEvent: ConcreteCalendarEvent) => {
                const initialEventId = initialEvent.id;
                const foundInResult = _.find(resultEvents, (resultEvent: ConcreteCalendarEvent) => resultEvent.id === initialEventId);
                if (!foundInResult) {
                    promises.push(
                        deleteConcreteCalendarEvent(initialEventId),
                    );
                } else if (_idEventChanged(foundInResult, initialEvent)) {
                    promises.push(
                        updateConcreteCalendarEvent(foundInResult),
                    );
                }
                return promises;
            }, []);

            return $q.all(promises).then((resolve) => {
                if (promises.length > 0) {
                    toastr.info('Concrete Calendar Events updated successfully');
                }
                $scope.waitResponse = false;
            }, (err) => {
                toastr.error('Error during update Concrete Calendar Events');
                $scope.waitResponse = false;
            });
        }

        function _idEventChanged(a: ConcreteCalendarEvent, b: ConcreteCalendarEvent): boolean {
            return !(a.date === b.date && a.time === b.time);
        }

        function deleteConcreteCalendarEvent(concreteCalendarEventId: number) {
            return ApiCalendarEventsService.removeConcreteCalendarEvent(calendarEvent.id, concreteCalendarEventId);
        }

        function updateConcreteCalendarEvent(concreteCalendarEvent: ConcreteCalendarEvent) {
            return ApiCalendarEventsService.putConcreteCalendarEvent(calendarEvent.id, concreteCalendarEvent.id, concreteCalendarEvent);
        }

    }

}
