import {CalendarRowController, IRowCalColumn, IRowCalItem} from '../calendarRow.controller';
import {PreliminaryEvent} from '../../../model/rest/PreliminaryEvent';
import {CompositeTime} from '../../../model/rest/CompositeTime';
import {CacheStrategy, DataCacheService} from '../../../services/storage/data-cache.service';
import {Service} from '../../../model/rest/Service';
import {DialogService} from '../../../services/dialog/dialog.service';
import {Utils} from '../../../services/utils.service';
import {CalendarService} from '../../../services/calendar.service';
import {ConcreteEvent} from '../../../model/rest/ConcreteEvent';
import {ConcreteCalendarEvent} from '../../../model/rest/ConcreteCalendarEvent';
import {AvailabilityTimeRecord} from '../../../model/rest/AvailabilityTimeRecord';
import {Client} from '../../../model/rest/Client';
import {Entity} from '../../../model/Entity';
import {AvailabilityType_Ns} from '../../../model/rest/AvailabilityType';
import AvailabilityType = AvailabilityType_Ns.AvailabilityType;

declare let angular: any;
declare let $: any;

export abstract class CalendarRowMbBaseController extends CalendarRowController<PreliminaryEvent> {

    private services: Service[] = [];
    private clients: Client[] = [];

    constructor(protected $scope: any,
                protected _,
                protected moment,
                protected Utils: Utils,
                protected $document: ng.IDocumentService,
                protected $q: any,
                protected DialogService: DialogService,
                protected SourceDropmodelStorage,
                protected CalendarService: CalendarService,
                protected DataCacheService: DataCacheService,
                protected $interval: ng.IIntervalService) {
        super(
            $scope,
            _,
            moment,
            Utils,
            $document,
            $q,
            DialogService,
            SourceDropmodelStorage,
            CalendarService,
            DataCacheService,
            $interval
        );

        DataCacheService.getServices(CacheStrategy.fast)
            .then(services => this.services = services);

        DataCacheService.getClients(CacheStrategy.fast)
            .then(clients => this.clients = clients);
    }
    public abstract getColumnKeyOfModel(model: PreliminaryEvent): any;

    public parse(models: PreliminaryEvent[]): IRowCalItem[] {
        const CalendarService: CalendarService = this.CalendarService;
        const $scope = this.$scope;
        const _ = this._;
        const columns: IRowCalColumn[] = $scope.columns;
        const items: IRowCalItem[] = [];
        let nextTimeless: number = 0; // let nextTimeless = this.workingDayStartMin;
        models.forEach((model: PreliminaryEvent) => {
            let timeStart: number;
            const modelDuration = model.duration;
            const duration = (modelDuration.clean + modelDuration.processing + modelDuration.prep);

            if (model.time) {
                timeStart = CalendarService.time2dayMinutes(model.time);
            } else {
                timeStart = nextTimeless;
                nextTimeless += 1; // nextTimeless += duration;
                if (nextTimeless >= this.workingDayEndMin) {
                    nextTimeless = this.workingDayStartMin;
                }
            }

            const timeEnd = timeStart + duration;
            const columnKey = this.getColumnKeyOfModel(model);
            const column = _.find(columns, (c: IRowCalColumn) => c.columnKey === columnKey);
            items.push({
                model: model,
                column: column,
                timeStart: timeStart,
                timeEnd: timeEnd
            });
        });
        return items;
    }

    public assemble(items: IRowCalItem[]): PreliminaryEvent[] {
        return items.reduce((models: PreliminaryEvent[], item: IRowCalItem) => {
            const model: PreliminaryEvent = item.model;
            models.push(model);
            return models;
        }, []);
    }


    public abstract updateItemModel(item: IRowCalItem): void;

    public modelToString(model: PreliminaryEvent): string[] {
        const d: CompositeTime = model.duration;
        const duration: number = d.prep + d.processing + d.clean;

        const service: Service = model.service;
        const client: Client = model.client;

        return [client.name, service.name, `${model.time} - ${duration} min`];
    }

    bgModelToString(bgModel: ConcreteEvent | ConcreteCalendarEvent | PreliminaryEvent | AvailabilityTimeRecord): string[] {
        if ((bgModel as AvailabilityTimeRecord).timeStart) {
            // availability
            const model: AvailabilityTimeRecord = bgModel as AvailabilityTimeRecord;
            if (model.type === AvailabilityType.unavailable) {
                return ['Unavailable'];
            } else if (model.type === AvailabilityType.available) {
                return ['Available'];
            } else {
                return ['Undefined'];
            }
        } else if ((bgModel as ConcreteCalendarEvent).calendarEvent) {
            // calendar (should booked too)
            const model: ConcreteCalendarEvent = bgModel as ConcreteCalendarEvent;
            const clients = model.clients.map((c: Client) => c.name).join(', ');
            return [`Booked Calendar: ${model.name}`, `Calendar Event: ${model.event.name}`, clients];
        } else if (bgModel.id) {
            // concrete booked events
            const model: ConcreteEvent = bgModel as ConcreteEvent;

            if (model.service) {
                return [`Booked Service: ${model.client.name}`, `Service: ${model.service.name}`];
            } else {
                return [`Booked Event: ${model.client.name}`, `Event: ${model.event.name}`];
            }
        } else {
            // confirmation
            const model: PreliminaryEvent = bgModel as PreliminaryEvent;

            return [`Confirmation: ${model.client.name}`, `Service: ${model.service.name}`];
        }
    }

}
