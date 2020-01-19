import {ApiBaseService} from './api-base.service';
import {PreliminaryEvent} from '../../model/rest/PreliminaryEvent';
import {ClientServiceMatchingData} from '../../model/rest/ClientServiceMatchingData';
import {ClientMatchingConfirmation} from '../../model/rest/ClientMatchingConfirmation';
import {CrossingData} from '../../model/rest/CrossingData';

export class ApiMatchingBoardService extends ApiBaseService {
    /** @ngInject */
    constructor(Restangular) {
        super(Restangular);
    }

    getClientsMixed(sessionId: number): Promise<ClientServiceMatchingData[]> {
        return this.Restangular
            .one('matchingBoard/session', sessionId)
            .one('clients/mixed')
            .get()
            .then(this.getPlain);
    }

    getConfirmation(sessionId: number, clientId: number): Promise<ClientMatchingConfirmation> {
        return this.Restangular
            .one('matchingBoard/session', sessionId)
            .one('client', clientId)
            .one('confirmation')
            .get()
            .then(this.getPlain);
    }

    postConfirmation(sessionId: number, clientId: number, force: boolean = false): Promise<CrossingData> {
        return this.Restangular
            .one('matchingBoard/session', sessionId)
            .one('client', clientId)
            .all('confirmation')
            .post({
                force: force
            });
    }

    deleteConfirmation(sessionId: number, clientId: number): Promise<void> {
        return this.Restangular
            .one('matchingBoard/session', sessionId)
            .one('client', clientId)
            .one('confirmation')
            .remove();
    }

    getServices(sessionId: number, clientId: number): Promise<PreliminaryEvent[]> {
        return this.Restangular
            .one('matchingBoard/session', sessionId)
            .one('client', clientId)
            .one('services')
            .get()
            .then(this.getPlain);
    }

    putService(sessionId: number, clientId: number, serviceId: number, dataItem: PreliminaryEvent, force = false): Promise<CrossingData | void> {
        return this.Restangular
            .one('matchingBoard/session', sessionId)
            .one('client', clientId)
            .one('service', serviceId)
            .customPUT(dataItem, null, {
                force: force,
            });
    }

}
