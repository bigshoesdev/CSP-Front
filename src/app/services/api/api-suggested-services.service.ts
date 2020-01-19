import {ApiBaseService} from './api-base.service';
import {HtCustomColumn} from '../../model/rest/HtCustomColumn';
import {HtColumn} from '../../model/rest/HtColumn';
import {PreliminaryEvent} from '../../model/rest/PreliminaryEvent';
import {SessionSsClientData} from '../../model/rest/SessionSsClientData';
import {AvailabilityTherapistDayRecord} from '../../model/rest/AvailabilityTherapistDayRecord';
import {RoomBookedTime} from '../../model/rest/RoomBookedTime';
import {Id} from '../../model/rest/Id';
import {SsTableColumn} from '../../model/rest/SsTableColumn';
import {SessionClientDataItem} from '../../model/rest/SessionClientDataItem';

export class ApiSuggestedServicesService extends ApiBaseService {
    /** @ngInject */
    constructor(Restangular) {
        super(Restangular);
    }

    getColumns(): Promise<HtColumn[]> {
        return this.getList(ApiSuggestedServicesService.HealthTableApiEndpoints.tableColumns);
    }

    getCustomColumns(): Promise<HtCustomColumn[]> {
        return this.getList(ApiSuggestedServicesService.HealthTableApiEndpoints.customColumns);
    }

    getClientServiceDataItems(sessionId: number, clientId: number): Promise<PreliminaryEvent[]> {
        return this.Restangular
            .one('suggestedServices/session', sessionId)
            .one('client', clientId)
            .one('services')
            .get()
            .then(this.getPlain);
    }

    getClientServiceDataItem(sessionId: number, clientId: number, serviceId: number): Promise<PreliminaryEvent> {
        return this.Restangular
            .one('suggestedServices/session', sessionId)
            .one('client', clientId)
            .one('service', serviceId)
            .get()
            .then(this.getPlain);
    }

    postClientServiceDataItem(sessionId: number, clientId: number, item: PreliminaryEvent): Promise<Id> {
        return this.Restangular
            .one('suggestedServices/session', sessionId)
            .one('client', clientId)
            .all('service')
            .post(item);

    }

    putClientServiceDataItem(sessionId: number, clientId: number, serviceId: number, item: PreliminaryEvent): Promise<void> {
        return this.Restangular
            .one('suggestedServices/session', sessionId)
            .one('client', clientId)
            .one('service', serviceId)
            .customPUT(item);
    }

    deletePreliminaryEvent(Id: number): Promise<void> {
        return this.Restangular
            .one('suggestedServices/preliminaryEvent', Id)
            .remove();
    }


    getRoomBookedTimeForSession(sessionId: number, dateFrom: string, dateTo: string): Promise<RoomBookedTime[]> {
        return this.Restangular
            .one('rooms/session', sessionId)
            .one('booked')
            .get({
                dateFrom: dateFrom,
                dateTo: dateTo
            })
            .then(this.getPlain);
    }


    getSessionClientData(sessionId: number): Promise<SessionSsClientData[]> {
        return this.Restangular
            .one('suggestedServices/session', sessionId)
            .one('data')
            .get()
            .then(this.getPlain);
    }

    getTableColumn(): Promise<SsTableColumn[]> {
        return this.Restangular
            .all('suggestedServicesTable/columns')
            .getList()
            .then(this.getPlain);

    }

    putColumn(sessionId, clientId, columnId, clientDataItem: SessionClientDataItem) {
        return this.Restangular
            .one('suggestedServices/session', sessionId)
            .one('client', clientId)
            .one('column', columnId)
            .one('value')
            .customPUT(clientDataItem);
    }
}

export namespace ApiSuggestedServicesService {
    export enum HealthTableApiEndpoints {
        tableColumns = <any>'suggestedServicesTable/columns',
        customColumns = <any>'suggestedServices/customColumns',
    }
}
