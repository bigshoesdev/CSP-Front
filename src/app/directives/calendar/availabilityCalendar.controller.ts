import {BaseCalendarController} from './baseCalendar.controller';
import {AvailabilityTherapistDayRecord} from '../../model/rest/AvailabilityTherapistDayRecord';
import {AvailabilityTimeRecord} from '../../model/rest/AvailabilityTimeRecord';
import {AvailabilityType_Ns} from '../../model/rest/AvailabilityType';
import {CalItem} from '../../model/CalItem';
import AvailabilityType = AvailabilityType_Ns.AvailabilityType;
import {DialogService} from '../../services/dialog/dialog.service';
import {CalendarService} from '../../services/calendar.service';
import {IToastrService}from 'angular-toastr';

declare let angular: any;

export class AvailabilityCalendarController extends BaseCalendarController {

    /** @ngInject */
    constructor($scope,
                _,
                moment,
                CalendarService: CalendarService,
                $document: ng.IDocumentService,
                private DialogService: DialogService,
                toastr: IToastrService,
                private DefaultAvailabilityService,
                private $q) {
        super($scope, _, moment, CalendarService, $document, toastr);
        $scope.onDrop = ($dropmodel, $dragmodel) => {
            const item: CalItem = _.find($scope.items, (item) => item.model === $dragmodel);
            this._updateItemFromRect(item);
            this.updateItemModel(item);
            this.resolveCollisions(item);
            this._updateItemsRect($scope.items);
        };
    }


    public parse(models: AvailabilityTherapistDayRecord[]): CalItem[] {
        const items: CalItem[] = [];
        models.forEach((model: AvailabilityTherapistDayRecord) => {
            const date = model.date;
            model.timeItems.forEach((timeItem: AvailabilityTimeRecord) => {
                items.push({
                    model: timeItem,
                    date: date,
                    timeStart: timeItem.timeStart,
                    timeEnd: timeItem.timeEnd,
                    clazz: AvailabilityType_Ns.toString(timeItem.type)
                });
            });
        });
        return items;
    }

    public assemble(items: CalItem[]): AvailabilityTherapistDayRecord[] {
        const _ = this._;

        return items.reduce((models: AvailabilityTherapistDayRecord[], item: CalItem) => {
            const date = item.date;
            let theDay: AvailabilityTherapistDayRecord = _.find(models, (model) => model.date === date);
            if (!theDay) {
                theDay = {
                    date: date,
                    timeItems: []
                };
                models.push(theDay);
            }
            theDay.timeItems.push({
                id: item.model.id,
                timeStart: item.timeStart,
                timeEnd: item.timeEnd,
                type: item.model.type
            });
            return models;
        }, []);
    }

    public canAdd(): boolean {
        return true;
    }

    public addItem(item: CalItem, $event): Promise<CalItem> {
        const DefaultAvailabilityService = this.DefaultAvailabilityService;
        const $q = this.$q;
        const defaultAvailability = DefaultAvailabilityService.get();
        const type = (defaultAvailability === AvailabilityType.undefined)
            ? AvailabilityType.unavailable
            : defaultAvailability;

        const dayRecord: AvailabilityTherapistDayRecord = {
            date: item.date,
            timeItems: [{
                id: null,
                type: type,
                timeStart: item.timeStart,
                timeEnd: item.timeEnd
            }]
        };
        if (defaultAvailability !== AvailabilityType.undefined) {
            return $q((resolve) => resolve(dayRecord))
                .then((dayRecord: AvailabilityTherapistDayRecord) => this.updateItem(item, dayRecord));
        } else {
            return this.DialogService.dialogAvailabilityTimeRecord(dayRecord, $event, false, this.$gridMode)
                .then((dayRecord: AvailabilityTherapistDayRecord) => this.updateItem(item, dayRecord));
        }
    }

    private updateItem(item: CalItem, dayRecord: AvailabilityTherapistDayRecord): CalItem {
        const timeItem: AvailabilityTimeRecord = dayRecord.timeItems[0];
        item.model = timeItem;
        item.timeStart = timeItem.timeStart;
        item.timeEnd = timeItem.timeEnd;
        item.clazz = AvailabilityType_Ns.toString(timeItem.type);
        item.date = dayRecord.date;
        return item;
    }

    public canEdit(): boolean {
        return true;
    }

    public editItem(item: CalItem, $event): Promise<CalItem> {
        const dayRecord: AvailabilityTherapistDayRecord = {
            date: item.date,
            timeItems: [item.model]
        };
        return this.DialogService.dialogAvailabilityTimeRecord(dayRecord, $event, true, this.$gridMode)
            .then((dayRecord: AvailabilityTherapistDayRecord): CalItem => {
                if (!dayRecord) {
                    return null; // remove item
                }
                const timeItem: AvailabilityTimeRecord = dayRecord.timeItems[0];
                item.model = timeItem;
                item.timeStart = timeItem.timeStart;
                item.timeEnd = timeItem.timeEnd;
                item.clazz = AvailabilityType_Ns.toString(timeItem.type);
                item.date = dayRecord.date;
                return item;
            });
    }

    public viewItem(item: CalItem, $event): void {
        const dayRecord: AvailabilityTherapistDayRecord = {
            date: item.date,
            timeItems: [item.model]
        };
        this.DialogService.dialogAvailabilityTimeRecord(dayRecord, $event, false, this.$gridMode);
    }

    public updateItemModel(item: CalItem): void {
        const timeRecord: AvailabilityTimeRecord = item.model;
        timeRecord.timeStart = item.timeStart;
        timeRecord.timeEnd = item.timeEnd;
    }

    public modelToString(model: AvailabilityTimeRecord): string[] {
        return [AvailabilityType_Ns.toString(model.type)];
    }


}
