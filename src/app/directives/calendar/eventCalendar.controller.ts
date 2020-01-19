import {BaseCalendarController} from './baseCalendar.controller';
import {timeFormat} from '../../services/app.constant';
import {DialogService, IDialogConcreteCalendarEventConf} from '../../services/dialog/dialog.service';
import {ConcreteCalendarEvent} from '../../model/rest/ConcreteCalendarEvent';
import {CompositeTime} from '../../model/rest/CompositeTime';
import {Event} from '../../model/rest/Event';
import {CalItem} from '../../model/CalItem';
import {CacheStrategy, DataCacheService} from '../../services/storage/data-cache.service';
import {Utils} from '../../services/utils.service';
import {CalendarService} from '../../services/calendar.service';
import {IToastrService}from 'angular-toastr';

declare let angular: any;

export class EventCalendarController extends BaseCalendarController {

    private events: Event[] = [];

    /** @ngInject */
    constructor($scope,
                _,
                moment,
                private Utils: Utils,
                protected CalendarService: CalendarService,
                $document: ng.IDocumentService,
                private DialogService: DialogService,
                private $q: any,
                toastr: IToastrService,
                private DataCacheService: DataCacheService) {
        super($scope, _, moment, CalendarService, $document, toastr);

        DataCacheService.getEvents(CacheStrategy.fast)
            .then(events => this.events = events);
    }


    public parse(models: ConcreteCalendarEvent[]): CalItem[] {
        return models.map((model: ConcreteCalendarEvent): CalItem => {
            const timeStart = this.Utils.strTimeToMinutes(model.time);
            const duration: CompositeTime = model.duration;
            const timeEnd = timeStart + duration.prep + duration.processing + duration.clean;

            return {
                model: model,
                date: model.date,
                timeStart: timeStart,
                timeEnd: timeEnd,
            };
        });
    }

    public assemble(items: CalItem[]): ConcreteCalendarEvent[] {
        return items.map((item: CalItem): ConcreteCalendarEvent => {
            const model: ConcreteCalendarEvent = item.model;
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
        const calendarEvent: ConcreteCalendarEvent = item.model;
        calendarEvent.date = item.date;
        calendarEvent.time = this._minutesToFormat(item.timeStart);

        const dialogConf: IDialogConcreteCalendarEventConf = {
            targetEvent: $event,
            isReadOnly: false,
            canRemove: true
        };
        return this.DialogService.dialogConcreteCalendarEvent(calendarEvent, dialogConf)
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
    }

    viewItem(item: CalItem, $event): void {
        const calendarEvent: ConcreteCalendarEvent = item.model;
        calendarEvent.date = item.date;
        calendarEvent.time = this._minutesToFormat(item.timeStart);

        const dialogConf: IDialogConcreteCalendarEventConf = {
            targetEvent: $event,
            isReadOnly: true,
            canRemove: true
        };
        this.DialogService.dialogConcreteCalendarEvent(calendarEvent, dialogConf);
    }

    public updateItemModel(item: CalItem): void {
        const calendarEvent: ConcreteCalendarEvent = item.model;
        calendarEvent.time = this._minutesToFormat(item.timeStart);
        calendarEvent.date = item.date;
    }

    public modelToString(model: ConcreteCalendarEvent): string[] {
        const event: Event = model.event;
        return [event.name];
    }

    private _minutesToFormat(minutes: number): string {
        return this.moment()
            .startOf('day')
            .add(minutes, 'minute')
            .format(timeFormat);
    }

}
