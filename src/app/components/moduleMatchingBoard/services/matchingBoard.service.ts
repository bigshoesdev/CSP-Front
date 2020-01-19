import {IRowCalColumn, IRowCalItem} from '../../../directives/calendarRow/calendarRow.controller';
import {workingDayEnd, workingDayStart} from '../../../services/app.constant';
import {AvailabilityTherapistDayRecord} from '../../../model/rest/AvailabilityTherapistDayRecord';
import {AvailabilityTimeRecord} from '../../../model/rest/AvailabilityTimeRecord';
import {AvailabilityType_Ns} from '../../../model/rest/AvailabilityType';
import {CompositeTime} from '../../../model/rest/CompositeTime';
import {BaseCrossEvent} from '../../../model/rest/BaseCrossEvent';
import {CalendarService} from '../../../services/calendar.service';
import {Collection} from '../../../model/Collection';
import {Entity} from '../../../model/Entity';
import {ConcreteEvent} from '../../../model/rest/ConcreteEvent';
import {Therapist} from '../../../model/rest/Therapist';
import {Room} from '../../../model/rest/Room';
import {ClientMatchingConfirmation} from '../../../model/rest/ClientMatchingConfirmation';
import {PreliminaryEvent} from '../../../model/rest/PreliminaryEvent';
import {ClientServiceMatchingData} from '../../../model/rest/ClientServiceMatchingData';
import AvailabilityType = AvailabilityType_Ns.AvailabilityType;


export class MatchingBoardService {

    private workingDayStartMin: number;
    private workingDayEndMin: number;

    /** @ngInject */
    constructor(private CalendarService: CalendarService) {
        this.workingDayStartMin = CalendarService.time2dayMinutes(workingDayStart);
        this.workingDayEndMin = CalendarService.time2dayMinutes(workingDayEnd);
    }

    createUnavailabilityItemsForTherapist(dayRecords: AvailabilityTherapistDayRecord[]): IRowCalItem[] {
        return dayRecords.reduce((bgItems: IRowCalItem[], dayRecord: AvailabilityTherapistDayRecord): IRowCalItem[] => {
            const dayBgItems: IRowCalItem[] = dayRecord.timeItems
            // .filter((timeItem: AvailabilityTimeRecord) => {
            //     return timeItem.type === AvailabilityType.unavailable
            //         && timeItem.timeStart >= this.workingDayStartMin
            //         && timeItem.timeEnd <= this.workingDayEndMin;
            // })
                .map((timeItem: AvailabilityTimeRecord): IRowCalItem => {
                    return {
                        column: null,
                        timeStart: timeItem.timeStart,
                        timeEnd: timeItem.timeEnd,
                        model: timeItem,
                        clazz: (timeItem.type === AvailabilityType.unavailable) ? 'unavailable' : 'available',
                    };
                });
            return bgItems.concat(dayBgItems);
        }, []);
    }

    createRowCalItems(events: BaseCrossEvent[], clazz: string): IRowCalItem[] {
        return events.map((event: BaseCrossEvent): IRowCalItem => {
            const timeStart = this.CalendarService.time2dayMinutes(event.time);
            const duration: CompositeTime = event.duration;
            const durationMin: number = duration.prep + duration.processing + duration.clean;
            return {
                column: null,
                timeStart: timeStart,
                timeEnd: timeStart + durationMin,
                model: event,
                clazz: clazz,
            };
        });
    }

    setColumnsToItems(items: IRowCalItem[], columnKey2Column: Collection<IRowCalColumn>, getColumnKey: (i: IRowCalItem) => any): IRowCalItem[] {
        items.forEach((item: IRowCalItem) => {
            if (item.model) {
                item.column = columnKey2Column[getColumnKey(item)];
            }
        });
        return items;
    }

    collectColumns(columns: IRowCalColumn[], columnKey2Column: Collection<IRowCalColumn> = {}): Collection<IRowCalColumn> {
        return columns.reduce((map: any, column: IRowCalColumn) => {
            map[column.columnKey] = column;
            return map;
        }, columnKey2Column);
    }

    getTherapistIdAsColumnKey(i: IRowCalItem) {
        const model: BaseCrossEvent = i.model;
        return model.therapist && model.therapist.id;
    }

    getRoomIdAsColumnKey(i: IRowCalItem) {
        const model: BaseCrossEvent = i.model;
        return model.room && model.room.id;
    }

    entityToColumnMapper(e: Entity): IRowCalColumn {
        return {
            columnKey: e.id,
            columnTitle: e.name,
            columnMeta: e,
        };
    }

    getConfirmationEventsOfOtherClients(matchingDataArr: ClientServiceMatchingData[], exceptClientId: number): PreliminaryEvent[] {
        return matchingDataArr
            .filter((matchingData: ClientServiceMatchingData) => matchingData.clientId !== exceptClientId)
            .reduce((res: PreliminaryEvent[], matchingData: ClientServiceMatchingData): PreliminaryEvent[] => {
                const confirmationData: ClientMatchingConfirmation = matchingData.confirmationData;
                if (confirmationData && confirmationData.items) {
                    return res.concat(confirmationData.items);
                } else {
                    return res;
                }
            }, []);
    }

    createDateBgItemsForRoom(dataItems: BaseCrossEvent[],
                             bgItemClass: string,
                             roomId: number,
                             date: string,
                             tableTherapists: Therapist[],
                             columnKey2Column: Collection<IRowCalColumn>): IRowCalItem[] {
        const itemsForRoom: BaseCrossEvent[] = <ConcreteEvent[]>this.filterDateItemsForRoom(dataItems, roomId, date, tableTherapists);
        const bgItems: IRowCalItem[] = this.createRowCalItems(itemsForRoom, bgItemClass);
        return this.setColumnsToItems(bgItems, columnKey2Column, (i: IRowCalItem) => this.getTherapistIdAsColumnKey(i));
    }

    createDateBgItemsForTherapist(dataItems: BaseCrossEvent[],
                                  bgItemClass: string,
                                  therapistId: number,
                                  date: string,
                                  tableRooms: Room[],
                                  columnKey2Column: Collection<IRowCalColumn>): IRowCalItem[] {
        const itemsForRoom: ConcreteEvent[] = <ConcreteEvent[]>this.filterDateItemsForTherapist(dataItems, therapistId, date, tableRooms);
        const bgItems: IRowCalItem[] = this.createRowCalItems(itemsForRoom, bgItemClass);
        return this.setColumnsToItems(bgItems, columnKey2Column, (i: IRowCalItem) => this.getRoomIdAsColumnKey(i));
    }

    filterDateItemsForRoom(dataItems: BaseCrossEvent[], roomId, date: string, therapists: Therapist[]): BaseCrossEvent[] {
        return dataItems
            .filter((dataItem: BaseCrossEvent) => {
                const dataItemTherapistId = dataItem.therapist && dataItem.therapist.id;
                const dataItemRoomId = dataItem.room && dataItem.room.id;
                return dataItemRoomId === roomId
                    && dataItem.date === date
                    && therapists.some((t: Therapist) => t.id === dataItemTherapistId);
            });
    }


    filterDateItemsForTherapist(dataItems: BaseCrossEvent[], therapistId, date: string, rooms: Room[]): BaseCrossEvent[] {
        return dataItems
            .filter((dataItem: BaseCrossEvent) => {
                const dataItemTherapistId = dataItem.therapist && dataItem.therapist.id;
                const dataItemRoomId = dataItem.room && dataItem.room.id;
                return dataItemTherapistId === therapistId
                    && dataItem.date === date
                    && rooms.some((r: Room) => r.id === dataItemRoomId);
            });
    }

    createDatesBgItemsForRoom(dataItems: BaseCrossEvent[],
                              bgItemClass: string,
                              roomId: number,
                              columns: IRowCalColumn[],
                              columnKey2Column: Collection<IRowCalColumn>): IRowCalItem[] {
        const itemsForRoom: BaseCrossEvent[] = <ConcreteEvent[]>this.filterDatesItemsForRoom(dataItems, roomId, columns);
        const bgItems: IRowCalItem[] = this.createRowCalItems(itemsForRoom, bgItemClass);
        return this.setColumnsToItems(bgItems, columnKey2Column, (i: IRowCalItem) => this.getDateAsColumnKey(i));
    }

    createDatesBgItemsForTherapist(dataItems: BaseCrossEvent[],
                                   bgItemClass: string,
                                   therapistId: number,
                                   columns: IRowCalColumn[],
                                   columnKey2Column: Collection<IRowCalColumn>): IRowCalItem[] {
        const itemsForRoom: ConcreteEvent[] = <ConcreteEvent[]>this.filterDatesItemsForTherapist(dataItems, therapistId, columns);
        const bgItems: IRowCalItem[] = this.createRowCalItems(itemsForRoom, bgItemClass);
        return this.setColumnsToItems(bgItems, columnKey2Column, (i: IRowCalItem) => this.getDateAsColumnKey(i));
    }


    filterDatesItemsForRoom(dataItems: BaseCrossEvent[], roomId, columns: IRowCalColumn[]): BaseCrossEvent[] {
        return dataItems
            .filter((dataItem: BaseCrossEvent) => {
                const date = dataItem.date;
                const dataItemRoomId = (dataItem.room && dataItem.room.id);
                return dataItemRoomId === roomId
                    && columns.some(c => c.columnKey === date);
            });
    }

    filterDatesItemsForTherapist(dataItems: BaseCrossEvent[], therapistId, columns: IRowCalColumn[]): BaseCrossEvent[] {
        return dataItems
            .filter((dataItem: BaseCrossEvent) => {
                const date = dataItem.date;
                const dataItemTherapistId = (dataItem.therapist && dataItem.therapist.id);
                return dataItemTherapistId === therapistId
                    && columns.some(c => c.columnKey === date);
            });
    }

    private getDateAsColumnKey(i: IRowCalItem) {
        const model: BaseCrossEvent = i.model;
        return model.date;
    }

}
