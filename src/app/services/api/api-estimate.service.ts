import {ApiBaseService} from './api-base.service';
import {Estimate} from '../../model/rest/Estimate';
import {Id} from '../../model/rest/Id';

export class ApiEstimateService extends ApiBaseService {
    /** @ngInject */
    constructor(Restangular) {
        super(Restangular);
    }

    getEstimates(): Promise<Estimate[]> {
        return this.getWholeList('estimates');
    }


    getEstimateForClient(clientId: number): Promise<Estimate> {
        return this.Restangular
            .one('estimates/client', clientId)
            .get();
    }

    postEstimateForClient(clientId: number, concreteEventReconcileIds: number[]): Promise<Id> {
        return this.Restangular
            .one('estimates/client', clientId)
            .post('', concreteEventReconcileIds);
    }

    deleteEstimate(estimateId: number): Promise<void> {
        return this.removeOne('estimates', estimateId);
    }

    getEstimate(estimateId: number): Promise<Estimate> {
        return this.getOne('estimates', estimateId);
    }

    putEstimateEvents(estimateId: number, concreteEventReconcileIds: number[]): Promise<void> {
        return this.Restangular
            .one('estimates', estimateId)
            .one('events')
            .customPUT(concreteEventReconcileIds);
    }

    putEstimateEvent(estimateId: number, eventId: number): Promise<void> {
        return this.Restangular
            .one('estimates', estimateId)
            .one('events', eventId)
            .customPUT();
    }

    deleteEstimateEvent(estimateId: number, eventId: number): Promise<void> {
        return this.Restangular
            .one('estimates', estimateId)
            .one('events', eventId)
            .remove();
    }

    postEstimateSend(estimateId: number): Promise<void> {
        return this.Restangular
            .one('estimates', estimateId)
            .one('send')
            .post();
    }


}
