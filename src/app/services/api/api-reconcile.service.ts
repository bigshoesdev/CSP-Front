import {ApiBaseService} from './api-base.service';
import {ConcreteEventReconcile} from '../../model/rest/ConcreteEventReconcile';
import {SignatureInfo} from '../../model/rest/SignatureInfo';
import {ConcreteEvent} from '../../model/rest/ConcreteEvent';
import {CrossingData} from '../../model/rest/CrossingData';

export class ApiReconcileService extends ApiBaseService {
    /** @ngInject */
    constructor(Restangular) {
        super(Restangular);
    }

    getReconcileEventsOfDate(date: string, clientId: number = undefined): Promise<ConcreteEventReconcile[]> {
        return this.Restangular
            .all('reconcile')
            .get('events', {
                date: date,
                clientId: clientId,
            })
            .then(this.getPlain);
    }

    getReconcileEventsBetweenDate(dateStart: string, dateEnd: string, clientId: number = undefined): Promise<ConcreteEventReconcile[]> {
        return this.Restangular
            .all('reconcile')
            .get('events', {
                dateStart: dateStart,
                dateEnd: dateEnd,
                clientId: clientId,
            })
            .then(this.getPlain);
    }

    postAudit(signatureInfo: SignatureInfo): Promise<void> {
        return this.Restangular
            .all('reconcile/audit')
            .post(signatureInfo);
    }

    postReconcile(signatureInfo: SignatureInfo): Promise<void> {
        return this.Restangular
            .all('reconcile/reconcile')
            .post(signatureInfo);
    }

    putEvent(concreteEvent: ConcreteEvent, noEmails = false, force = false): Promise<CrossingData | void> {
        return this.Restangular
            .one('reconcile/event', concreteEvent.id)
            .customPUT(concreteEvent, null, {
                force: force,
                noEmails: noEmails
            });
    }

    postEvent(concreteEvent: ConcreteEvent, noEmails = false, force = false): Promise<ConcreteEvent> {
        return this.Restangular
            .all('reconcile/event')
            .post(concreteEvent, {
                force: force,
                noEmails: noEmails
            });
    }

}
