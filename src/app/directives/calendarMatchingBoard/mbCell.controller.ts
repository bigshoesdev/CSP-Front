import {timeFormat, ampmTimeFormat, workingDayStart, workingDayEnd} from '../../services/app.constant';
import {Moment} from '../../../../bower_components/moment/moment';
import {PreliminaryEvent} from '../../model/rest/PreliminaryEvent';
import {Rectangle} from '../../model/Rectangle';
import {SlotSize_Ns} from '../../model/SlotSize';
import {BaseCalItem} from '../../model/BaseCalItem';
import SlotSize = SlotSize_Ns.SlotSize;
import {CompositeTime} from '../../model/rest/CompositeTime';
import {DialogService} from '../../services/dialog/dialog.service';
import {Utils} from '../../services/utils.service';
import {CalendarService} from '../../services/calendar.service';

export interface IMbCell {
    model: PreliminaryEvent[];
    isReadOnly?: boolean;
}

export interface IMbCellItem extends BaseCalItem {
    model: any; // PreliminaryEvent
    timeStart: number; // minutes since start of day
    timeEnd: number; // minutes since start of day
    rect?: Rectangle;
}

declare let angular: any;
declare let $: any;

export class MbCellController {

    private $itemsBefore: IMbCellItem[][] = []; // array of array of items with the same start time
    private $itemsInside: IMbCellItem[] = [];
    private $itemsAfter: IMbCellItem[][] = []; // array of array of items with the same start time

    private $slotSize: number; // minutes in slot
    private $slotHeight: number;
    private $slotWidth: number;
    private $calendarWidth;
    private $calendarHeight;
    private _canvas;

    private workingDayStartMin;
    private workingDayEndMin;


    public parse(models: PreliminaryEvent[]): IMbCellItem[] {
        const CalendarService: CalendarService = this.CalendarService;

        const items: IMbCellItem[] = [];
        models.forEach((model: PreliminaryEvent) => {
            const timeStart = CalendarService.time2dayMinutes(model.time);
            const d: CompositeTime = model.duration;
            const duration: number = d.clean + d.processing + d.prep;
            const timeEnd = timeStart + duration;
            items.push({
                model: model,
                timeStart: timeStart,
                timeEnd: timeEnd
            });
        });
        return items;
    }

    public assemble(items: IMbCellItem[]): PreliminaryEvent[] {
        return items.reduce((models: PreliminaryEvent[], item: IMbCellItem) => {
            const model: PreliminaryEvent = item.model;
            models.push(model);
            return models;
        }, []);
    }

    public canAdd(): boolean {
        return true;
    }

    public addItem(item: IMbCellItem, $event): any {
        const __this = this;
        // todo provide dialog
        // let dayRecord: AvailabilityTherapistDayRecord = {
        //     date: item.date,
        //     timeItems: [{
        //         type: AvailabilityType_Ns.unavailable,
        //         timeStart: item.timeStart,
        //         timeEnd: item.timeEnd
        //     }]
        // };
        // return __this.DialogService.dialogAvailabilityTimeRecord(dayRecord, $event, false)
        //     .then((dayRecord: AvailabilityTherapistDayRecord): IMbCellItem => {
        //         let timeItem: AvailabilityTimeRecord = dayRecord.timeItems[0];
        //         item.model = timeItem;
        //         item.timeStart = timeItem.timeStart;
        //         item.timeEnd = timeItem.timeEnd;
        //         item.date = dayRecord.date;
        //         return item;
        //     });
        return __this.$q(resolve => resolve(item));
    }

    public canEdit(): boolean {
        return true;
    }

    public editItem(item: IMbCellItem, $event): any {
        const __this = this;

        // todo provide dialog
        // let dayRecord: AvailabilityTherapistDayRecord = {
        //     date: item.date,
        //     timeItems: [item.model]
        // };
        // return __this.DialogService.dialogAvailabilityTimeRecord(dayRecord, $event, true)
        //     .then((dayRecord: AvailabilityTherapistDayRecord): IMbCellItem => {
        //         if (!dayRecord) {
        //             return null; // remove item
        //         }
        //         let timeItem: AvailabilityTimeRecord = dayRecord.timeItems[0];
        //         item.model = timeItem;
        //         item.timeStart = timeItem.timeStart;
        //         item.timeEnd = timeItem.timeEnd;
        //         item.date = dayRecord.date;
        //         return item;
        //     });
        return __this.$q(resolve => resolve(item));
    }

    public updateItemModel(item: IMbCellItem): void {
        const CalendarService: CalendarService = this.CalendarService;
        const model: PreliminaryEvent = item.model;

        // update time
        model.time = CalendarService.dayMinutes2time(item.timeStart);

        // todo update room
        // model.roomId = ;

        // todo update therapist
        // model.therapistId = ;

        // todo update date
        // model.date = ;

    }

    public modelToString(model: PreliminaryEvent): string {
        const d: CompositeTime = model.duration;
        const duration: number = d.clean + d.processing + d.prep;
        return model.note + ' [ ' + model.time + ' - ' + duration + ' min ]';
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
                protected CalendarService: CalendarService) {
        this.$slotHeight = 25;

        this.workingDayStartMin = CalendarService.time2dayMinutes(workingDayStart);
        this.workingDayEndMin = CalendarService.time2dayMinutes(workingDayEnd);


        const isReadOnly = $scope.config.isReadOnly;

        const plusItem: IMbCellItem = {
            model: '+',
            timeStart: 0,
            timeEnd: 0,
            rect: {
                width: 0,
                height: 0,
                top: 0,
                left: 0,
            }
        };
        $scope.plusItem = plusItem;

        $scope.onClick = ($event) => {
            if (!this.canAdd() || isReadOnly) {
                return;
            }

            const $slotWidth = this.$slotWidth;
            const $slotHeight = this.$slotHeight;

            $scope.isPlusItemShown = true;

            const plusItem2: IMbCellItem = $scope.plusItem;
            const slotNumStart = Math.floor($event.offsetY / $slotHeight);
            const slotNumEnd = slotNumStart + 1;
            plusItem2.timeStart = this.$slotSize * slotNumStart;
            plusItem2.timeEnd = this.$slotSize * slotNumEnd;
            plusItem2.rect = {
                left: 0,
                top: slotNumStart * $slotHeight,
                width: $slotWidth + 1,
                height: $slotHeight + 1,
            };

        };

        $scope.onPlusClick = ($event) => {
            $event.stopPropagation();
            $scope.isPlusItemShown = false;
            const itemToAdd = angular.copy($scope.plusItem);

            this.addItem(itemToAdd, $event).then(() => {
                $scope.items.push(itemToAdd);
                this.updateItems();
                this.updateGrid();
            });
        };

        $scope.onItemClick = ($event, item: IMbCellItem) => {
            $event.stopPropagation();

            if (!this.canEdit() || isReadOnly) {
                return;
            }

            const itemToEdit = angular.copy(item);

            this.editItem(itemToEdit, $event).then((editedItem) => {
                if (editedItem) {
                    // handle edit
                    item.timeStart = editedItem.timeStart;
                    item.timeEnd = editedItem.timeEnd;
                    item.model = editedItem.model;
                } else {
                    // handle remove
                    $scope.items = $scope.items.filter((i) => i !== item);
                }
                this.updateItems();
                this.updateGrid();
            });

        };

        $scope.showItem = (item: IMbCellItem) => {
            return this.modelToString(item.model);
        };

        /* init drag and drop */
        $scope.isDndAble = this.canEdit() && !isReadOnly;

        $scope.onDragstart = ($dropmodel: IMbCellItem[], $dragmodel: PreliminaryEvent) => {
            SourceDropmodelStorage.clearSourceDropmodel(); // clear for sure
        };
        $scope.onDragend = ($dropmodel: IMbCellItem[], $dragmodel: PreliminaryEvent) => {
            SourceDropmodelStorage.clearSourceDropmodel(); // clear at the end
        };

        $scope.onDragenter = ($dropmodel: IMbCellItem[], $dragmodel: PreliminaryEvent) => {
        };

        $scope.onDragleave = ($dropmodel: IMbCellItem[], $dragmodel: PreliminaryEvent) => {
            if (!SourceDropmodelStorage.getSourceDropmodel()) { // leave from source first time
                SourceDropmodelStorage.putSourceDropmodel($dropmodel);
            }
        };

        $scope.onDrop = ($dropmodel: IMbCellItem[], $dragmodel: PreliminaryEvent) => {

            let outSourceItems: IMbCellItem[];
            let outSourceItemIdx;

            let item: IMbCellItem = _.find($scope.items, (item: IMbCellItem) => item.model === $dragmodel);
            if (!item) {
                outSourceItems = SourceDropmodelStorage.getSourceDropmodel();
                outSourceItemIdx = _.findIndex(outSourceItems, (item: IMbCellItem) => item.model === $dragmodel);
                item = outSourceItems[outSourceItemIdx];
            }

            if (item) {
                if (outSourceItems) {
                    $scope.items.push(item);
                    this.putItemToStartWorkDay(item);
                    this.updateItems();

                    outSourceItems.splice(outSourceItemIdx, 1);
                } else {
                    this.updateItemFromRect(item);
                }

                this.updateItemModel(item);
            }

            this._updateItemsRect();
            this.applyModel();
        };

        $scope.$watch('items.length', (itemsLength, prevItemsLength) => {
            // only when drag to outside
            if (!(isNaN(itemsLength) || isNaN(prevItemsLength)) &&
                itemsLength < prevItemsLength) {
                this.applyModel();
            }
        });

    }

    private putItemToStartWorkDay(item: IMbCellItem) {
        const $slotSize = this.$slotSize;
        const itemLenInSlots = Math.floor((item.timeEnd - item.timeStart) / $slotSize);
        item.timeStart = this.workingDayStartMin;
        item.timeEnd = item.timeStart + itemLenInSlots * $slotSize;
    }

    private updateItemFromRect(item: IMbCellItem) {
        const rect: Rectangle = item.rect;

        const $slotHeight = this.$slotHeight;
        const $slotSize = this.$slotSize;
        const itemLenInSlots = Math.floor((item.timeEnd - item.timeStart) / $slotSize);

        const workingDaySlotsNumber = (this.workingDayEndMin - this.workingDayStartMin) / $slotSize;

        let relSlotId = Math.floor(this.CalendarService.parsePx(rect.top) / $slotHeight) - this.$itemsBefore.length; // relative slot, started from working day start
        if (relSlotId < 0) {
            relSlotId = 0;
        } else if (relSlotId + itemLenInSlots >= workingDaySlotsNumber) {
            relSlotId = workingDaySlotsNumber - itemLenInSlots;
        }

        item.timeStart = this.workingDayStartMin + relSlotId * $slotSize;
        item.timeEnd = item.timeStart + itemLenInSlots * $slotSize;
    }

    public applyModel() {
        return this.$scope.config.model = this.assemble(this.$scope.items);
    }

    public resetModel() {
        this.$scope.items = this.parse(this.$scope.config.model);
        this.updateItems();
        this.updateGrid();
    }

    public getItems(): IMbCellItem[] {
        return this.$scope.items;
    }

    public init(calendarWidth, canvas) {
        this._canvas = canvas;

        this._initItems();
        this.initSlotSize();
        this.updateItems();
        this.onCalendarResize(calendarWidth);
    }

    private _initItems() {
        this.$scope.items = this.parse(this.$scope.config.model);
    }

    private updateItems() {
        const $scope = this.$scope;

        const items: IMbCellItem[] = $scope.items;

        this.$itemsInside = [];
        this.$itemsBefore = [];
        this.$itemsAfter = [];

        const time2itemsAfter = {}; // minutes -> item[]
        const time2itemsBefore = {}; // minutes -> item[]

        items.forEach((item: IMbCellItem) => {
            if (item.timeStart < this.workingDayStartMin) {
                let timeItems = time2itemsBefore[item.timeStart];
                if (!timeItems) {
                    timeItems = time2itemsBefore[item.timeStart] = [];
                }
                timeItems.push(item);
            } else if (item.timeEnd > this.workingDayEndMin) {
                let timeItems = time2itemsAfter[item.timeStart];
                if (!timeItems) {
                    timeItems = time2itemsAfter[item.timeStart] = [];
                }
                timeItems.push(item);
            } else {
                this.$itemsInside.push(item);
            }
        });

        // sort in chronological order
        this.$itemsInside.sort((a: IMbCellItem, b: IMbCellItem) => a.timeStart - b.timeStart);
        this.$itemsBefore = this.convertTime2items(time2itemsBefore);
        this.$itemsAfter = this.convertTime2items(time2itemsAfter);


        const before: string[] = this.convertTime2ItemsToTimeStrings(time2itemsBefore);
        const after: string[] = this.convertTime2ItemsToTimeStrings(time2itemsAfter);


        this.updateTimes(before, after);
        this.updateCanvas($scope.times.length);
    }

    private convertTime2items(time2items): IMbCellItem[][] {
        return this._.map(time2items, (items: IMbCellItem[], timeMin) => items)
            .sort((itemsA: IMbCellItem[], itemsB: IMbCellItem[]) => itemsA[0].timeStart - itemsB[0].timeStart);
    }

    private convertTime2ItemsToTimeStrings(time2items) {
        const CalendarService: CalendarService = this.CalendarService;
        return this._.map(time2items, (items, timeMin) => timeMin)
            .sort((a, b) => a - b)// sort in chronological order
            .map((timeMin) => CalendarService.dayMinutes2time(timeMin, ampmTimeFormat));
    }

    private initSlotSize() {
        const $scope = this.$scope;

        this.$slotSize = SlotSize.slot30min;

        $scope.$watch('$parent.slotSize', (slotSize) => {
            this.$slotSize = slotSize;

            this.updateItems();
            this.updateGrid();
        });
    }

    private updateTimes(before: string[], after: string[]) {
        const dayTimes = this.generateTimes(this.$slotSize);
        this.$scope.times = before.concat(dayTimes).concat(after);
    }

    private generateTimes(slotSize: number): string[] {
        const moment = this.moment;

        const timeTitles = [];
        const endDay: Moment = moment(workingDayEnd, timeFormat);
        let time: Moment;
        for (time = moment(workingDayStart, timeFormat); time.isBefore(endDay); time.add(slotSize, 'm')) {
            timeTitles.push(time.format(ampmTimeFormat));
        }
        return timeTitles;
    }

    public onCalendarResize(calendarWidth) {
        this.$calendarWidth = calendarWidth;

        this.updateCanvas(this.$scope.times.length);
        this.updateGrid();
    }

    private updateCanvas(slotsLength) {
        const $scope = this.$scope;
        // grid width and height

        const slotWidth = this.$calendarWidth;
        this.$slotWidth = slotWidth;

        const slotHeight = this.$slotHeight;
        this.$calendarHeight = slotHeight * slotsLength;

        $scope.slotHeight = slotHeight;

        const canvas = this._canvas;
        const context = canvas.get(0).getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        // size of canvas
        canvas.attr({width: this.$calendarWidth, height: this.$calendarHeight});
        // draw grid
        const maxX = slotWidth;
        const maxY = this.$calendarHeight;
        for (let x = 0; x <= maxX; x += slotWidth) {
            context.moveTo(0.5 + x, 0);
            context.lineTo(0.5 + x, maxY);
        }
        context.moveTo(maxX - 0.5, 0);
        context.lineTo(maxX - 0.5, maxY);

        for (let y = 0; y <= maxY; y += slotHeight) {
            context.moveTo(0, 0.5 + y);
            context.lineTo(maxX, 0.5 + y);
        }
        context.moveTo(0, maxY - 0.5);
        context.lineTo(maxX, maxY - 0.5);

        context.strokeStyle = '#838383';
        context.stroke();
    }

    private updateGrid() {

        this._updateItemsRect();
        // this._updateItemsRect($scope.items);
        // this._updateItemsRect([$scope.plusItem]);
    }


    private _updateItemsRect() {
        this.updateItemsRectBefore();
        this.updateItemsRectAfter();
        this.updateItemsRectInside();
    }

    private updateItemsRectBefore() {
        const $slotWidth = this.$slotWidth;
        const $slotHeight = this.$slotHeight;

        const $itemsBefore = this.$itemsBefore;

        // draw events started before working day start
        $itemsBefore.forEach((items: IMbCellItem[], pos) => {
            const columnWidth = $slotWidth / items.length;

            items.forEach((item: IMbCellItem, subColumnId) => {
                const columnOffset = subColumnId * columnWidth;
                const startPos = pos;
                const endPos = startPos + 1;
                item.rect = {
                    width: columnWidth + 1,
                    height: (endPos - startPos) * $slotHeight + 1,
                    top: startPos * $slotHeight,
                    left: columnOffset
                };
            });
        });
    }

    private updateItemsRectAfter() {
        const $slotWidth = this.$slotWidth;
        const $slotHeight = this.$slotHeight;
        const $slotSize = this.$slotSize;


        const $itemsBefore = this.$itemsBefore;
        const $itemsAfter = this.$itemsAfter;
        const beforeSlotsLength = $itemsBefore.length;

        // draw events finished after working day end
        const workingDaySlotsNumber = (this.workingDayEndMin - this.workingDayStartMin) / $slotSize;
        $itemsAfter.forEach((items: IMbCellItem[], pos) => {
            const columnWidth = $slotWidth / items.length;

            items.forEach((item: IMbCellItem, columnId) => {
                const columnOffset = columnId * columnWidth;
                const startPos = pos + workingDaySlotsNumber + beforeSlotsLength;
                const endPos = startPos + 1;
                item.rect = {
                    width: columnWidth + 1,
                    height: (endPos - startPos) * $slotHeight + 1,
                    top: startPos * $slotHeight,
                    left: columnOffset
                };
            });
        });
    }


    private updateItemsRectInside() {
        const CalendarService: CalendarService = this.CalendarService;
        const $slotWidth = this.$slotWidth;
        const $slotHeight = this.$slotHeight;
        const $slotSize = this.$slotSize;


        const $itemsInside = this.$itemsInside;
        const $itemsBefore = this.$itemsBefore;
        const beforeSlotsLength = $itemsBefore.length;

        // Zone contain Column of items to draw when items overlap
        const zones: IMbCellItem[][][] = CalendarService.calculateZonesOfOverlap($itemsInside);

        zones.forEach((zone: IMbCellItem[][]) => {
            const columnWidth = $slotWidth / zone.length;
            zone.forEach((column: IMbCellItem[], columnId) => {
                const columnOffset = columnId * columnWidth;
                column.forEach((item: IMbCellItem) => {
                    const startPos = Math.floor((item.timeStart - this.workingDayStartMin) / $slotSize) + beforeSlotsLength;
                    const endPos = Math.ceil((item.timeEnd - this.workingDayStartMin) / $slotSize) + beforeSlotsLength;
                    item.rect = {
                        width: columnWidth + 1,
                        height: (endPos - startPos) * $slotHeight + 1,
                        top: startPos * $slotHeight,
                        left: columnOffset
                    };
                });
            });
        });

    }


}
