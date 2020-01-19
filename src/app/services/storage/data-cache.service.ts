import {BaseCacheService} from './base-cache.service';
import {StorageService} from './storage.service';
import {Room} from '../../model/rest/Room';
import {Service} from '../../model/rest/Service';
import {Event} from '../../model/rest/Event';
import {ServiceCategory} from '../../model/rest/ServiceCategory';
import {Equipment} from '../../model/rest/Equipment';
import {Therapist} from '../../model/rest/Therapist';
import {Session} from '../../model/rest/Session';
import {Client} from '../../model/rest/Client';
import {Restriction} from '../../model/rest/Restriction';
import {ApiInjectableBaseService} from '../api/api-injectable-base.service';
import {ApiSettingsService} from '../api/api-settings.service';
import ApiEndpoint = ApiSettingsService.SettingsApiEndpoints;
import {Mail} from '../../model/rest/Mail';
import {TherapistWeek} from '../../model/rest/TherapistWeek';

export enum CacheStrategy {
    fresh = <any>'fresh',
    fast = <any>'fast'
}

export class DataCacheService extends BaseCacheService {

    /** @ngInject */
    constructor(StorageService: StorageService, $q: any, _, env,
                private ApiInjectableBaseService: ApiInjectableBaseService) {
        super(StorageService, $q, _, env);
    }

    getTaxes(strategy: CacheStrategy = CacheStrategy.fresh): Promise<Service[]> {
        return this.getList(ApiEndpoint.taxes, strategy);
    }
    getEventTypes(strategy: CacheStrategy = CacheStrategy.fresh): Promise<Service[]> {
        return this.getList(ApiEndpoint.eventTypes, strategy);
    }

    getServices(strategy: CacheStrategy = CacheStrategy.fresh): Promise<Service[]> {
        return this.getList(ApiEndpoint.services, strategy);
    }

    getCategories(strategy: CacheStrategy = CacheStrategy.fresh): Promise<ServiceCategory[]> {
        return this.getList(ApiEndpoint.serviceCategories, strategy);
    }

    getEvents(strategy: CacheStrategy = CacheStrategy.fresh): Promise<Event[]> {
        return this.getList(ApiEndpoint.events, strategy);
    }

    getRooms(strategy: CacheStrategy = CacheStrategy.fresh): Promise<Room[]> {
        return this.getList(ApiEndpoint.rooms, strategy);
    }

    getEquipments(strategy: CacheStrategy = CacheStrategy.fresh): Promise<Equipment[]> {
        return this.getList(ApiEndpoint.equipments, strategy);
    }

    getTherapists(strategy: CacheStrategy = CacheStrategy.fresh): Promise<Therapist[]> {
        return this.getList(ApiEndpoint.therapists, strategy);
    }

    getSessions(strategy: CacheStrategy = CacheStrategy.fresh): Promise<Session[]> {
        return this.getList(ApiEndpoint.sessions, strategy);
    }

    getClients(strategy: CacheStrategy = CacheStrategy.fresh): Promise<Client[]> {
        return this.getList(ApiEndpoint.clients, strategy);
    }
    getWeeks(strategy: CacheStrategy = CacheStrategy.fresh): Promise<TherapistWeek[]> {
        return this.getList(ApiEndpoint.week, strategy);
    }

    getRestrictions(strategy: CacheStrategy = CacheStrategy.fresh): Promise<Restriction[]> {
        return this.getList(ApiEndpoint.restrictions, strategy);
    }

    getMails(strategy: CacheStrategy = CacheStrategy.fresh): Promise<Mail[]> {
        return this.getList(ApiEndpoint.mails, strategy);
    }

    getList(endpoint: ApiEndpoint, strategy: CacheStrategy): Promise<any> {
        const apiEndpointName: string = ApiEndpoint[endpoint];
        const load = () => this.ApiInjectableBaseService.getWholeList(apiEndpointName);

        if (strategy == CacheStrategy.fresh) {
            return this.getFresh(apiEndpointName, load);
        } else {
            return this.getFast(apiEndpointName, load);
        }
    }

    flush() {
        this.StorageService.flush();
    }

}
