import {timeFormat, ampmTimeFormat, workingDayStart, workingDayEnd} from '../../services/app.constant';
import {Moment} from '../../../../bower_components/moment/moment';
import {Rectangle} from '../../model/Rectangle';
import {BaseCalItem} from '../../model/BaseCalItem';
import {SlotSize_Ns} from '../../model/SlotSize';
import SlotSize = SlotSize_Ns.SlotSize;
import {DataCacheService} from '../../services/storage/data-cache.service';
import {DialogService} from '../../services/dialog/dialog.service';
import {Utils} from '../../services/utils.service';
import {Collection} from '../../model/Collection';
import {CalendarService} from '../../services/calendar.service';
import * as Ps from 'perfect-scrollbar';

export interface IRowCalItem extends BaseCalItem {
    model: any; // PreliminaryEvent
    column: IRowCalColumn;
    timeStart: number; // minutes since start of day
    timeEnd: number; // minutes since start of day
    rect?: Rectangle;
    clazz?: string;
}

export interface IRowCalColumn {
    columnKey: any;
    columnTitle: string;
    columnMeta?: any;
}

export interface IRowCalModel {
    items: any[]; // todo add type
    itemsBackground?: IRowCalItem[];
    isReadOnly?: boolean;
}

declare const angular: angular.IAngularStatic;
declare const $: any;

/**
 * M - model of calendar item
 */
export abstract class CalendarRowController<M> {

    protected workingDayStartMin;
    protected workingDayEndMin;

    private $itemsBefore: IRowCalItem[][] = []; // array of array of items with the same start time
    private $itemsInside: IRowCalItem[] = [];
    private $itemsAfter: IRowCalItem[][] = []; // array of array of items with the same start time
    private $bgItemsInside: IRowCalItem[] = [];

    private $slotSize: number; // minutes in slot
    private $slotHeight: number;
    private $slotWidth: number;
    private $calendarWidth: number;
    private $calendarHeight: number;
    private _canvas: JQuery; //

    abstract parse(models: M[]): IRowCalItem[];

    abstract assemble(items: IRowCalItem[]): M[];

    abstract updateItemModel(item: IRowCalItem): void ; // todo move outside -> to directive's callback

    abstract modelToString(model: M): string[];

    abstract bgModelToString(bgModel: any): string[];

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
        $scope.controller = this; // set oup controller link for outside access
        this.$slotHeight = 25;

        this.workingDayStartMin = CalendarService.time2dayMinutes(workingDayStart);
        this.workingDayEndMin = CalendarService.time2dayMinutes(workingDayEnd);


        const isReadOnly = $scope.config.isReadOnly;

        $scope.plusItem = {
            model: null,
            column: null,
            timeStart: 0,
            timeEnd: 0,
            rect: {
                width: 0,
                height: 0,
                top: 0,
                left: 0,
            },
        } as IRowCalItem;

        const container: HTMLElement = document.getElementById('calendarRowTableId');
        Ps.initialize(container, {
            wheelSpeed: 2,
            wheelPropagation: true,
            minScrollbarLength: 20
        });
        Ps.update(container);

        $scope.onClick = ($event) => {
            if (isReadOnly || !$scope.customOnAdd) {
                return;
            }

            const $slotWidth = this.$slotWidth;
            const $slotHeight = this.$slotHeight;

            $scope.isPlusItemShown = true;

            const plusItem: IRowCalItem = $scope.plusItem;
            const columnId = Math.floor($event.offsetX / $slotWidth);
            plusItem.column = $scope.columns[columnId];
            const slotNumStart = Math.floor($event.offsetY / $slotHeight);
            const slotNumEnd = slotNumStart + 1;
            plusItem.timeStart = this.$slotSize * slotNumStart;
            plusItem.timeEnd = this.$slotSize * slotNumEnd;
            plusItem.rect = {
                left: columnId * $slotWidth,
                top: slotNumStart * $slotHeight,
                width: $slotWidth + 1,
                height: $slotHeight + 1,
            };

        };

        $scope.onPlusClick = ($event) => {
            $event.stopPropagation();
            $scope.isPlusItemShown = false;
            const itemToAdd: IRowCalItem = angular.copy($scope.plusItem);

            $scope.customOnAdd(itemToAdd, $event)
                .then((addedItem: IRowCalItem) => {
                    if (addedItem) {
                        // add view
                        if (addedItem.rect) this.updateItemTime(addedItem);
                        $scope.items.push(addedItem);
                    }
                    this._updateItems();
                    this._updateItemsRect();
                }, () => {
                    // do nothing with view
                    this._updateItems();
                    this._updateItemsRect();
                });

        };

        $scope.onItemDblClick = ($event, item: IRowCalItem) => {
            $event.stopPropagation();
            $scope.isPlusItemShown = false;

            if (isReadOnly || !$scope.customOnEdit) {
                return;
            }
            const itemToEdit: IRowCalItem = angular.copy(item);

            $scope.customOnEdit(itemToEdit, $event)
                .then((editedItem: IRowCalItem) => {
                    if (editedItem) {
                        // edit view
                        this.copyItem(item, editedItem);
                    } else {
                        // remove view
                        $scope.items = $scope.items.filter((i) => i !== item);
                    }
                    this._updateItems();
                    this._updateItemsRect();
                }, () => {
                    // do nothing with view
                    this._updateItems();
                    this._updateItemsRect();
                });

        };

        $scope.showItem = (item: IRowCalItem): string[] => {
            return this.modelToString(item.model);
        };

        $scope.showBgItem = (item: IRowCalItem): string[] => {
            return this.bgModelToString(item.model);
        };

        /* init drag and drop */
        $scope.isDndAble = !isReadOnly;

        // custom mouseEvents

        const getDraggableElement = (event) => event.target.closest('.draggable');

        const draggableState = {
            drag: false,
            coords: {
                left: 0,
                top: 0
            },
            coorldsGlobal: {
                x: 0,
                y: 0
            },
            el: null, // is IHTMLElement,
            model: null,
            className: 'noselect',
            excludeClassName: 'material-icons'
        };

        const moveEl = (event) => {
            const el = draggableState.el;
            if (el) {
                if (draggableState.drag) {
                    $(el).offset({
                        left: event.pageX - 60,
                        top: event.pageY - 20
                    });
                }
            }
        };

        /**
         * Устанавливает начлаьное состояние и флаг перетаскивания
         * @param drag
         * @param event
         * @param model
         * @param globalCoords
         */
        const setDraggableState = (drag: boolean, event, model = null, globalCoords = false) => {
            const elem = getDraggableElement(event); // current draggable element
            $('body').toggleClass('noselect', drag);
            const box = elem.getBoundingClientRect(); // x,y in global of current el

            draggableState.drag = drag;
            draggableState.coords = $(elem).offset();
            draggableState.el = elem;

            if (model) {
                draggableState.model = model;
            }

            // запоминаем координаты на момент начала передвижения
            // мышь внутри блока x: [0..150]
            if (globalCoords) {
                const boxLeft = (box.left >= 0) ? box.left + window.scrollX : -box.left + window.scrollX;
                const boxTop = (box.top >= 0) ? box.top + window.scrollY : -box.top + window.scrollY;

                draggableState.coorldsGlobal = {
                    x: event.pageX - boxLeft + pageXOffset,
                    y: event.pageY - boxTop + pageYOffset,
                };
            }
        };

        const getItemByModel = (model) => _.find(this.getItems(), (item: IRowCalItem) => item.model.id === model.id);

        const getKeyByModel = (model) => _.findIndex(this.getItems(), (item: IRowCalItem) => item.model.id === model.id);

        /**
         * Мы нажимаем на конкретный блок события, зачем-то отчищаем хранилище контроллеров
         * Запоминаем начальное состояние модели и флаг перетаскивания
         * @param event
         * @param model
         */
        $scope.dMouseDown = (event, model) => {
            if (!(event.target.className.split(' ').includes(draggableState.excludeClassName)) && !(event.which === 3)) {
                SourceDropmodelStorage.clearSourceDropmodel();
                setDraggableState(true, event, model, true);
            }
            // moveEl(event);
        };

        $scope.dMouseMove = (event) => {
            const el = getDraggableElement(event);

            if (draggableState.drag) {
                if (el) {
                    const dragEvent: DragEvent = new (window as any).Event('drag');
                    el.dispatchEvent(dragEvent);
                }
                moveEl(event);
            }
        };

        /**
         * Отпускаем мышь на общем контейнере (scrollable)
         * Запускаем событие onDrop вручную, записываем новый параметры rect
         * canvasRect.x - координаты холста
         *  draggableState.coorldsGlobal.x - текущие координаты мыши внутри перетаскиваемого блока
         * @param event
         */
        $scope.dMouseUp = (event) => {
            const el = draggableState.el;

            if (draggableState.drag) {

                const dragEvent: DragEvent = new (window as any).Event('dragend');
                el.dispatchEvent(dragEvent);

                const model = angular.copy(draggableState.model);
                const item = getItemByModel(model);

                /**
                 * Event.clientX / clientY - координаты относительно координат контейнера.
                 * То есть надо учитывать левую шкалу времени и терапевтов
                 */
                const canvasRect = $('canvas')[0].getBoundingClientRect();
                $scope.items[getKeyByModel(model)].rect = {
                    left: event.clientX - canvasRect.x + 'px',
                    top: event.clientY - canvasRect.y + 'px',
                    height: item.rect.height,
                    width: item.rect.width
                };


                if (!SourceDropmodelStorage.getSourceDropmodel()) { // leave from source first time
                    SourceDropmodelStorage.putSourceDropmodel(this);
                }

                $scope.onDrop(this, model);

                SourceDropmodelStorage.clearSourceDropmodel();
                setDraggableState(false, event);

                document.onmousemove = null;
                el.onmouseup = null;
            }
        };

        $scope.onDragstart = ($dropmodel: CalendarRowController<M>, $dragmodel: M) => {
            SourceDropmodelStorage.clearSourceDropmodel(); // clear for sure
        };

        $scope.onDragend = ($dropmodel: CalendarRowController<M>, $dragmodel: M) => {
            SourceDropmodelStorage.clearSourceDropmodel(); // clear at the end
        };

        $scope.onDragenter = ($dropmodel: CalendarRowController<M>, $dragmodel: M) => {
            $scope.isPlusItemShown = false;
        };

        $scope.onDragleave = ($dropmodel: CalendarRowController<M>, $dragmodel: M) => {
            if (!SourceDropmodelStorage.getSourceDropmodel()) { // leave from source first time
                SourceDropmodelStorage.putSourceDropmodel($dropmodel);
            }
        };

        $scope.onDrop = ($dropmodel: CalendarRowController<M>, $dragmodel: M) => {

            let outSourceItems: IRowCalItem[];
            let outSourceItemIdx: number;
            let itemCopy: IRowCalItem;

            let item: IRowCalItem = getItemByModel($dragmodel);

            if (!item) {
                const dropFromCtrl: CalendarRowController<M> = SourceDropmodelStorage.getSourceDropmodel();
                if (!dropFromCtrl) {
                    // do nothing with view
                    this._updateItems();
                    this._updateItemsRect();
                    return;
                }
                outSourceItems = dropFromCtrl.$scope.items;
                outSourceItemIdx = getKeyByModel($dragmodel);
                item = outSourceItems[outSourceItemIdx];

                itemCopy = angular.copy(item);
                this.resetItemTime(itemCopy); // we don't know about Y position on the calendar
            } else {
                itemCopy = angular.copy(item);
                this.updateItemTime(itemCopy); // we know about Y position on the calendar
            }
            this.updateItemColumn(itemCopy);
            this.updateItemModel(itemCopy);

            $scope.customOnDrop(itemCopy, $scope.bgItems, $scope.items)
                .then((editedItem: IRowCalItem) => {
                    this.copyItem(item, editedItem);

                    if (outSourceItems) {
                        outSourceItems.splice(outSourceItemIdx, 1);
                        $scope.items.push(item);
                    }

                    this.applyModel();
                }, () => {
                    // cancel drop operation
                    this.resetModel();
                });
        };

        let dposX: number = 0; // scrollPosX
        const moveableArea = 150; // px
        const direction = {
            direction: 1, // 1 is right, -1 is left, 0 is none
            velocity: 0,
            limit: 0
        };

        // $interval(() => {
        //     if (direction.direction !== 0) {
        //         const CanvasContainer = $('.calendarRowTable');
        //         console.log(direction.direction)
        //         console.log(direction.limit)
        //         console.log(dposX)
        //
        //         switch (direction.direction) {
        //             case 1:
        //                 if (dposX < direction.limit) {
        //                     dposX += direction.velocity;
        //                 }
        //                 break;
        //             case -1:
        //                 if (dposX > direction.limit) {
        //                     dposX -= direction.velocity;
        //                 }
        //                 break;
        //         }
        //         CanvasContainer.scrollLeft(dposX);
        //     }
        // }, 10);

        const CanvasContainer = $('.calendarRowTable');
        const timesEl: JQuery = $('.calendarTimes');

        CanvasContainer.on('scroll', () => {
            dposX = CanvasContainer.scrollLeft();
        });

        $scope.onMouseMove = (event: MouseEvent) => {
            const canvas: HTMLElement = event.target as HTMLElement;

            const innerWidth = CanvasContainer.width() - timesEl.width();
            const dScrollX = $(canvas).width() - innerWidth;

            // const easeInCubic = t => t * t * t;
            const posX = CanvasContainer.scrollLeft();
            const getMoveableRangeRight = () => (event.offsetX - posX - (innerWidth - moveableArea)) / moveableArea;
            const getMoveableRangeLeft = () => (posX - event.offsetX) / moveableArea;

            if ((event.offsetX - posX > innerWidth - moveableArea) && (posX < dScrollX + 10)) {
                direction.velocity = 3 * getMoveableRangeRight();
                direction.direction = 1;
                direction.limit = dScrollX + 10;
            } else if ((event.offsetX < moveableArea + posX) && (posX > 0) && getMoveableRangeLeft() > 0) {
                direction.velocity = 3 * getMoveableRangeLeft();
                direction.direction = -1;
                direction.limit = 0;
            } else {    // no need to move
                direction.direction = 0;
            }
        };
        $scope.onMouseOut = () => {
            direction.direction = 0;
        };

        $scope.$watch('items.length', (itemsLength, prevItemsLength) => {
            // only when drag to outside
            if (!(isNaN(itemsLength) || isNaN(prevItemsLength)) &&
                itemsLength < prevItemsLength) {
                this.applyModel();
            }
        });
    }

    resetItemTime(item: IRowCalItem) {
        const $slotSize = this.$slotSize;
        const itemLenInSlots = Math.floor((item.timeEnd - item.timeStart) / $slotSize);
        item.timeStart = 0; // item.timeStart = this.workingDayStartMin;
        item.timeEnd = item.timeStart + itemLenInSlots * $slotSize;
    }

    updateItemTime(item: IRowCalItem): IRowCalItem {
        const rect: Rectangle = item.rect;
        const $slotHeight = this.$slotHeight;
        const $slotSize = this.$slotSize;
        const itemLenInSlots = Math.ceil((item.timeEnd - item.timeStart) / $slotSize);
        const workingDaySlotsNumber = (this.workingDayEndMin - this.workingDayStartMin) / $slotSize;

        let relSlotId = Math.floor(this.CalendarService.parsePx(rect.top) / $slotHeight) - this.$itemsBefore.length; // relative slot, started from working day start
        if (relSlotId < 0) {
            relSlotId = 0;
        } else if (relSlotId + itemLenInSlots >= workingDaySlotsNumber) {
            relSlotId = workingDaySlotsNumber - itemLenInSlots;
        }

        item.timeStart = this.workingDayStartMin + relSlotId * $slotSize;
        item.timeEnd = item.timeStart + itemLenInSlots * $slotSize;
        return item;
    }

    updateItemColumn(item: IRowCalItem) {
        const rect: Rectangle = item.rect;
        const columnId = Math.floor((this.CalendarService.parsePx(rect.left) + this.CalendarService.parsePx(rect.width) / 2) / this.$slotWidth);
        item.column = this.$scope.columns[columnId];
    }

    /**
     * Copy changed fields of IRowCalItem
     */
    copyItem(dst: IRowCalItem, src: IRowCalItem) {
        if (src !== undefined && dst !== undefined) {
            dst.column = src.column;
            dst.timeStart = src.timeStart;
            dst.timeEnd = src.timeEnd;
            dst.model = src.model;
        }
    }

    public applyModel() {
        const $scope = this.$scope;
        const items = this.assemble($scope.items);
        $scope.config.items = items;
        this._updateItems();
        this._updateItemsRect();
        return items;
    }

    public resetModel() {
        this._initItems();
        this._updateItems();
        this._updateItemsRect();
    }

    public getItems(): IRowCalItem[] {
        return this.$scope.items;
    }

    public init(calendarWidth: number, canvas: JQuery) {
        this._canvas = canvas;

        this._initSlotSize();
        this._initItems();
        this._updateItems();
        this.onCalendarResize(calendarWidth);
    }

    public onCalendarResize(calendarWidth: number) {
        const $scope = this.$scope;
        $scope.isPlusItemShown = false; // don't show plus item while resizing.

        this.$calendarWidth = calendarWidth;
        this._updateCanvas(calendarWidth, $scope.columns.length, $scope.times.length);
        this._updateItemsRect();
    }

    private _initItems() {
        const $scope = this.$scope;
        const config: IRowCalModel = $scope.config;
        $scope.items = this.parse(config.items);
        $scope.bgItems = angular.copy(config.itemsBackground);
    }

    private _updateItems() {
        const $scope = this.$scope;
        const items: IRowCalItem[] = $scope.items;
        const itemsGroups: IRowCalItem[][] = this.CalendarService.groupItemsByWorkingDayRange(items, this.workingDayStartMin, this.workingDayEndMin);
        const bgItems: IRowCalItem[] = this.$scope.bgItems;
        const bgItemsGroups: IRowCalItem[][] = this.CalendarService.groupItemsByWorkingDayRange(bgItems, this.workingDayStartMin, this.workingDayEndMin);

        const time2itemsBefore: Collection<IRowCalItem[]> = this._.groupBy(itemsGroups[0], (item: IRowCalItem) => item.timeStart); // minutes -> item[]
        this.$itemsBefore = this._convertTime2items(time2itemsBefore);

        itemsGroups[1].sort((a: IRowCalItem, b: IRowCalItem) => a.timeStart - b.timeStart);
        this.$itemsInside = itemsGroups[1];

        const time2itemsAfter: Collection<IRowCalItem[]> = this._.groupBy(itemsGroups[2], (item: IRowCalItem) => item.timeStart); // minutes -> item[]
        this.$itemsAfter = this._convertTime2items(time2itemsAfter);

        bgItemsGroups[1].sort((a: IRowCalItem, b: IRowCalItem) => a.timeStart - b.timeStart);
        this.$bgItemsInside = bgItemsGroups[1];

        const beforeTimes: string[] = this._convertTime2ItemsToTimeStrings(time2itemsBefore);
        const afterTimes: string[] = this._convertTime2ItemsToTimeStrings(time2itemsAfter);
        this._updateTimes(beforeTimes, afterTimes);
        this._updateCanvas(this.$calendarWidth, $scope.columns.length, $scope.times.length);


    }

    private _convertTime2items(time2items: Collection<IRowCalItem[]>): IRowCalItem[][] {
        return this._.map(time2items, items => items)// make array
            .sort((itemsA: IRowCalItem[], itemsB: IRowCalItem[]) => itemsA[0].timeStart - itemsB[0].timeStart);
    }

    private _convertTime2ItemsToTimeStrings(time2items: Collection<IRowCalItem[]>): string[] {
        return this._.map(time2items, (items: IRowCalItem[], timeMin: number) => timeMin)// make array
            .sort((a, b) => a - b)// sort in chronological order
            .map((timeMin: number): string => this.CalendarService.dayMinutes2time(timeMin, ampmTimeFormat));
    }

    private _initSlotSize() {
        const $scope = this.$scope;

        this.$slotSize = SlotSize.slot30min;

        $scope.$watch('$parent.slotSize', (slotSize) => {
            this.$slotSize = slotSize;

            this._updateItems();
            this._updateItemsRect();
        });
    }


    private _updateTimes(beforeTimes: string[], afterTimes: string[]) {
        const dayTimes = this._generateTimes(this.$slotSize);
        this.$scope.times = beforeTimes.concat(dayTimes).concat(afterTimes);
    }

    private _generateTimes(slotSize: number): string[] {
        const moment = this.moment;
        const timeTitles = [];
        const endDay: Moment = moment(workingDayEnd, timeFormat);
        let time: Moment;
        for (time = moment(workingDayStart, timeFormat); time.isBefore(endDay); time.add(slotSize, 'm')) {
            timeTitles.push(time.format(ampmTimeFormat));
        }
        return timeTitles;
    }

    private _updateCanvas(calendarWidth: number, columnsCount: number, slotsCount: number) {
        // grid width and height
        const minWidth = 100 * columnsCount;
        const leftIndent = $('.leftMenu').width();
        const formWidth = $(window).innerWidth() - leftIndent - 140;
        calendarWidth = (minWidth < calendarWidth) ? calendarWidth : minWidth;
        const slotWidth = this.$slotWidth = calendarWidth / columnsCount;

        // this.$slotWidth = slotWidth;

        const slotHeight = this.$slotHeight;
        this.$calendarHeight = slotHeight * slotsCount;

        const canvas: HTMLCanvasElement = this._canvas.get(0) as HTMLCanvasElement;
        const context = canvas.getContext('2d');

        context.clearRect(0, 0, canvas.width, canvas.height);
        // size of canvas
        $(canvas as HTMLElement).attr({
            width: calendarWidth,
            height: this.$calendarHeight
        });

        $('.calendarRowTable').css({
            width: formWidth,
        });

        $('.columnContainer').css({width: calendarWidth});

        const maxX = slotWidth * columnsCount;
        const maxY = this.$calendarHeight;

        // draw hor lines
        for (let x = 0; x <= maxX; x += slotWidth) {
            context.moveTo(0.5 + x, 0);
            context.lineTo(0.5 + x, maxY);
        }
        context.moveTo(maxX - 0.5, 0);
        context.lineTo(maxX - 0.5, maxY);

        // draw vertical lines
        for (let y = 0; y <= maxY; y += slotHeight) {
            context.moveTo(0, 0.5 + y);
            context.lineTo(maxX, 0.5 + y);
        }
        context.moveTo(0, maxY - 0.5);
        context.lineTo(maxX, maxY - 0.5);

        context.strokeStyle = '#838383';
        context.stroke();
    }

    private _updateItemsRect() {

        const columns: IRowCalColumn[] = this.$scope.columns;
        const $itemsBefore: IRowCalItem[][] = this.$itemsBefore;
        const $itemsAfter: IRowCalItem[][] = this.$itemsAfter;
        const $itemsInside: IRowCalItem[] = this.$itemsInside;
        const $bgItemsInside: IRowCalItem[] = this.$bgItemsInside;
        this.$scope.freshRectSize = this.$itemsInside[0] ? this.$itemsInside[0].rect : null;

        if (this.$itemsInside[0] && this.$itemsInside[0].rect) {
            this.$itemsInside[0].rect.width = this.$slotWidth;
            this.$scope.freshRectSize = this.$itemsInside[0].rect;
        }
        const column2bgItemsInside: Collection<IRowCalItem[]> = this.CalendarService.groupItemsByColumnKey($bgItemsInside);
        const column2itemsInside: Collection<IRowCalItem[]> = this.CalendarService.groupItemsByColumnKey($itemsInside);
        columns.forEach((column: IRowCalColumn) => {
            this._updateItemsRectInside(column2bgItemsInside[column.columnKey]);
            this._updateItemsRectInside(column2itemsInside[column.columnKey]);
        });

        columns.map((column: IRowCalColumn): IRowCalItem[][] => {
            const columnKey = column.columnKey;
            return $itemsBefore.map((timeItems: IRowCalItem[]): IRowCalItem[] => {
                return timeItems.filter((item: IRowCalItem) => item.column && item.column.columnKey === columnKey);
            });
        }).forEach(($columnItemsBefore: IRowCalItem[][]) => {
            this._updateItemsRectBefore($columnItemsBefore);
        });

        columns.map((column: IRowCalColumn): IRowCalItem[][] => {
            const columnKey = column.columnKey;
            return $itemsAfter.map((timeItems: IRowCalItem[]): IRowCalItem[] => {
                return timeItems.filter((item: IRowCalItem) => item.column && item.column.columnKey === columnKey);
            });
        }).forEach(($columnItemsAfter: IRowCalItem[][]) => {
            this._updateItemsRectAfter($columnItemsAfter);
        });
    }

    private _updateItemsRectBefore($columnItemsBefore: IRowCalItem[][]) {
        const $slotWidth = this.$slotWidth;
        const $slotHeight = this.$slotHeight;
        // draw events started before working day start
        $columnItemsBefore.forEach((items: IRowCalItem[], pos) => {
            const subColumnWidth = $slotWidth / items.length;

            items.forEach((item: IRowCalItem, subColumnId) => {
                const subColumnOffset = subColumnId * subColumnWidth;
                const startPos = pos;
                const endPos = startPos + 1;
                const columnId = this.findColumnIndex(item.column);
                item.rect = {
                    width: subColumnWidth + 1,
                    height: (endPos - startPos) * $slotHeight + 1,
                    top: startPos * $slotHeight,
                    left: columnId * $slotWidth + subColumnOffset,
                };
            });
        });
    }

    private _updateItemsRectAfter($columnItemsAfter: IRowCalItem[][]) {
        const $slotWidth = this.$slotWidth;
        const $slotHeight = this.$slotHeight;
        const $slotSize = this.$slotSize;
        const $itemsBefore: IRowCalItem[][] = this.$itemsBefore;
        const beforeSlotsLength = $itemsBefore.length;
        // draw events finished after working day end
        const workingDaySlotsNumber = (this.workingDayEndMin - this.workingDayStartMin) / $slotSize;
        $columnItemsAfter.forEach((items: IRowCalItem[], pos) => {
            const subColumnWidth = $slotWidth / items.length;
            items.forEach((item: IRowCalItem, subColumnId) => {
                const subColumnOffset = subColumnId * subColumnWidth;
                const startPos = pos + workingDaySlotsNumber + beforeSlotsLength;
                const endPos = startPos + 1;
                const columnId = this.findColumnIndex(item.column);
                item.rect = {
                    width: subColumnWidth + 1,
                    height: (endPos - startPos) * $slotHeight + 1,
                    top: startPos * $slotHeight,
                    left: columnId * $slotWidth + subColumnOffset,
                };
            });
        });
    }

    private _updateItemsRectInside(columnItemsInside: IRowCalItem[]) {
        if (columnItemsInside && columnItemsInside.length) {
            this.CalendarService.updateRowCalItemsRect(columnItemsInside,
                this.$scope.columns,
                this.$slotWidth,
                this.$slotHeight,
                this.$slotSize,
                this.$itemsBefore.length,
                this.workingDayStartMin);
        }
    }

    private findColumnIndex(itemColumn: IRowCalColumn): number {
        return this.CalendarService.findColumnIndex(itemColumn, this.$scope.columns);
    }

}
