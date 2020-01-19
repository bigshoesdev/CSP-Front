import {Service} from '../model/rest/Service';
import {Therapist} from '../model/rest/Therapist';
import {Collection} from '../model/Collection';
import {Room} from '../model/rest/Room';
import {IRowCalItem} from '../directives/calendarRow/calendarRow.controller';
import {EntityDependencyService} from './entity-dependency.service';
import {DialogService} from './dialog/dialog.service';
import {Restriction} from '../model/rest/Restriction';
import {ServiceCategory} from '../model/rest/ServiceCategory';
import {BaseConcreteEvent} from '../model/rest/BaseConcreteEvent';

export class ValidationService {
    /** @ngInject */
    constructor(private EntityDependencyService: EntityDependencyService,
                private DialogService: DialogService,
                private $q) {

    }

    checkItemValid(item: IRowCalItem,
                   services: Service[],
                   restrictions: Restriction[],
                   categories: ServiceCategory[],
                   rooms: Room[]): Promise<IRowCalItem> | IRowCalItem {
        const event: BaseConcreteEvent = item.model;

        const therapist: Therapist = event.therapist;
        const serviceId = event.service.id;
        // const service: Service = this.EntityDependencyService.findEntityById(services, serviceId);
        const service = event.service;

        const id2Service: Collection<Service> = this.EntityDependencyService.collectServicesAndCategories(therapist.serviceCategories, therapist.services, {});
        if (!id2Service[serviceId]) {
            return this.DialogService.dialogAlert({
                ok: 'Ok',
                title: 'Error',
                textContent: `The therapist "${therapist.name}" can't do the service "${service.name}"`,
            }).then(() => this.$q.reject());
        }

        const room: Room = event.room;
        const roomId = room.id;

        const roomsForService: Room[] = this.EntityDependencyService.getRoomsAvailableForService(service.id, restrictions, categories, rooms);
        const isRoomAvailable = roomsForService.some((r: Room) => r.id == roomId);
        if (!isRoomAvailable) {
            return this.DialogService.dialogAlert({
                ok: 'Ok',
                title: 'Error',
                textContent: `The room "${room.name}" isn't suitable for the service "${service.name}"`,
            }).then(() => this.$q.reject());
        }

        return item;
    }


}
