import {timeFormat, weekDaysShort} from '../../../../services/app.constant';
import {Room} from '../../../../model/rest/Room';
import {Equipment} from '../../../../model/rest/Equipment';
import {Id} from '../../../../model/rest/Id';
import {Event} from '../../../../model/rest/Event';
import {CalendarEvent} from '../../../../model/rest/CalendarEvent';
import {Therapist} from '../../../../model/rest/Therapist';
import {ApiCalendarEventsService} from '../../../../services/api/api-calendar-events.service';
import {DialogService, IDialogCrossingDataConf} from '../../../../services/dialog/dialog.service';
import {Utils} from '../../../../services/utils.service';
import {EventRecord} from '../../../../model/rest/EventRecord';
import {CrossingData} from '../../../../model/rest/CrossingData';
import {IToastrService} from 'angular-toastr';
import {AbstractController} from '../../../../controllers/abstract.controller';

declare let angular: any;

export class CalendarEventController extends AbstractController {
    /** @ngInject */
    constructor(private calendarEvent: CalendarEvent,
                private isEdit: boolean,
                private events: Event[],
                private rooms: Room[],
                private therapists: Therapist[],
                private equipments: Equipment[],
                private $scope, private $state: ng.ui.IStateService, private $q: any, private _, private Restangular,
                private ApiCalendarEventsService: ApiCalendarEventsService, private toastr: IToastrService, private DialogService: DialogService,
                private UnsavedChanges, private Utils: Utils, private StateStack) {

        super(initForm(), $state, Restangular, _, DialogService, toastr, UnsavedChanges, StateStack);

        function initForm() {

            $scope.modelParams = {
                elementTitle: 'Calendar Event',
                elementUrl: 'calendarEvents',
                elementList: 'auth.events.calendarEvent.list',
            };

            $scope.isEdit = isEdit;
            $scope.model = calendarEvent;
            $scope.events = events;
            $scope.rooms = rooms;
            $scope.equipments = equipments;

            $scope.dateToday = new Date('10.10.2000');
            $scope.time = Utils.initDateFromStr(calendarEvent.time, timeFormat);

            $scope.weekDaysShort = angular.copy(weekDaysShort);

            if (!calendarEvent.dateStart) {
                $scope.model.dateStart = new Date();
                $scope.model.dateEnd = new Date();
            } else {
                $scope.model.dateStart = Utils.initDateFromStr(calendarEvent.dateStart);
                $scope.model.dateEnd = Utils.initDateFromStr(calendarEvent.dateEnd);
            }

            if (isEdit) {
                UnsavedChanges.register($scope, calendarEvent);
            }

            $scope.updateTherapists = (event: Event) => {
                const filteredTherapists = (event) ? CalendarEventController.filterTherapists(event, therapists) : [];
                $scope.therapistTitle = (_.isEmpty(filteredTherapists)) ?
                    'No therapists available' : 'Select therapist';

                $scope.therapists = filteredTherapists;
            };

            $scope.updateTherapists(calendarEvent.event);

            return $scope;
        }

        $scope.convertDate2Model = (date) => Utils.dateToFormat(date);

        $scope.convertTime2Model = (date) => Utils.dateToFormat(date, timeFormat);

        $scope.displayItem = (item) => item && item.name;

        $scope.onNameChange = () => {
            $scope.ctrl.form.fName.$setValidity('notUniqueName', true);
        };

        $scope.applyTherapist = (therapist: Therapist) => {
            if (therapist) {
                $scope.rooms = Utils.sortRoomsForTherapist($scope.rooms, therapist);
            }
        };

        $scope.equalsDates = () => $scope.dateToday.getDate() === $scope.model.dateEnd.getDate();

        $scope.minDate = (d1: Date, d2: Date) => {
            if (!(d1 && d2)) {
                return d1;
            }
            return (d1.getTime() < d2.getTime()) ? d1 : d2;
        };

        $scope.save = () => {
            toastr.clear();
            $scope.waitResponse = true;
            const calendarEvent: CalendarEvent = this.prepareDateEvent(angular.copy(this.$scope.model));
            let promis;
            if ($scope.isEdit) {
                promis = this.saveCalendarEvent(calendarEvent)
                    .then(() => {
                        toastr.info('Calendar Event updated successfully');
                        $scope.waitResponse = false;
                        UnsavedChanges.register($scope, $scope.model);
                        $state.go('auth.events.calendarEvent.list');
                    }, (crossingDataArr: CrossingData[]) => {
                        this.handleCrossing(crossingDataArr, null);
                    });

            } else {
                promis = this.createCalendarEvent(calendarEvent)
                    .then((response: Id) => {
                        this.saveId(response);

                        toastr.info('Calendar Event created successfully');
                        $state.go('auth.events.calendarEvent.list');

                    }, (err) => {
                        $scope.waitResponse = false;
                        this.$q.reject(err);
                    });
            }

            promis.then(null, () => {
                $scope.waitResponse = false;
            });
        };

        $scope.isUnsaved = () => {
            return UnsavedChanges.isChanged();
        };

        $scope.viewConcrete = () => {
            const dateStart = Utils.dateToFormat($scope.dateStart);
            const dateEnd = Utils.dateToFormat($scope.dateEnd);

            $state.go('auth.events.calendarEvent.concrete', {
                calendarEventId: calendarEvent.id,
                dateStart: dateStart,
                dateEnd: dateEnd,
            });
        };
    }

    private handleCrossing(crossingDataArr, $event) {
        const $scope = this.$scope;
        const dialogConf: IDialogCrossingDataConf = {
            targetEvent: $event,
        };
        this.DialogService.dialogCrossingData(crossingDataArr.data, dialogConf).then(null, () => {
            // close button, rejected in any way
            $scope.waitResponse = false;
            this.$q.reject(crossingDataArr);
        });
    }

    private static filterTherapists(event: Event, therapists: Therapist[]): Therapist[] {
        const eventId = event && event.id;
        return eventId ?
            therapists.filter((t: Therapist) => t.events.some((eventRecord: EventRecord) => eventRecord.event.id === eventId)) :
            therapists;
    }

    private prepareDateEvent(calendarEvent: CalendarEvent) {
        calendarEvent.dateStart = this.$scope.convertDate2Model(calendarEvent.dateStart);
        calendarEvent.dateEnd = this.$scope.convertDate2Model(calendarEvent.dateEnd);
        return calendarEvent;
    }

    private saveCalendarEvent(calendarEvent: CalendarEvent) {
        return this.ApiCalendarEventsService.putCalendarEvent(calendarEvent.id, calendarEvent);
    }

    private createCalendarEvent(calendarEvent: CalendarEvent) {
        return this.ApiCalendarEventsService.postCalendarEvent(calendarEvent);
    }

    private saveId(response: Id) {
        const calendarEvent: CalendarEvent = this.$scope.model;
        if (!calendarEvent.id && response) {// save right after creation
            calendarEvent.id = response.id;
        }
    }
}

