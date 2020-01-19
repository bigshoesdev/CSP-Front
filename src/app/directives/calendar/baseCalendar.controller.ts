import {Moment} from '../../../../bower_components/moment/moment.d';
import {dateFormat, timeFormat} from '../../services/app.constant';
import {CalendarLoadMode} from '../../model/CalendarLoadMode';
import {CalendarMode_Ns} from '../../model/CalendarMode';
import {CalItem} from '../../model/CalItem';
import {Rectangle} from '../../model/Rectangle';
import {CalendarConf} from '../../model/CalendarConf';
import {SlotSize_Ns} from '../../model/SlotSize';
import CalendarModeEnum = CalendarMode_Ns.CalendarMode;
import SlotSize = SlotSize_Ns.SlotSize;
import {CalendarService} from '../../services/calendar.service';

declare const angular: any;
declare const $: any;

export abstract class BaseCalendarController {

    public $loadMode: CalendarLoadMode;
    public $gridMode: CalendarModeEnum;
    public $gridModePrev: CalendarModeEnum; // previous $gridMode value to detect changes

    public $weekShift: number; // from start date
    public $minWeekShift: number; // from start date
    public $maxWeekShift: number; // from start date
    public $today: Moment;
    public $weekStart: Moment;
    public $weekEnd: Moment;

    public $slotSize: number; // minutes in slot
    public $slotHeight: number;
    public $days: Moment[];

    public $items: CalItem[][] = [[], [], []];

    private $calendarWidth;
    private $calendarHeight;
    private $slotWidth;
    private $columnCount;

    private _canvas;

    abstract parse(models: any[]): CalItem[];

    abstract assemble(items: CalItem[]): any[];

    abstract canAdd(): boolean;

    abstract addItem(item: CalItem, $event): Promise<CalItem>;

    abstract canEdit(): boolean;

    abstract editItem(item: CalItem, $event): Promise<CalItem>;

    abstract viewItem(item: CalItem, $event): void;

    abstract updateItemModel(item: CalItem): void;

    abstract modelToString(model: any): string[];

    public constructor(protected $scope,
                       protected _,
                       protected moment,
                       protected CalendarService: CalendarService,
                       protected $document: ng.IDocumentService,
                       protected toastr) {
        $scope.controller = this; // set oup controller link for outside access

        this.$slotHeight = 25;
        const isDrag = [];

        const isReadOnly = $scope.config.isReadOnly;
        $scope.canEdit = !isReadOnly && this.canEdit();
        $scope.canAdd = !isReadOnly && this.canAdd();
        $scope.canDnd = !isReadOnly && this.canEdit();

        let _startPoint: number[] = null; // [left px, top px]

        const plusItem: CalItem = {
            model: '+',
            date: '',
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

        $scope.onCanvasMousedown = ($event) => {
            _startPoint = [$event.offsetX, $event.offsetY];
        };

        let _ignoreBodyClick = false;

        $scope.onPlusClick = ($event) => {
            _ignoreBodyClick = true;
            $event.stopPropagation();
            $scope.isPlusItemShown = false;

            const itemToAdd: CalItem = angular.copy($scope.plusItem);

            this.addItem(itemToAdd, $event).then(() => {
                this.$items[this.$gridMode].push(itemToAdd);
                this.resolveCollisions(itemToAdd);
                this._generateGrid();
            });
        };

        /**
         * Action occurs  when user clicks edit exist availability in the cell
         * @param $event
         * @param {CalItem} item
         */
        $scope.onItemClick = ($event, item: CalItem) => {
            $event.stopPropagation();

            const itemClone: CalItem = angular.copy(item);

            if ($scope.canEdit) {
                this.editItem(itemClone, $event).then((editedItem) => {
                    if (editedItem) {
                        // handle edit
                        item.date = editedItem.date;
                        item.timeStart = editedItem.timeStart;
                        item.timeEnd = editedItem.timeEnd;
                        item.model = editedItem.model;
                        item.clazz = editedItem.clazz;
                    } else {
                        // handle remove
                        this.$items[this.$gridMode] = this.$items[this.$gridMode].filter(($item) => $item !== item);
                    }
                    this._generateGrid();
                });
            } else {
                this.viewItem(itemClone, $event);
            }
        };

        /**
         * Redraw cells many times when call click, drag, select and etc.
         * @param {CalItem} item
         * @returns {string[]}
         */
        $scope.showItem = (item: CalItem): string[] => {
            return this.modelToString(item.model);
        };

        /* init drag and drop */
        $scope.dropmodel = 'dropmodel';

        $scope.setZIndex = ($dragmodel) => {
            return {
                'z-index': isDrag[$dragmodel.model.id] ? 2 : 1,
            };
        };

        $scope.onDrop = ($dropmodel, $dragmodel) => {
            const item: CalItem = _.find($scope.items, (item) => item.model === $dragmodel);
            this._updateItemFromRect(item);
            this.updateItemModel(item);
            this._updateItemsRect($scope.items);
            isDrag[$dragmodel.id] = false;
        };

        $scope.onDragenter = (dropmodel, itemModel) => {
            isDrag[itemModel.id] = true;
            _ignoreBodyClick = true;
            $scope.isLassoFrameShown = false;
            $scope.isPlusItemShown = false;
        };

        $scope.onDragleave = (dropmodel, itemModel) => {
            // console.log('dragleave', arguments);
        };

        $scope.lassoOnStart = (rect: Rectangle) => {
            if (!$scope.canAdd) {
                return;
            }

            $scope.isLassoFrameShown = true;
            $scope.isPlusItemShown = false;
        };

        $scope.lassoOnDrag = (rect: Rectangle) => {
            const left = _startPoint && _startPoint[0] || this.CalendarService.parsePx(rect.left);
            const dayId = Math.floor(left / this.$slotWidth);
            const range: number[] = this._getRectSlotRange(rect);
            const slotNumStart = range[0];
            const slotNumEnd = range[1];

            $scope.lassoFrameRect = this._createAdjustedRect(dayId, slotNumStart, slotNumEnd);
        };

        $scope.lassoOnEnd = (rect: Rectangle) => {
            if (!this.canAdd() || isReadOnly) {
                return;
            }

            $scope.isLassoFrameShown = false;
            $scope.isPlusItemShown = true;

            const left = _startPoint && _startPoint[0] || this.CalendarService.parsePx(rect.left);
            const dayId = Math.floor(left / this.$slotWidth);

            const plusItem: CalItem = $scope.plusItem;
            plusItem.date = moment(this.$weekStart).add(dayId, 'd').format(dateFormat);
            const [slotNumStart, slotNumEnd]: number[] = this._getRectSlotRange(rect);

            plusItem.timeStart = this.$slotSize * slotNumStart;
            plusItem.timeEnd = this.$slotSize * slotNumEnd;
            plusItem.rect = this._createAdjustedRect(dayId, slotNumStart, slotNumEnd);

            _startPoint = null;

            _ignoreBodyClick = true;
        };

        $scope.onBodyClick = ($event) => {
            if (_ignoreBodyClick) {
                _ignoreBodyClick = false;
                return;
            }
            _ignoreBodyClick = false;

            const $slotWidth = this.$slotWidth;
            const $slotHeight = this.$slotHeight;

            $scope.isPlusItemShown = true;

            const plusItem2: CalItem = $scope.plusItem;
            const dayId = Math.floor($event.offsetX / $slotWidth);
            plusItem2.date = moment(this.$weekStart).add(dayId, 'd').format(dateFormat);
            const slotNumStart = Math.floor($event.offsetY / $slotHeight);
            const slotNumEnd = slotNumStart + 1;
            plusItem2.timeStart = this.$slotSize * slotNumStart;
            plusItem2.timeEnd = this.$slotSize * slotNumEnd;
            plusItem2.rect = {
                left: dayId * $slotWidth,
                top: slotNumStart * $slotHeight,
                width: $slotWidth + 1,
                height: $slotHeight + 1,
            };
        };

        this._initWeekDays();
    }

    public applyModel() {
        if (this.$gridMode !== CalendarModeEnum.dates) {
            this._convertItems(CalendarModeEnum.dates, this.$gridMode);
        }
        return this.$scope.config.model = this.assemble(this.$items[CalendarModeEnum.dates]);
    }

    public resetModel() {
        this._initItems();
        this._generateGrid();
    }

    public init(calendarWidth: number, canvas) {
        this._canvas = canvas;
        this._initLoadMode(this.$scope.config);
        this._initGridMode();
        this._initItems();
        this._initSlotSize();
        this._initWeekShift();
        this._updateTimes();
        this._updateDays();
        this.onCalendarResize(calendarWidth);
    }

    public onCalendarResize(calendarWidth: number) {
        this.$calendarWidth = calendarWidth;
        this._updateCanvas();
        this._generateGrid();
    }

    /**
     * Need only in Split Restangle
     * @param {CalItem} Item
     */
    protected updateRectFromTime(Item: CalItem) {

        const SlotMins = this.$slotSize; // minutes in Slot
        const SlotHeight = this.$slotHeight;
        const Model = Item.model;
        const height = this.CalendarService.parsePx(Item.rect.height);
        const top = Item.timeStart * SlotHeight / SlotMins;
        const dt = (Item.timeStart - Model.timeStart) * SlotHeight / SlotMins;
        Item.rect.top = top;
        Item.rect.height = -dt + height + (Item.timeEnd - Model.timeEnd) * SlotHeight / SlotMins;
        this.updateItemModel(Item);
        this._updateItemFromRect(Item);
    }

    protected setNewItems(Items: CalItem[]) {
        this.$items[this.$gridMode] = Items;
        this.$scope.items = Items;
        this._updateItemsRect(this.$scope.items);
    }

    /**
     * Check Across blocks and unites or divides it.
     * @param {CalItem} Item
     */
    protected resolveCollisions(Item: CalItem) {
        let Items = this.$items[this.$gridMode];
        let recheckIndex: number;
        Items.forEach((itemAvailability, index) => {
            const modelAvailability = itemAvailability.model;
            /**
             * When we move that element we can across with itself
             */
            if (Item != itemAvailability && Item.date === itemAvailability.date) {
                /** Our restangle has a big attributes or they are equivalent
                 *  Remove the overlapping element
                 * */
                if ((Item.timeStart <= modelAvailability.timeStart && Item.timeEnd >= modelAvailability.timeEnd) ||
                    (Item.timeStart == modelAvailability.timeStart && Item.timeEnd == modelAvailability.timeEnd)) {
                    Items = Items.filter((val, pos) => val !== itemAvailability);
                    this.setNewItems(Items);
                } else
                /** be under with across */
                if (Item.timeStart <= modelAvailability.timeEnd &&
                    Item.timeEnd >= modelAvailability.timeEnd &&
                    Item.timeStart > modelAvailability.timeStart) {

                    if (itemAvailability.clazz === Item.clazz) {
                        itemAvailability.timeEnd = Item.timeEnd;
                        Items = Items.filter((val, pos) => val !== Item);
                    } else {
                        itemAvailability.timeEnd = Item.timeStart;
                    }
                    this.updateRectFromTime(itemAvailability);

                    if (itemAvailability.timeEnd !== Item.timeStart) {
                        recheckIndex = index;
                    }
                    this.setNewItems(Items);
                } else
                /** be over with across */
                if (Item.timeStart <= modelAvailability.timeStart &&
                    Item.timeEnd >= modelAvailability.timeStart &&
                    Item.timeEnd <= modelAvailability.timeEnd) {

                    if (itemAvailability.clazz === Item.clazz) {
                        itemAvailability.timeStart = Item.timeStart;
                        Items = Items.filter((val, pos) => val !== Item);
                    } else {
                        itemAvailability.timeStart = Item.timeEnd;
                    }

                    if (itemAvailability.timeStart !== Item.timeEnd) {
                        recheckIndex = index;
                    }
                    this.updateRectFromTime(itemAvailability);

                    this.setNewItems(Items);
                } else
                /** if Item Inside exist modelAvailability time*/
                if (Item.timeStart >= modelAvailability.timeStart && Item.timeEnd <= modelAvailability.timeEnd) {
                    if (itemAvailability.clazz === Item.clazz) {
                        Items = Items.filter((val, pos) => val !== Item);
                    } else {
                        /** We have a different opposite availability
                         *  Need to split */
                        const newItem: CalItem = {
                            model: itemAvailability.model,
                            date: null,
                            timeStart: Item.timeEnd, // <-- update in this_updateFromRect
                            timeEnd: itemAvailability.timeEnd,
                            clazz: itemAvailability.clazz,
                            rect: itemAvailability.rect
                        };
                        itemAvailability.timeEnd = Item.timeStart;
                        this.updateRectFromTime(itemAvailability);
                        let itemToAdd: CalItem = angular.copy(itemAvailability);
                        Items = Items.filter((val, pos) => val !== itemAvailability);
                        Items.push(itemToAdd);
                        this.updateRectFromTime(Item);
                        this.updateRectFromTime(newItem);
                        itemToAdd = angular.copy(newItem);
                        Items.push(itemToAdd);
                    }
                    this.setNewItems(Items);
                }

            }

        });
        if (recheckIndex) {
            this.resolveCollisions(Items[recheckIndex]);
        }
    }


    private _getRectSlotRange(rect: Rectangle): number[] {
        const $slotHeight = this.$slotHeight;
        const top = this.CalendarService.parsePx(rect.top);
        const height = this.CalendarService.parsePx(rect.height);
        const slotNumStart = Math.floor(top / $slotHeight);
        const slotNumEnd = Math.floor((top + height) / $slotHeight) + 1;
        return [slotNumStart, slotNumEnd];
    }

    private _createAdjustedRect(dayId: number, slotNumStart: number, slotNumEnd: number): Rectangle {
        const $slotWidth = this.$slotWidth;
        const $slotHeight = this.$slotHeight;
        return {
            left: dayId * $slotWidth,
            top: slotNumStart * $slotHeight,
            width: $slotWidth + 1,
            height: (slotNumEnd - slotNumStart) * $slotHeight + 1,
        };
    }

    /**
     * Update Height,Width, Left Top of drawing Restangle CalItem
     * @param {CalItem} item
     * @private
     */
    protected _updateItemFromRect(item: CalItem) {
        const moment = this.moment;

        const rect: Rectangle = item.rect;

        const $slotWidth = this.$slotWidth;

        let dayId = Math.floor((this.CalendarService.parsePx(rect.left) + this.CalendarService.parsePx(rect.width) / 2) / $slotWidth);
        if (dayId < 0) {
            dayId = 0;
        } else if (dayId >= this.$columnCount[this.$gridMode]) {
            dayId = this.$columnCount[this.$gridMode] - 1;
        }

        const $slotHeight = this.$slotHeight;
        const $slotSize = this.$slotSize;
        const itemLenInSlots = Math.floor(this.CalendarService.parsePx(rect.height) / $slotHeight);

        let slotId = Math.floor(this.CalendarService.parsePx(rect.top) / $slotHeight);
        if (slotId < 0) {
            slotId = 0;
        } else if (slotId >= (24 * 60 / $slotSize)) {
            slotId = (24 * 60 / $slotSize) - itemLenInSlots;
        }

        item.date = moment(this.$weekStart).add(dayId, 'd').format(dateFormat);
        item.timeStart = slotId * $slotSize;
        item.timeEnd = item.timeStart + itemLenInSlots * $slotSize;
    }

    private _initItems() {
        this.$items[CalendarModeEnum.dates] = this.parse(this.$scope.config.model);
        this.$items[CalendarModeEnum.everyWeek] = [];
        this.$items[CalendarModeEnum.everyDay] = [];
    }

    private _initLoadMode(config: CalendarConf) {
        if (!(config.startDate && config.endDate)) {
            if (config.defaultGridMode === CalendarModeEnum.dates
                && config.disableGridMode
                && config.loadModel) {
                this.$loadMode = CalendarLoadMode.dynamic;
            } else {
                throw new Error('Invalid calendar configuration');
            }
        } else {
            this.$loadMode = CalendarLoadMode.static;
        }
    }


    private _initGridMode() {
        const $scope = this.$scope;
        const config: CalendarConf = $scope.config;

        const $columnCount: number[] = [7, 7, 1];
        $columnCount[CalendarModeEnum.dates] = 7;
        $columnCount[CalendarModeEnum.everyWeek] = 7;
        $columnCount[CalendarModeEnum.everyDay] = 1;
        this.$columnCount = $columnCount;

        const initialGridMode = config.defaultGridMode || CalendarModeEnum.dates;
        this.$gridModePrev = initialGridMode;
        this.$gridMode = initialGridMode;
        $scope.gridMode = initialGridMode;

        $scope.isEveryDayMode = () => this.$gridMode === CalendarModeEnum.everyDay;

        $scope.setGridMode = (gridMode) => {
            // this.onGridModeChange($scope.config, this.initialModel, gridMode, $scope.gridMode); todo
            this.$gridModePrev = this.$gridMode;
            this.$gridMode = gridMode;
            $scope.gridMode = gridMode;

            this._convertItems(this.$gridMode, this.$gridModePrev);

            this._updateDays();
            this._updateCanvas();
            this._generateGrid();

        };
    }

    private _convertItems($gridMode: CalendarModeEnum, $gridModePrev: CalendarModeEnum) {
        if ($gridMode === CalendarModeEnum.everyDay) {

            if ($gridModePrev !== CalendarModeEnum.everyDay) {
                this.$items[CalendarModeEnum.everyDay] = [];
                this._initWeekDays();
            }

        } else if ($gridMode === CalendarModeEnum.everyWeek) {

            if ($gridModePrev === CalendarModeEnum.dates) {
                this.$items[CalendarModeEnum.everyWeek] = [];
            } else if ($gridModePrev === CalendarModeEnum.everyDay) {
                this._convertEveryDayToEveryWeek();
            }

        } else /*if ($gridMode === CalendarModeEnum.dates)*/ {

            if ($gridModePrev === CalendarModeEnum.everyWeek) {
                this._convertEveryWeekToDates();
            } else if ($gridModePrev === CalendarModeEnum.everyDay) {
                this._convertEveryDayToDates();
            }

        }
    }

    private _convertEveryDayToEveryWeek() {
        const moment = this.moment;
        const $items: CalItem[][] = this.$items;

        const days: Moment[] = this.$scope.weekDays.map((dayId) => moment(this.$weekStart).day(dayId));

        $items[CalendarModeEnum.everyWeek] = $items[CalendarModeEnum.everyDay].reduce((everyWeekItems: CalItem[], item: CalItem) => {
            const newItems: CalItem[] = days.map((day: Moment) => {
                const newItem: CalItem = angular.copy(item);
                newItem.date = day.format(dateFormat);
                return newItem;
            });
            return everyWeekItems.concat(newItems);
        }, []);

    }

    private _convertEveryWeekToDates() {
        const moment = this.moment;
        const CalendarService: CalendarService = this.CalendarService;
        const config: CalendarConf = this.$scope.config;
        const $items: CalItem[][] = this.$items;

        const start: Moment = moment(config.startDate, dateFormat);
        const end: Moment = moment(config.endDate, dateFormat);

        $items[CalendarModeEnum.dates] = $items[CalendarModeEnum.everyWeek].reduce((datesItems: CalItem[], item: CalItem) => {
            const dayOfWeek = moment(item.date, dateFormat).day();

            CalendarService.iterateMomentRange(start, end, (date: Moment): boolean => {
                if (date.day() === dayOfWeek) {
                    const newItem: CalItem = angular.copy(item);
                    newItem.date = date.format(dateFormat);
                    datesItems.push(newItem);
                }
                return true; // continue
            });
            return datesItems;
        }, []);
    }

    private _convertEveryDayToDates() {
        const moment = this.moment;
        const CalendarService: CalendarService = this.CalendarService;
        const config: CalendarConf = this.$scope.config;
        const $items: CalItem[][] = this.$items;
        const _ = this._;
        const $scope = this.$scope;

        const start: Moment = moment(config.startDate, dateFormat);
        const end: Moment = moment(config.endDate, dateFormat);

        $items[CalendarModeEnum.dates] = $items[CalendarModeEnum.everyDay].reduce((datesItems: CalItem[], item: CalItem) => {
            const weekDays = $scope.weekDays;
            CalendarService.iterateMomentRange(start, end, (date: Moment): boolean => {
                const theWeekDay = date.day();
                if (_.findIndex(weekDays, (weekDay) => weekDay === theWeekDay) >= 0) {
                    const newItem: CalItem = angular.copy(item);
                    newItem.date = date.format(dateFormat);
                    datesItems.push(newItem);
                }
                return true; // continue
            });
            return datesItems;
        }, []);
    }

    private _initSlotSize() {
        const $scope = this.$scope;

        this.$slotSize = this._adjustSlotSize(this.$items[this.$gridMode], SlotSize.slot30min);
        $scope.slotSize = this.$slotSize;

        $scope.setSlotSize = (slotSize: number) => {
            this.$slotSize = this._adjustSlotSize(this.$items[this.$gridMode], slotSize);

            if (this.$slotSize !== slotSize) {
                this.toastr.warning('Chosen slot size does not fit model', 'Error');
            }

            $scope.slotSize = this.$slotSize;

            this._updateTimes();
            this._updateCanvas();
            this._generateGrid();
        };
    }

    private _adjustSlotSize(items: CalItem[], slotSize: number): number {
        if (this._ifModelFitSlot(items, slotSize)) {
            return slotSize;
        } else {
            const slotSizeId = this._.findIndex(SlotSize_Ns.$all, (size) => slotSize == size);
            if (slotSizeId > 0) {
                return this._adjustSlotSize(items, SlotSize_Ns.$all[slotSizeId - 1]);
            } else {
                return SlotSize_Ns.$all[0];
            }
        }
    }

    private _ifModelFitSlot(items: CalItem[], slotSize: number): boolean {
        return items.every((item: CalItem) => {
            return item.timeStart % slotSize == 0
                && item.timeEnd % slotSize === 0;
        });
    }


    private _initWeekShift() {
        const moment = this.moment;
        const $scope = this.$scope;
        const config: CalendarConf = $scope.config;

        const currentDate = new Date();
        const today: Moment = moment(currentDate).startOf('day');
        this.$today = today;
        const theWeekStart = moment(today).day(0);

        if (config.startDate) {
            const start: Moment = moment(config.startDate, dateFormat);
            $scope.startDate = start.toDate();
            this.$minWeekShift = moment(start).day(0).diff(theWeekStart, 'w');
        }

        if (config.endDate) {
            const end: Moment = moment(config.endDate, dateFormat);
            $scope.endDate = end.toDate();
            this.$maxWeekShift = moment(end).day(0).diff(theWeekStart, 'w');
        }

        this.$weekShift = this.$minWeekShift || 0;
        this._updateWeekRange();
        $scope.currentDate = this._restrictCurrentDate(today);

        $scope.isWeekButtonsShow = () => this.$gridMode === CalendarModeEnum.dates;

        $scope.isPreviousWeekDisabled = () => {
            return this.$minWeekShift !== null
                && this.$minWeekShift !== undefined
                && this.$weekShift <= this.$minWeekShift;
        };
        $scope.goPreviousWeek = () => {
            if ($scope.isPreviousWeekDisabled()) {
                return;
            }
            this.$weekShift -= 1;
            this._updateWeekRange();
            $scope.currentDate = this._restrictCurrentDate(this.$weekStart);
            this._updateDays();
            this._generateGrid();
        };

        $scope.isNextWeekDisabled = () => {
            return this.$maxWeekShift !== null
                && this.$maxWeekShift !== undefined
                && this.$weekShift >= this.$maxWeekShift;
        };
        $scope.goNextWeek = () => {
            if ($scope.isNextWeekDisabled()) {
                return;
            }
            this.$weekShift += 1;
            this._updateWeekRange();
            $scope.currentDate = this._restrictCurrentDate(this.$weekStart);
            this._updateDays();
            this._generateGrid();
        };

        $scope.goToDate = (currentDate) => {
            const newWeekShift = moment(currentDate).day(0).diff(theWeekStart, 'w');
            if (this.$weekShift !== newWeekShift) {
                this.$weekShift = newWeekShift;
                this._updateWeekRange();
                this._updateDays();
                this._generateGrid();
                $scope.currentDate = this._restrictCurrentDate(moment(currentDate));
            }
        };
        $scope.isGoToDateShown = () => this.$gridMode === CalendarModeEnum.dates;

    }

    private _restrictCurrentDate(day: Moment): Date {
        if (this.$scope.startDate && day.isBefore(this.$scope.startDate, 'ms')) {
            return this.$scope.startDate;
        } else if (this.$scope.endDate && day.isSameOrAfter(this.$scope.endDate, 'ms')) {
            return this.$scope.endDate;
        } else {
            return day.toDate();
        }
    }

    private _initWeekDays() {
        const $scope = this.$scope;
        const moment = this.moment;
        const CalendarService: CalendarService = this.CalendarService;
        const config: CalendarConf = this.$scope.config;

        const start: Moment = moment(config.startDate, dateFormat);
        const end: Moment = moment(config.endDate, dateFormat);

        const enabledWeekDays = [];
        CalendarService.iterateMomentRange(start, end, (date: Moment): boolean => {
            const theWeekDay = date.day();
            if (!enabledWeekDays.some((weekDay) => weekDay === theWeekDay)) {
                enabledWeekDays.push(theWeekDay);
            }
            return enabledWeekDays.length < 7; // continue
        });

        $scope.weekDays = enabledWeekDays;
        $scope.disabledWeekDays = [0, 1, 2, 3, 4, 5, 6]
            .filter((day) => !enabledWeekDays.some((disabledDay) => disabledDay === day));
    }


    private _updateWeekRange() {
        const moment = this.moment;

        const $weekStart = moment(this.$today).add(this.$weekShift, 'w').day(0);
        this.$weekStart = $weekStart;
        this.$weekEnd = moment($weekStart).add(1, 'w');
    }


    private _updateTimes() {
        this.$scope.times = this._generateTimes(this.$slotSize);
    }

    private _generateTimes(slotSize): string[] {
        const moment = this.moment;

        const length = 86400000; // (24 * 60 * 60 * 1000); milliseconds in one day
        const timeTitles = [];
        const theDay: Moment = moment('00:00', timeFormat);
        let time: Moment;
        for (time = moment('00:00', timeFormat); time.diff(theDay) < length; time.add(slotSize, 'm')) {
            timeTitles.push(time.format(timeFormat));
        }
        return timeTitles;
    }

    private _updateDays() {
        const moment = this.moment;
        const $scope = this.$scope;

        if (this.$gridMode === CalendarModeEnum.everyDay) {
            this.$days = [moment($scope.config.startDate, dateFormat)];
            $scope.days = ['Every Day'];
        } else {
            const days = [];
            for (let i = 0; i < 7; ++i) {
                days.push(moment(this.$weekStart).day(i));
            }
            this.$days = days;

            if (this.$gridMode === CalendarModeEnum.everyWeek) {
                $scope.days = this.$days.map((day: Moment) => day.format('ddd'));
            } else if (this.$gridMode === CalendarModeEnum.dates) {
                $scope.days = this.$days.map((day: Moment) => day.format('MMM D'));
            }
        }
    }

    private _updateCanvas() {
        // grid width and height

        const columnCount = this.$columnCount[this.$gridMode];
        const slotWidth = this.$calendarWidth / columnCount;
        this.$slotWidth = slotWidth;

        const slotHeight = this.$slotHeight;
        this.$calendarHeight = slotHeight * (24 * 60 / this.$slotSize);


        this.$scope.slotHeight = slotHeight;


        const canvas = this._canvas;
        const context = canvas.get(0).getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        // size of canvas
        canvas.attr({width: this.$calendarWidth, height: this.$calendarHeight});
        // draw grid
        const maxX = slotWidth * columnCount;
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

    private _generateGrid() {
        const $scope = this.$scope;
        const moment = this.moment;
        const config: CalendarConf = this.$scope.config;

        if (this.$loadMode === CalendarLoadMode.dynamic) {
            config.loadModel(this.$weekStart, this.$weekEnd)
                .then((model: any[]) => {
                    $scope.items = this.$items[this.$gridMode] = this.parse(model);
                    this._updateItemsRect($scope.items);
                    this._updateItemsRect([$scope.plusItem]);
                });
        } else {
            if (this.$gridMode === CalendarModeEnum.dates) {
                $scope.items = this.$items[this.$gridMode].filter((item: CalItem) => {
                    const date: Moment = moment(item.date, dateFormat);
                    return date.isBefore(this.$weekEnd, 'ms') && date.isSameOrAfter(this.$weekStart, 'ms');
                });
            } else {
                $scope.items = this.$items[this.$gridMode];
            }
            this._updateItemsRect($scope.items);
            this._updateItemsRect([$scope.plusItem]);
        }

    }


    protected _updateItemsRect(items: CalItem[]) {
        const columns = items.reduce((columns, item: CalItem) => {
            let column: CalItem[] = columns[item.date];
            if (!column) {
                column = [];
                columns[item.date] = column;
            }
            column.push(item);
            return columns;
        }, {});
        this._.forOwn(columns, (column: CalItem[], date: string) => {
            this._updateDayItemsRect(column);
        });


    }

    private _updateDayItemsRect(items: CalItem[]) {
        const _ = this._;
        const moment = this.moment;
        const $slotWidth = this.$slotWidth;
        const $slotHeight = this.$slotHeight;
        const $weekStart = this.$weekStart;
        const $slotSize = this.$slotSize;

        const subColumns: CalItem[] = [];
        const mapItemIdToSubColumnId = {};
        items
            .sort((a: CalItem, b: CalItem) => a.timeStart - b.timeStart)
            .forEach((item: CalItem, itenId) => {
                const itemTimeStart = item.timeStart;
                const freeId = _.findIndex(subColumns, (subColumn: CalItem) => subColumn === null || subColumn.timeEnd <= itemTimeStart);
                if (freeId < 0) {
                    subColumns.push(item);
                    mapItemIdToSubColumnId[itenId] = subColumns.length - 1;
                } else {
                    subColumns[freeId] = item;
                    mapItemIdToSubColumnId[itenId] = freeId;
                }
            });

        const $slotSubWidth = $slotWidth / subColumns.length;
        items.forEach((item: CalItem, itemId) => {
            const subColumnId = mapItemIdToSubColumnId[itemId];
            const subColunmOffset = subColumnId * $slotSubWidth;

            const theDay: Moment = moment(item.date, dateFormat);
            const weekDayNumber = theDay.diff($weekStart, 'd');

            const startPos = Math.floor(item.timeStart / $slotSize);
            const endPos = Math.ceil(item.timeEnd / $slotSize);
            item.rect = {
                width: $slotSubWidth + 1,
                height: (endPos - startPos) * $slotHeight + 1,
                top: startPos * $slotHeight,
                left: weekDayNumber * $slotWidth + subColunmOffset
            };
        });
    }


}
