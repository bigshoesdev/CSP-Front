import {IRowCalItem} from '../calendarRow.controller';
import {CalendarRowMbBaseController} from './calendarRowMbBase.controller';
import {Entity} from '../../../model/Entity';
import {PreliminaryEvent} from '../../../model/rest/PreliminaryEvent';
import {JbRowType} from '../../../model/JbRowType';
import {Room} from '../../../model/rest/Room';
import {Therapist} from '../../../model/rest/Therapist';
import {DataCacheService} from '../../../services/storage/data-cache.service';
import {DialogService} from '../../../services/dialog/dialog.service';
import {Utils} from '../../../services/utils.service';
import {CalendarService} from '../../../services/calendar.service';

declare let angular: any;
declare let $: any;

export class CalendarRowMbDatesController extends CalendarRowMbBaseController {


    public getColumnKeyOfModel(model: PreliminaryEvent): any {
        return model.date;
    }

    public updateItemModel(item: IRowCalItem): void {
        const CalendarService: CalendarService = this.CalendarService;
        const $scope = this.$scope;
        const model: PreliminaryEvent = item.model;
        const rowType: number = $scope.$parent.rowType;
        const rowMeta: Entity = $scope.$parent.row.rowMeta;

        // update time
        model.time = CalendarService.dayMinutes2time(item.timeStart);

        if (rowType === JbRowType.rooms) {
            // update room
            model.room = <Room>rowMeta;
        } else {
            // update therapist
            model.therapist = <Therapist>rowMeta;
        }

        // update date
        model.date = item.column.columnKey;
    }

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
    }

}
