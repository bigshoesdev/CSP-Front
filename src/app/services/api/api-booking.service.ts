import {ApiBaseService} from './api-base.service';
import {ConcreteEvent} from '../../model/rest/ConcreteEvent';
import {getPlain} from '../route.generators';
import {ConcreteEventChangeCode} from '../../model/rest/ConcreteEventChangeCode';
import {ConcreteEventSubStatus} from '../../model/rest/ConcreteEventSubStatus';
import {CrossingData} from '../../model/rest/CrossingData';
import {ConcreteCalendarEvent} from "../../model/rest/ConcreteCalendarEvent";
import {TherapistWeek} from '../../model/rest/TherapistWeek';
import {Id} from '../../model/rest/Id';
import {Therapist} from '../../model/rest/Therapist';

export class ApiBookingService extends ApiBaseService {
    /** @ngInject */
    constructor(Restangular) {
        super(Restangular);
    }

    getEvents(date?: string, dateFrom?: string, dateTo?: string): Promise<ConcreteEvent[]> {
        return this.Restangular
            .all('booking/events')
            .getList({
                date: date,
                dateStart: dateFrom,
                dateEnd: dateTo
            })
            .then(this.getPlain);
    }

    getWeek(): Promise<TherapistWeek[]> {
        return this.Restangular
            .all('booking/week')
            .getList()
            .then(this.getPlain);
    }

    postWeek(name: string): Promise<Id> {
        return this.Restangular
            .all('week')
            .post({
                name: name
            });
    }

    putWeek(weekId: number, name: string): Promise<Id> {
        return this.Restangular
            .one('week', weekId)
            .customPUT({
                name: name
            });
    }

    deleteTherapistWeek(weekId: number) {
        return this.Restangular
            .one('week', weekId)
            .remove();
    }
    // staff
    postTherapistIds(weekId: number, therapistsIds: number[]) {
        return this.Restangular
            .one('week', weekId)
            .post('therapists', therapistsIds);
    }


    getMineEvents(dateStart: string, dateEnd: string): Promise<ConcreteEvent[]> {
        return this.Restangular
            .all('booking/events/mine')
            .getList({
                dateStart: dateStart,
                dateEnd: dateEnd
            })
            .then(this.getPlain);
    }

    getEvent(id: number): Promise<ConcreteEvent> {
        return this.Restangular
            .one('booking/event', id)
            .get()
            .then(this.getPlain);
    }

    getEventLastChange(eventCode: string): Promise<ConcreteEventChangeCode> {
        return this.Restangular
            .one('/booking/event', eventCode)
            .one('lastChange')
            .get()
            .then(getPlain);
    }

    putEvent(concreteEvent: ConcreteEvent, noEmails = false, force = false): Promise<CrossingData | void> {
        return this.Restangular
            .one('booking/event', concreteEvent.id)
            .customPUT(concreteEvent, null, {
                force: force,
                noEmails: noEmails
            });
    }

    postEvent(concreteEvent: ConcreteEvent, noEmails = false, force = false): Promise<ConcreteEvent> {
        return this.Restangular
            .all('booking/event')
            .post(concreteEvent, {
                force: force,
                noEmails: noEmails
            });
    }

    removeEvent(concreteEvent: ConcreteEvent, noEmails = false): Promise<void> {
        return this.Restangular
            .one('booking/event', concreteEvent.id)
            .remove({
                noEmails: noEmails
            });
    }

    removeCalendarEvent(concreteEvent: ConcreteCalendarEvent, noEmails = false): Promise<void> {
        return this.Restangular
            .one('booking/concreteCalendarEvent', concreteEvent.id)
            .remove({
                noEmails: noEmails
            });
    }

    confirmEvent(eventCode: string): Promise<void> {
        return this.Restangular
            .one('booking/event', eventCode)
            .one('confirm')
            .customPOST();
    }

    declineEvent(eventCode: string): Promise<void> {
        return this.Restangular
            .one('booking/event', eventCode)
            .one('decline')
            .customPOST();
    }

    getEventSubStatus(): Promise<ConcreteEventSubStatus[]> {
        return this.Restangular
            .all('booking/events/subStatus')
            .getList()
            .then(getPlain);

    }
}

