import {CalendarRowController, IRowCalColumn, IRowCalItem} from '../calendarRow.controller';
import {Room} from '../../../model/rest/Room';
import {CompositeTime} from '../../../model/rest/CompositeTime';
import {PreliminaryEvent} from '../../../model/rest/PreliminaryEvent';
import {Therapist} from '../../../model/rest/Therapist';
import {JbRowType} from '../../../model/JbRowType';
import {CacheStrategy, DataCacheService} from '../../../services/storage/data-cache.service';
import {Service} from '../../../model/rest/Service';
import {Event} from '../../../model/rest/Event';
import {BaseCrossEvent} from '../../../model/rest/BaseCrossEvent';
import {DialogService} from '../../../services/dialog/dialog.service';
import {Utils} from '../../../services/utils.service';
import {CalendarService} from '../../../services/calendar.service';
import {Client} from '../../../model/rest/Client';
import {Collection} from '../../../model/Collection';
import {ConcreteEvent} from '../../../model/rest/ConcreteEvent';

declare const angular: angular.IAngularStatic;
declare const $: JQuery;

export class CalendarRowConcreteEventsController extends CalendarRowController<BaseCrossEvent> {

    private services: Service[] = [];
    private id2client: Collection<Client> = {};

    /** @ngInject */
    constructor(protected $scope,
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
            .then(clients => this.id2client = this._.keyBy(clients, 'id'));
    }

    public getColumnKeyOfModel(model: BaseCrossEvent): any {
        const rowType: number = this.$scope.$parent.rowType;
        return (rowType === JbRowType.rooms)
            ? (model.therapist && model.therapist.id)
            : (model.room && model.room.id);

    }

    public parse(models: BaseCrossEvent[]): IRowCalItem[] {
        const CalendarService: CalendarService = this.CalendarService;
        const $scope = this.$scope;
        const _ = this._;
        const columns: IRowCalColumn[] = $scope.columns;
        let nextTimeless: number = 0; // let nextTimeless = this.workingDayStartMin;
        return models.map((model: BaseCrossEvent): IRowCalItem => {

            const duration: CompositeTime = model.duration;
            const durationMin = duration.prep + duration.processing + duration.clean;

            let timeStart: number;
            if (model.time) {
                timeStart = CalendarService.time2dayMinutes(model.time);
            } else {
                timeStart = nextTimeless;
                nextTimeless += 1; // nextTimeless += durationMin;
                if (nextTimeless >= this.workingDayEndMin) {
                    nextTimeless = this.workingDayStartMin;
                }
            }

            const timeEnd = timeStart + durationMin;
            const columnKey = this.getColumnKeyOfModel(model);
            const column = _.find(columns, (c: IRowCalColumn) => c.columnKey === columnKey);
            return {
                model: model,
                column: column,
                timeStart: timeStart,
                timeEnd: timeEnd
            };
        });
    }

    public assemble(items: IRowCalItem[]): BaseCrossEvent[] {
        return items.reduce((models: BaseCrossEvent[], item: IRowCalItem) => {
            const model: BaseCrossEvent = item.model;
            models.push(model);
            return models;
        }, []);
    }

    public updateItemModel(item: IRowCalItem): void {
        const CalendarService: CalendarService = this.CalendarService;
        const $scope = this.$scope;
        const model: PreliminaryEvent = item.model;
        const rowType: number = $scope.$parent.rowType;

        // update time
        model.time = CalendarService.dayMinutes2time(item.timeStart);

        if (rowType === JbRowType.rooms) {
            model.therapist = <Therapist>item.column.columnMeta;
        } else {
            model.room = <Room>item.column.columnMeta;
        }
    }

    public modelToString(model: ConcreteEvent): string[] {
        let title: string;
        if (model.service) {
            title = `${model.service.name}`;
        } else if (model.event) {
            title = `event: ${model.event.name}`;
        } else {
            title = 'error: neither service or event';
        }

        const d: CompositeTime = model.duration;
        const duration = (d.clean + d.processing + d.prep);

        const clients: string = model.clientsIds
            .map(clientId => this.id2client[clientId])
            .filter(client => !!client)
            .map((client: Client) => client.name)
            .join(', ');

        return [`${model.time} - ${duration} min`, clients, model.room.name, title];
    }

    bgModelToString(bgModel: any): string[] {
        return []; // todo
    }
}

