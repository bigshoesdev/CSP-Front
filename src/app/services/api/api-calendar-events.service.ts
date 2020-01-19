import {ApiBaseService} from './api-base.service';
import {ConcreteCalendarEvent} from '../../model/rest/ConcreteCalendarEvent';
import {Id} from '../../model/rest/Id';
import {CalendarEvent} from '../../model/rest/CalendarEvent';
import {CrossingData} from '../../model/rest/CrossingData';

export class ApiCalendarEventsService extends ApiBaseService {
    /** @ngInject */
    constructor(Restangular) {
        super(Restangular);
    }

    getConcreteForAllCalendarEvents(dateStart: string, dateEnd: string): Promise<ConcreteCalendarEvent[]> {
        return this.Restangular
            .one('calendarEvents/concrete')
            .get({
                dateStart: dateStart,
                dateEnd: dateEnd
            })
            .then(this.getPlain);
    }

    getMineConcreteCalendarEvents(dateStart: string, dateEnd: string): Promise<ConcreteCalendarEvent[]> {
        return this.Restangular
            .all('calendarEvents/concrete/mine')
            .getList({
                dateStart: dateStart,
                dateEnd: dateEnd
            })
            .then(this.getPlain);
    }

    getConcreteCalendarEvents(calendarEventId: number, dateStart: string, dateEnd: string): Promise<ConcreteCalendarEvent[]> {
        return this.Restangular
            .one('calendarEvents', calendarEventId)
            .one('concrete')
            .get({
                dateStart: dateStart,
                dateEnd: dateEnd
            })
            .then(this.getPlain);
    }

    putCalendarEvent(calendarEventId: number, calendarEvent: CalendarEvent): Promise<void> {
        return this.Restangular
            .one('calendarEvents', calendarEventId)
            .customPUT(calendarEvent);
    }

    postCalendarEvent(calendarEvent: CalendarEvent): Promise<Id> {
        return this.Restangular
            .all('calendarEvents')
            .post(calendarEvent);

    }

    putConcreteCalendarEvent(calendarEventId: number, concreteCalendarEventId: number, concreteCalendarEvent: ConcreteCalendarEvent, force = false): Promise<CrossingData | void> {
        return this.Restangular
            .one('calendarEvents', calendarEventId)
            .one('concrete', concreteCalendarEventId)
            .customPUT(concreteCalendarEvent, null, {
                force: force
            });
    }

    removeCalendarEvent(calendarEventId: number): Promise<void> {
        return this.Restangular
            .one('calendarEvents', calendarEventId)
            .remove();
    }

    removeConcreteCalendarEvent(calendarEventId: number, concreteCalendarEventId: number): Promise<void> {
        return this.Restangular
            .one('calendarEvents', calendarEventId)
            .one('concrete', concreteCalendarEventId)
            .remove();
    }

    putTherapistOfCalendarEvent(calendarEventId: number, therapistId: number): Promise<void> { // todo
        return this.Restangular
            .one('calendarEvents', calendarEventId)
            .one('therapist')
            .customPUT({
                id: therapistId
            });

    }

    putRoomOfCalendarEvent(calendarEventId: number, roomId: number): Promise<void> { // todo
        return this.Restangular
            .one('calendarEvents', calendarEventId)
            .one('room')
            .customPUT({
                id: roomId
            });
    }

    putEquipmentOfCalendarEvent(calendarEventId: number, equipmentIds: number[]): Promise<void> { // todo
        return this.Restangular
            .one('calendarEvents', calendarEventId)
            .one('equipment')
            .customPUT(equipmentIds);
    }


}
