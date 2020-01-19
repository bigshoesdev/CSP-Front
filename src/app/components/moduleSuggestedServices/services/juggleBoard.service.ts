import {JtCell, JtRow, JtSubHeader, JtTable} from '../directives/jbTable/jbTable.directive';
import {workingDayEnd, workingDayStart} from '../../../services/app.constant';
import {PreliminaryEvent} from '../../../model/rest/PreliminaryEvent';
import {ConcreteCalendarEvent} from '../../../model/rest/ConcreteCalendarEvent';
import {RoomBookedTime} from '../../../model/rest/RoomBookedTime';
import {Service} from '../../../model/rest/Service';
import {CompositeTime} from '../../../model/rest/CompositeTime';
import {AvailabilityTherapistDayRecord} from '../../../model/rest/AvailabilityTherapistDayRecord';
import {AvailabilityTimeRecord} from '../../../model/rest/AvailabilityTimeRecord';
import {AvailabilityType_Ns} from '../../../model/rest/AvailabilityType';
import {SessionSsClientData} from '../../../model/rest/SessionSsClientData';
import {EntityDependencyService} from '../../../services/entity-dependency.service';
import {Entity} from '../../../model/Entity';
import AvailabilityType = AvailabilityType_Ns.AvailabilityType;
import {CalendarService} from '../../../services/calendar.service';

export interface ITablePosition {
    rowId: number;
    columnId: number;
}

declare let angular: any;


export class JuggleBoardService {

    private workingMinutes: number;

    /** @ngInject */
    constructor(private _,
                private CalendarService: CalendarService,
                private EntityDependencyService: EntityDependencyService) {
        this.workingMinutes =
            CalendarService.time2dayMinutes(workingDayEnd) -
            CalendarService.time2dayMinutes(workingDayStart);
    }

    findJtTablePosition(table: JtTable, item: PreliminaryEvent): ITablePosition {
        let columnId = -1;

        const rowId = this._.findIndex(table.rows, (row: JtRow) => {
            columnId = this._.findIndex(row.cells, (cell: JtCell) => {
                return this.EntityDependencyService.findClientServiceDataItem(cell.listItems, item);
            });
            return columnId >= 0;
        });

        return {
            rowId: rowId,
            columnId: columnId
        };

    }


    /**
     * @param concreteCalendarEvents
     * @param therapist2DayRecordsMap
     * @param bookedTimes
     * @param preliminaryEvents
     * @param services
     * @param therapistId - if therapistId === -1, all therapists
     * @param roomId - if roomId === -1, all rooms
     * @param date
     * @returns {{freeTime: number, busyTime: number, preFreeTime: number, preEventsDuration: number}}
     */
    calculateSubHeader(concreteCalendarEvents: ConcreteCalendarEvent[],
                       therapist2DayRecordsMap: any, /* therapistId -> AvailabilityTherapistDayRecord[] */
                       bookedTimes: RoomBookedTime[],
                       preliminaryEvents: PreliminaryEvent[], services: Service[],
                       therapistId: number, roomId: number, date: string): JtSubHeader {

        let busyTime;
        // = _collectConcreteCalendarEventsDuration(
        //     concreteCalendarEvents.filter((ccEvent: ConcreteCalendarEvent) => {
        //         return (roomId < 0 || ccEvent.room.id === roomId)
        //             && (therapistId < 0 || ccEvent.therapist.id === therapistId)
        //             && ccEvent.date === date;
        //     })
        // );

        const preEventsDuration = preliminaryEvents.reduce((time: number, preliminaryEvent: PreliminaryEvent): number => {
            const service: Service = preliminaryEvent.service;
            if (service) {
                const duration: CompositeTime = service.time;
                return time + duration.prep + duration.processing + duration.clean;
            } else {
                return time;
            }
        }, 0);

        let freeTime = -1;

        if (therapistId >= 0) {

            const therapistAvailableTime = (therapist2DayRecordsMap[therapistId] || [])
                .filter((dayRecord: AvailabilityTherapistDayRecord) => dayRecord.date === date)
                .reduce((time1, dayRecord: AvailabilityTherapistDayRecord) => {
                    return dayRecord.timeItems
                        .filter((timeItem: AvailabilityTimeRecord) => timeItem.type === AvailabilityType.available)
                        .reduce((time2, timeItem: AvailabilityTimeRecord) => time2 + timeItem.timeEnd - timeItem.timeStart, time1);
                }, 0);

            busyTime = this._collectConcreteCalendarEventsDuration(
                concreteCalendarEvents.filter((ccEvent: ConcreteCalendarEvent) => {
                    const ccEventTherapistId = ccEvent.therapist && ccEvent.therapist.id;
                    return ccEventTherapistId === therapistId
                        && ccEvent.date === date;
                })
            );

            freeTime = therapistAvailableTime - busyTime;

        } else if (roomId >= 0) {
            const roomBookedTime = bookedTimes
                .filter((bookedTime: RoomBookedTime) => bookedTime.roomId === roomId && bookedTime.date === date)
                .reduce((time, bookedTime: RoomBookedTime) => time + bookedTime.booked, 0);

            // concreteEventsDuration = _collectConcreteCalendarEventsDuration(
            //     concreteCalendarEvents.filter((ccEvent: ConcreteCalendarEvent) => {
            //         return ccEvent.room.id === roomId
            //             && ccEvent.date === date;
            //     })
            // );
            busyTime = roomBookedTime;

            freeTime = this.workingMinutes - roomBookedTime;
        }

        return {
            freeTime: freeTime,
            busyTime: busyTime,
            preEventsDuration: preEventsDuration,
            preFreeTime: freeTime - preEventsDuration
        };
    }

    _collectConcreteCalendarEventsDuration(concreteCalendarEvents: ConcreteCalendarEvent[]) {
        return concreteCalendarEvents.reduce((time: number, concreteCalendarEvent: ConcreteCalendarEvent): number => {
            const duration: CompositeTime = concreteCalendarEvent.duration;
            return time + duration.prep + duration.processing + duration.clean;
        }, 0);
    }

    findClientIdByDataItem(clientDataArr: SessionSsClientData[], item: PreliminaryEvent): number {
        const found: SessionSsClientData = this._.find(clientDataArr, item);
        return found && found.client.id || -1;
    }

    findAndUpdateDataItem(item: PreliminaryEvent, clientDataArr: SessionSsClientData[]) {
        clientDataArr.some((clientData: SessionSsClientData) => {
            const originalItem: PreliminaryEvent = this.EntityDependencyService.findClientServiceDataItem(clientData.services, item);
            angular.copy(item, originalItem);
            return !!originalItem;
        });
    }

    getClientNameById(entityId: number, entities: Entity[]): string {
        const entity: Entity = this._.find(entities, (c: Entity) => c.id === entityId);
        return entity && entity.name || ('' + entityId);
    }
}
