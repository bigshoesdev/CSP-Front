import {ApiBaseService} from './api-base.service';
import {Room} from '../../model/rest/Room';
import {Service} from '../../model/rest/Service';
import {ServiceCategory} from '../../model/rest/ServiceCategory';
import {Equipment} from '../../model/rest/Equipment';
import {Therapist} from '../../model/rest/Therapist';
import {Session} from '../../model/rest/Session';
import {Client} from '../../model/rest/Client';
import {Restriction} from '../../model/rest/Restriction';
import {Mail} from '../../model/rest/Mail';

export class ApiSettingsService extends ApiBaseService {
    /** @ngInject */
    constructor(Restangular) {
        super(Restangular);
    }

    getServices(): Promise<Service[]> {
        return this.getWholeList(ApiSettingsService.SettingsApiEndpoints.services);
    }

    getCategories(): Promise<ServiceCategory[]> {
        return this.getWholeList(ApiSettingsService.SettingsApiEndpoints.serviceCategories);
    }

    getEvents(): Promise<Event[]> {
        return this.getWholeList(ApiSettingsService.SettingsApiEndpoints.events);
    }

    getRooms(): Promise<Room[]> {
        return this.getWholeList(ApiSettingsService.SettingsApiEndpoints.rooms);
    }

    getEquipments(): Promise<Equipment[]> {
        return this.getWholeList(ApiSettingsService.SettingsApiEndpoints.equipments);
    }

    getTherapists(): Promise<Therapist[]> {
        return this.getWholeList(ApiSettingsService.SettingsApiEndpoints.therapists);
    }

    getSessions(): Promise<Session[]> {
        return this.getWholeList(ApiSettingsService.SettingsApiEndpoints.sessions);
    }

    getClients(): Promise<Client[]> {
        return this.getWholeList(ApiSettingsService.SettingsApiEndpoints.clients);
    }

    getRestrictions(): Promise<Restriction> {
        return this.getWholeList(ApiSettingsService.SettingsApiEndpoints.restrictions);
    }
    getMails(): Promise<Mail[]> {
        return this.getWholeList(ApiSettingsService.SettingsApiEndpoints.mails);
    }

    findClients(searchText: string): Promise<Client[]> {
        return this.Restangular
            .all('/clients/search')
            .getList({
                searchField: 'name',
                searchString: searchText,
                pageId: 1,
                pageSize: 10,
                sort: '+name'
            })
            .then(this.getPlain);
    }

}

export namespace ApiSettingsService {
    export enum SettingsApiEndpoints {
        services = <any>'services',
        serviceCategories = <any>'serviceCategories',
        events = <any>'events',
        eventTypes = <any>'eventTypes',
        rooms = <any>'rooms',
        equipments = <any>'equipments',
        therapists = <any>'therapists',
        sessions = <any>'sessions',
        clients = <any>'clients',
        restrictions = <any>'restrictions',
        mails = <any>'mails',
        taxes = <any>'taxes',
        week = <any>'weeks'
    }
}
