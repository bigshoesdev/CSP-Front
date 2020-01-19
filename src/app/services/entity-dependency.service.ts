import {Entity} from '../model/Entity';
import {Room} from '../model/rest/Room';
import {ServiceCategory} from '../model/rest/ServiceCategory';
import {Service} from '../model/rest/Service';
import {Restriction} from '../model/rest/Restriction';
import {RestrictionType_Ns} from '../model/rest/RestrictionType';
import {Therapist} from '../model/rest/Therapist';
import {PreliminaryEvent} from '../model/rest/PreliminaryEvent';
import {Collection} from '../model/Collection';
import RestrictionType = RestrictionType_Ns.RestrictionType;
import {ServiceOrCategory} from '../model/ServiceOrCategory';
import {Session} from "../model/rest/Session";
import {Client} from "../model/rest/Client";

export class EntityDependencyService {

    /** @ngInject */
    constructor(private _) {
    }

    findEntityById(entities: { id: number }[], id: number): any {
        return this._.find(entities, r => r.id === id);
    }

    collectServicesAndCategories(categories: ServiceCategory[],
                                 services: Service[] = [],
                                 idToService: Collection<Service> = {}): Collection<Service> {
        idToService = this.collectEntities(services, idToService);

        return categories.reduce((map: any, category: ServiceCategory) => this.collectEntities(category.services, map), idToService);
    }

    collectEntities(entities: Entity[], id2Entity: Collection<Entity> = {}): Collection<any> {
        return this._.assign(id2Entity, this._.keyBy(entities, 'id'));
    }

    private collectRestrictedRoomsForCategories(categories: ServiceCategory[], restrictions: Restriction[], rooms: Room[], id2Room: Collection<Room> = {}): Collection<Room> {
        return categories.reduce((id2Room: Collection<Room>, category: ServiceCategory): Collection<Room> => {
            const categoryId = category.id;
            const restriction: Restriction = this._.find(restrictions, (r: Restriction) => {
                return r.type === RestrictionType.category
                    && r.linkedId === categoryId;
            });
            return restriction
                ? this.collectEntities(restriction.rooms, id2Room)
                : this.collectEntities(rooms, id2Room);
        }, id2Room);
    }

    private collectRestrictedRoomsForServicesAndCategories(serviceOrCategoryList: ServiceOrCategory[], restrictions: Restriction[], rooms: Room[], id2Room: Collection<Room> = {}): Collection<Room> {
        return serviceOrCategoryList.reduce((id2Room: Collection<Room>, serviceOrCategory: ServiceOrCategory): Collection<Room> => {
            const linkedId = serviceOrCategory.item.id;
            const restriction: Restriction = this._.find(restrictions, (r: Restriction) => {
                return r.type === serviceOrCategory.type
                    && r.linkedId === linkedId;
            });
            return restriction
                ? this.collectEntities(restriction.rooms, id2Room)
                : this.collectEntities(rooms, id2Room);
        }, id2Room);
    }

    filteredRoomsByServicesAndCategoriesRestrictions(rooms: Room[], serviceOrCategoryList: ServiceOrCategory[], restrictions: Restriction[]): Room[] {
        if (!serviceOrCategoryList || serviceOrCategoryList.length === 0) {
            return rooms;
        } else {
            const id2Room: Collection<Room> = this.collectRestrictedRoomsForServicesAndCategories(serviceOrCategoryList, restrictions, rooms, {});
            const restrictedRooms = this._.map(id2Room, r => r);
            return restrictedRooms.length > 0
                ? restrictedRooms
                : rooms;
        }
    }

    filteredRoomsByCategoriesRestrictions(rooms: Room[], categories: ServiceCategory[], restrictions: Restriction[]): Room[] {
        if (!categories || categories.length === 0) {
            return rooms;
        } else {
            const id2Room: Collection<Room> = this.collectRestrictedRoomsForCategories(categories, restrictions, rooms, {});
            return this._.map(id2Room, r => r);
        }
    }

    filteredTherapistsByCategories(therapists: Therapist[], categories: ServiceCategory[]): Therapist[] {
        if (!categories || categories.length === 0) {
            return therapists;
        } else {
            const id2Category: Collection<ServiceCategory> = this.collectEntities(categories, {});
            return therapists.filter((therapist: Therapist) => {
                const categoriesOfTherapist: ServiceCategory[] = therapist.serviceCategories;
                return categoriesOfTherapist && categoriesOfTherapist.some((cat: ServiceCategory) => !!id2Category[cat.id]);
            });
        }
    }

    filteredTherapistsByServiceAndCategories(therapists: Therapist[], serviceOrCategoryList: ServiceOrCategory[]): Therapist[] {
        if (!serviceOrCategoryList || serviceOrCategoryList.length === 0) {
            return therapists;
        } else {
            const id2Therapist: Collection<Therapist> = this.collectRestrictedTherapistsForServicesAndCategories(serviceOrCategoryList, therapists, {});
            const restrictedTherapists = this._.map(id2Therapist, t => t);
            return restrictedTherapists.length > 0
                ? restrictedTherapists
                : therapists;
        }
    }

    private collectRestrictedTherapistsForServicesAndCategories(serviceOrCategoryList: ServiceOrCategory[], therapists: Therapist[], id2Therapist: Collection<Therapist> = {}): Collection<Therapist> {
        return serviceOrCategoryList.reduce((id2Therapist: Collection<Therapist>, serviceOrCategory: ServiceOrCategory): Collection<Therapist> => {
            const linkedId: number = serviceOrCategory.item.id;
            let filtered: Therapist[];
            if (serviceOrCategory.type === RestrictionType.category) {
                filtered = therapists.filter((therapist: Therapist) => {
                    return therapist.serviceCategories.some((category: ServiceCategory) => category.id === linkedId);
                });
            } else if (serviceOrCategory.type === RestrictionType.service) {
                filtered = therapists.filter((therapist: Therapist) => {
                    return therapist.services.some((service: Service) => service.id === linkedId);
                });
            } else {
                filtered = [];
            }
            return this._.assign(id2Therapist, this._.keyBy(filtered, 'id'));
        }, id2Therapist);
    }


    /**
     * return all therapist who have some link to service
     * @param {Therapist[]} therapists
     * @param {number} serviceId
     * @returns {Therapist[]}
     */
    filterTherapistsByService(therapists: Therapist[], serviceId: number): Therapist[] {
        return therapists.filter((therapist: Therapist) => {
            return therapist.services.some(service => service.id === serviceId)
                || therapist.serviceCategories.some(category => category.services.some(service => service.id === serviceId));
        });
    }

    findClientServiceDataItem(items: PreliminaryEvent[],
                              complexId: { session: Session, client: Client, service: Service }): PreliminaryEvent {
        return this._.find(items, (dataItem: PreliminaryEvent) => {
            return dataItem.session.id === complexId.session.id
                && dataItem.client.id === complexId.client.id
                && dataItem.service.id === complexId.service.id;
        });
    }

    getRoomsAvailableForService(serviceId: number,
                                allRestrictions: Restriction[],
                                allCategories: ServiceCategory[],
                                allRooms: Room[]): Room[] {
        const restrictedRoomsForService = this.getRestrictedRoomsForService(serviceId, allCategories, allRestrictions);
        return restrictedRoomsForService.length > 0
            ? restrictedRoomsForService
            : allRooms;
    }

    private getRestrictedRoomsForService(serviceId: number,
                                         allCategories: ServiceCategory[],
                                         allRestrictions: Restriction[]): Room[] {

        const restrictionsOfService: Restriction[] = this.filterRestrictionsByService(serviceId, allRestrictions, allCategories);

        const id2Room: Collection<Room> = restrictionsOfService.reduce((map: Collection<Room>, restriction: Restriction) => {
            return this._.assign(map, this._.keyBy(restriction.rooms, 'id'));
        }, {});

        return this._.map(id2Room, r => r);
    }

    private filterRestrictionsByService(serviceId: number,
                                        restrictions: Restriction[],
                                        allCategories: ServiceCategory[]): Restriction[] {
        return restrictions.filter((r: Restriction) => {
            if (r.type === RestrictionType.category) {
                const categoryId = r.linkedId;
                const categoryOfRestriction: ServiceCategory = this._.find(allCategories, c => c.id === categoryId);
                return categoryOfRestriction && categoryOfRestriction.services.some(s => s.id === serviceId);
            } else if (r.type === RestrictionType.service) {
                return r.linkedId === serviceId;
            } else {
                return false;
            }
        });
    }

    ifServiceInCategories(categories: ServiceCategory[], serviceId: number): boolean {
        return categories.some((c: ServiceCategory) => {
            return c.services.some((s: Service) => s.id === serviceId);
        });
    }

}
