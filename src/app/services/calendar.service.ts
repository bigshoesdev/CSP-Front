import {timeFormat} from './app.constant';
import {Moment} from '../../../bower_components/moment/moment.d';
import {BaseCalItem} from '../model/BaseCalItem';
import {SlotSize_Ns} from '../model/SlotSize';
import {IRowCalColumn, IRowCalItem} from '../directives/calendarRow/calendarRow.controller';
import {Collection} from '../model/Collection';


export class CalendarService {

    /** @ngInject */
    constructor(private _, private moment) {

    }

    adjustSlotSize(items: BaseCalItem[], slotSize: number): number {
        if (this._ifModelFitSlot(items, slotSize)) {
            return slotSize;
        } else {
            const slotSizeId = this._.findIndex(SlotSize_Ns.$all, (size) => slotSize == size);
            if (slotSizeId > 0) {
                return this.adjustSlotSize(items, SlotSize_Ns.$all[slotSizeId - 1]);
            } else {
                return SlotSize_Ns.$all[0];
            }
        }
    }

    private _ifModelFitSlot(items: BaseCalItem[], slotSize: number): boolean {
        return items.every((item: BaseCalItem) => {
            return ((item.timeStart % slotSize) == 0);
        });
    }

    /**
     * @param time {string} - in format 'HH:mm'
     * @returns {number} - minutes since midnight
     */
    time2dayMinutes(time: string): number {
        const m = this.moment(time, timeFormat);
        const midnight = this.moment(m).startOf('day');
        return m.diff(midnight, 'm');
    }

    /**
     * @param minutes - since midnight
     * @param format
     * @returns {string} - time in format 'HH:mm'
     */
    dayMinutes2time(minutes: number, format: string = timeFormat): string {
        return this.moment()
            .startOf('day')
            .add(minutes, 'm')
            .format(format);
    }

    iterateMomentRange(startMoment: Moment,
                       endMoment: Moment,
                       isContinue: (theMoment: Moment) => boolean,
                       stepSign: string = 'd') {
        let moment;
        for (moment = startMoment.clone();
             moment.isSameOrBefore(endMoment) && isContinue(moment.clone());
             moment.add(1, stepSign)) {
        }
    }

    updateRowCalItemsRect(items: IRowCalItem[],
                          columns: IRowCalColumn[],
                          slotWidth: number,
                          slotHeight: number,
                          slotSize: number,
                          workingDayStartPos: number,
                          workingDayStartMin: number): void {

        // zone contain Column of items to draw when items overlap
        const zones: IRowCalItem[][][] = this.calculateZonesOfOverlap(items) as IRowCalItem[][][];

        zones.forEach((zone: IRowCalItem[][]) => {
            const subColumnWidth = slotWidth / zone.length;
            zone.forEach((column: IRowCalItem[], subColumnId) => {
                const subColumnOffset = subColumnId * subColumnWidth;
                column.forEach((item: IRowCalItem) => {
                    const startPos = Math.floor((item.timeStart - workingDayStartMin) / slotSize) + workingDayStartPos;
                    const endPos = Math.ceil((item.timeEnd - workingDayStartMin) / slotSize) + workingDayStartPos;
                    const columnId = this.findColumnIndex(item.column, columns);
                    item.rect = {
                        width: subColumnWidth + 1,
                        height: (endPos - startPos) * slotHeight + 1,
                        top: startPos * slotHeight,
                        left: columnId * slotWidth + subColumnOffset,
                    };
                });
            });
        });

    }

    cutRanges(startPos: number, endPos: number, rangeStartPos: number, rangeEndPos: number): { startPos: number, endPos: number } {
        if (endPos <= rangeStartPos || startPos >= rangeEndPos) {
            return {startPos: null, endPos: null};
        }
        if (startPos < rangeStartPos && endPos > rangeStartPos) {
            startPos = rangeStartPos;
        }
        if (endPos > rangeEndPos && startPos < rangeEndPos) {
            endPos = rangeEndPos;
        }
        return {startPos: startPos, endPos: endPos};
    }

    groupItemsByWorkingDayRange(items: IRowCalItem[], workingDayStartMin: number, workingDayEndMin: number): IRowCalItem[][] {
        return items.reduce((res: IRowCalItem[][], item: IRowCalItem): IRowCalItem[][] => {
            if (item.timeStart < workingDayStartMin) {
                if (item.timeEnd > workingDayStartMin) {
                    item.timeStart = workingDayStartMin;
                    res[1].push(item); // cut time and push to table if it's possible to show as part
                } else {
                    res[0].push(item); // before
                }
            } else if (item.timeEnd > workingDayEndMin) {
                if (item.timeStart < workingDayEndMin) {
                    item.timeEnd = workingDayEndMin;
                    res[1].push(item);
                } else {
                    res[2].push(item); // after
                }
            } else {
                res[1].push(item); // inside
            }
            return res;
        }, [[], [], []]);
    }

    groupItemsByColumnKey(items: IRowCalItem[]): Collection<IRowCalItem[]> {
        return items.reduce((columnKey2items: Collection<IRowCalItem[]>, itemInside: IRowCalItem): Collection<IRowCalItem[]> => {
            if (itemInside.column) {
                let columnItems: IRowCalItem[] = columnKey2items[itemInside.column.columnKey];
                if (!columnItems) {
                    columnItems = columnKey2items[itemInside.column.columnKey] = [];
                }
                columnItems.push(itemInside);
            }
            return columnKey2items;
        }, {});
    }

    findColumnIndex(itemColumn: IRowCalColumn, columns: IRowCalColumn[]): number {
        const columnKey = itemColumn.columnKey;
        return this._.findIndex(columns, (column: IRowCalColumn) => column.columnKey === columnKey);
    }

    calculateZonesOfOverlap(items: BaseCalItem[]): BaseCalItem[][][] {
        return items.reduce((zones: BaseCalItem[][][], item: BaseCalItem) => {

            if (zones.length === 0) {
                const newZone: BaseCalItem[][] = [];
                const newColumn: BaseCalItem[] = [];
                newColumn.push(item);
                newZone.push(newColumn);
                zones.push(newZone);
            } else {
                const lastZone = zones[zones.length - 1];
                const overlapNum = this._countOverlap(lastZone, item);

                if (overlapNum === 0) {
                    const newZone: BaseCalItem[][] = [];
                    const newColumn: BaseCalItem[] = [];
                    newColumn.push(item);
                    newZone.push(newColumn);
                    zones.push(newZone);
                } else if (overlapNum === lastZone.length) {
                    const newColumn: BaseCalItem[] = [];
                    newColumn.push(item);
                    lastZone.push(newColumn);
                } else {
                    const notOverlappedColumn: BaseCalItem[] = this._.find(lastZone, (column: BaseCalItem[]) => !this._ifColumnOverlapped(column, item));
                    notOverlappedColumn.push(item);
                }
            }

            return zones;
        }, []);
    }

    private _countOverlap(zone: BaseCalItem[][], item: BaseCalItem): number {
        return zone.reduce((count: number, column: BaseCalItem[]): number => {
            if (this._ifColumnOverlapped(column, item)) {
                ++count;
            }
            return count;
        }, 0);
    }

    private _ifColumnOverlapped(column: BaseCalItem[], item: BaseCalItem) {
        const lastItemInColumn: BaseCalItem = column[column.length - 1];
        return lastItemInColumn.timeEnd > item.timeStart;
    }

    parsePx(str) {
        return (typeof str === 'string') ? (+(str.split('px')[0])) : str;
    }

}
