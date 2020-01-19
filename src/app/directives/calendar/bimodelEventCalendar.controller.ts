import {BaseCalendarController} from './baseCalendar.controller';
import {timeFormat} from '../../services/app.constant';
import {
    DialogService, IDialogConcreteCalendarEventConf, IDialogConcreteEventConf,
    IDialogConcreteEventRes,
} from '../../services/dialog/dialog.service';
import {BaseCrossEvent} from '../../model/rest/BaseCrossEvent';
import {CompositeTime} from '../../model/rest/CompositeTime';
import {ConcreteEvent} from '../../model/rest/ConcreteEvent';
import {ConcreteCalendarEvent} from '../../model/rest/ConcreteCalendarEvent';
import {Event} from '../../model/rest/Event';
import {CalItem} from '../../model/CalItem';
import {ApiBookingService} from '../../services/api/api-booking.service';
import {Utils} from '../../services/utils.service';
import {CalendarService} from '../../services/calendar.service';
import {IToastrService}from 'angular-toastr';
declare let angular: any;

export class BimodelEventCalendarController extends BaseCalendarController {

    /** @ngInject */
    constructor(protected $scope,
                _,
                moment,
                private Utils: Utils,
                protected CalendarService: CalendarService,
                $document: ng.IDocumentService,
                private DialogService: DialogService,
                private $q: any,
                toastr: IToastrService,
                private ApiBookingService: ApiBookingService) {
        super($scope, _, moment, CalendarService, $document, toastr);
    }


    public parse(models: BaseCrossEvent[]): CalItem[] {
        return models.map((model: BaseCrossEvent): CalItem => {
            const timeStart = this.Utils.strTimeToMinutes(model.time);
            const duration: CompositeTime = model.duration;
            const timeEnd = timeStart + duration.prep + duration.processing + duration.clean;
            const isCalendarEvent = !(<ConcreteEvent>model).session;
            return {
                model: model,
                date: model.date,
                timeStart: timeStart,
                timeEnd: timeEnd,
                clazz: isCalendarEvent ? 'concrete-calendar-event' : 'concrete-event'
            } as CalItem;
        });
    }

    public assemble(items: CalItem[]): BaseCrossEvent[] {
        return items.map((item: CalItem) => {
            const model = item.model;
            model.date = item.date;
            model.time = this._minutesToFormat(item.timeStart);
            return model;
        });
    }

    public canAdd(): boolean {
        return false;
    }

    public addItem(item: CalItem, $event): Promise<CalItem> {
        return this.$q.reject();
    }

    public canEdit(): boolean {
        return true;
    }

    public editItem(item: CalItem, $event): Promise<CalItem> {
        const model = item.model;

        if (!(<ConcreteEvent>model).session) {
            model.date = item.date;
            model.time = this._minutesToFormat(item.timeStart);

            const dialogConf: IDialogConcreteCalendarEventConf = {
                targetEvent: $event,
                isReadOnly: true,
                canRemove: true
            };

            return this.DialogService.dialogConcreteCalendarEvent(model, dialogConf)
                .then((calendarEvent: ConcreteCalendarEvent): CalItem => {
                    if (!calendarEvent) {
                        return null; // remove item
                    }
                    item.model = calendarEvent;
                    item.date = calendarEvent.date;
                    item.timeStart = this.Utils.strTimeToMinutes(calendarEvent.time);
                    const duration: CompositeTime = calendarEvent.duration;
                    item.timeEnd = item.timeStart + duration.prep + duration.processing + duration.clean;
                    return item;
                });
        } else {
            model.date = item.date;
            model.time = this._minutesToFormat(item.timeStart);

            const $parent = this.$scope.$parent;

            const concreteEvent: ConcreteEvent = angular.copy(model);
            const dialogConf: IDialogConcreteEventConf = {
                targetEvent: $event,
                canEdit: false,
                canRemove: false,
                canCancel: true,
                events: $parent.events,
                services: $parent.services,
                categories: $parent.categories,
                rooms: $parent.rooms,
                therapists: $parent.therapists,
                clients: $parent.clients,
                sessions: $parent.sessions,
                restrictions: $parent.restrictions,
                subStatuses: $parent.concreteEventSubStatusesNames
            };

            return this.DialogService.dialogConcreteEvent(concreteEvent, dialogConf)
                .then((resp: IDialogConcreteEventRes): CalItem => {

                    const concreteEvent: ConcreteEvent = resp.baseConcreteEvent;
                    if (!concreteEvent) {
                        return null; // remove item
                    }

                    this.ApiBookingService.putEvent(concreteEvent, resp.noEmails).then(() => {
                        this.toastr.info('Concrete event saved successfully');
                    });

                    item.model = concreteEvent;
                    item.date = concreteEvent.date;
                    item.timeStart = this.Utils.strTimeToMinutes(concreteEvent.time);
                    const duration: CompositeTime = concreteEvent.duration;
                    item.timeEnd = item.timeStart + duration.prep + duration.processing + duration.clean;
                    return item;
                });
        }

    }

    public viewItem(item: CalItem, $event): void {
        const model = item.model;

        if (!(<ConcreteEvent>model).session) {
            model.date = item.date;
            model.time = this._minutesToFormat(item.timeStart);

            const dialogConf: IDialogConcreteCalendarEventConf = {
                targetEvent: $event,
                isReadOnly: true,
                canRemove: true
            };

            this.DialogService.dialogConcreteCalendarEvent(model, dialogConf);
        } else {
            model.date = item.date;
            model.time = this._minutesToFormat(item.timeStart);

            const $parent = this.$scope.$parent;

            const concreteEvent: ConcreteEvent = angular.copy(model);
            const dialogConf: IDialogConcreteEventConf = {
                targetEvent: $event,
                canEdit: false,
                canRemove: false,
                canCancel: true,
                events: $parent.events,
                services: $parent.services,
                categories: $parent.categories,
                rooms: $parent.rooms,
                therapists: $parent.therapists,
                clients: $parent.clients,
                sessions: $parent.sessions,
                restrictions: $parent.restrictions,
                subStatuses: $parent.concreteEventSubStatusesNames
            };

            this.DialogService.dialogConcreteEvent(concreteEvent, dialogConf);
        }


    }

    public updateItemModel(item: CalItem): void {
        const concreteEvent = item.model;
        concreteEvent.time = this._minutesToFormat(item.timeStart);
        concreteEvent.date = item.date;
    }

    public modelToString(model: ConcreteEvent): string[] {
        const event: Event = model.event;
        return [event
            ? event.name
            : 'event not found'];
    }

    private _minutesToFormat(minutes: number): string {
        return this.moment()
            .startOf('day')
            .add(minutes, 'minute')
            .format(timeFormat);
    }

}
