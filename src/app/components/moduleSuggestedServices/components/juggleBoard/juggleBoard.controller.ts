import {LocalStorageService} from '../../../../services/storage/local-storage.service';
import {Room} from '../../../../model/rest/Room';
import {Client} from '../../../../model/rest/Client';
import {Session} from '../../../../model/rest/Session';
import {ServiceCategory} from '../../../../model/rest/ServiceCategory';
import {Service} from '../../../../model/rest/Service';
import {Restriction} from '../../../../model/rest/Restriction';
import {SessionSsClientData} from '../../../../model/rest/SessionSsClientData';
import {PreliminaryEvent} from '../../../../model/rest/PreliminaryEvent';
import {ApiSuggestedServicesService} from '../../../../services/api/api-suggested-services.service';
import {ServiceOrCategory} from '../../../../model/ServiceOrCategory';
import {RestrictionType_Ns} from '../../../../model/rest/RestrictionType';
import RestrictionType = RestrictionType_Ns.RestrictionType;
import {Collection} from '../../../../model/Collection';
import {EntityDependencyService} from '../../../../services/entity-dependency.service';

export class JuggleBoardController {

    clientDataArr: SessionSsClientData[] = []; // watched in children
    session: Session = null; // watched in children
    selectedServiceOrCategoryList: ServiceOrCategory[] = []; // watched in children

    serviceOrCategoryList: ServiceOrCategory[] = [];
    client: Client = null;
    clients: Client[] = [];

    /** @ngInject */
    constructor(public sessions: Session[],
                public rooms: Room[],
                public categories: ServiceCategory[],
                public services: Service[],
                public restrictions: Restriction[],
                private $scope,
                private LocalStorageService: LocalStorageService,
                private _,
                private StateStack,
                private $state: ng.ui.IStateService,
                private $q: any,
                private ApiSuggestedServicesService: ApiSuggestedServicesService,
                private EntityDependencyService: EntityDependencyService) {

        this.initServiceOrCategoryList();

        this.initForm();

        $scope.backOrDone = () => {
            StateStack.goBack();
        };

        $scope.displayItem = (item) => item && item.name;

        $scope.displayServiceOrCategory = (s: ServiceOrCategory) => s && `${s.type} ${s && s.item && s.item.name}` || '';

        $scope.applySession = (session: Session) => this.applySession(session);

        $scope.applyClient = (client: Client) => this.applyClient(client);

        $scope.clearClient = () => this.applyClient(null);

        $scope.applyServiceFilter = (selectedServiceOrCategoryList: ServiceOrCategory[]) => this.applyServiceFilter(selectedServiceOrCategoryList);

        $scope.isMode = (stateTail) => this.isMode(stateTail);

        $scope.setMode = (stateTail) => this.setMode(stateTail);
    }

    private isMode(mode: string) {
        return this.$state.is('auth.suggestedServices.juggleBoard.' + mode);
    }

    private setMode(mode: string) {
        this.LocalStorageService.setItem('moduleSuggestedServices.mode', mode);
        return this.$state.go('auth.suggestedServices.juggleBoard.' + mode);
    }

    private initForm() {

        this.selectedServiceOrCategoryList = this.$scope.selectedServiceOrCategoryList = [];

        const sessionId: number = +(this.LocalStorageService.getItem('moduleSuggestedServices.sessionId'));
        const session: Session = isNaN(sessionId)
            ? null
            : this._.find(this.sessions, (s) => s.id === sessionId);

        this.applySession(session);
    }

    private initServiceOrCategoryList() {
        const serviceList = this.services.map((service: Service): ServiceOrCategory => {
            return {
                id: `service-${service.id}`,
                type: RestrictionType.service,
                item: service,
            } as ServiceOrCategory;
        });
        const categoryList = this.categories.map((category: ServiceCategory): ServiceOrCategory => {
            return {
                id: `category-${category.id}`,
                type: RestrictionType.category,
                item: category,
            } as ServiceOrCategory;
        });
        this.serviceOrCategoryList = categoryList.concat(serviceList);
    }

    private applySession(session: Session) {
        if (!session) {
            return;
        }

        this.session = session;

        this.LocalStorageService.setItem('moduleSuggestedServices.sessionId', session.id);
        this.clients = session.clients;

        const clientId: number = this.client
            ? this.client.id
            : +(this.LocalStorageService.getItem('moduleSuggestedServices.clientId'));

        this.client = this._.find(this.clients, (c) => c.id === clientId);

        this.applyClient(this.client);

        const mode: string = this.LocalStorageService.getItem('moduleSuggestedServices.mode') || 'daily';
        this.setMode(mode);
    }

    private applyClient(client: Client) {
        this.client = client;

        if (client) {
            this.LocalStorageService.setItem('moduleSuggestedServices.clientId', client.id);
        } else {
            this.LocalStorageService.removeItem('moduleSuggestedServices.clientId');
        }

        this.updateClientDataArr();
    }

    private applyServiceFilter(selectedServiceOrCategoryList: ServiceOrCategory[]) {
        this.selectedServiceOrCategoryList = selectedServiceOrCategoryList;

        this.updateClientDataArr();
    }

    private updateClientDataArr() {
        this.getData().then((clientDataArr: SessionSsClientData[]) => {
            const id2Service: Collection<Service> = this.getServiceMapFromServiceOrCategory(this.selectedServiceOrCategoryList);
            this.clientDataArr = this.filterServicesOnClientData(clientDataArr, id2Service);
        });
    }

    private filterServicesOnClientData(clientDataArr: SessionSsClientData[], id2Service: Collection<Service>): SessionSsClientData[] {
        if (id2Service) {
            clientDataArr.forEach((clientData: SessionSsClientData) => {
                clientData.services = clientData.services
                    .filter((e: PreliminaryEvent) => !!id2Service[e.service.id]);
            });
            return clientDataArr.filter((clientData: SessionSsClientData) => clientData.services.length > 0);
        } else {
            return clientDataArr;
        }
    }

    private getServiceMapFromServiceOrCategory(selectedServiceOrCategoryList: ServiceOrCategory[]): Collection<Service> {
        if (selectedServiceOrCategoryList.length > 0) {
            const services: Service[] = selectedServiceOrCategoryList
                .filter((soc: ServiceOrCategory) => soc.type === RestrictionType.service)
                .map((soc: ServiceOrCategory): Service => soc.item as Service);

            const categories: ServiceCategory[] = selectedServiceOrCategoryList
                .filter((soc: ServiceOrCategory) => soc.type === RestrictionType.category)
                .map((soc: ServiceOrCategory): ServiceCategory => soc.item as ServiceCategory);

            return this.EntityDependencyService.collectServicesAndCategories(categories, services, {});
        } else {
            return null;
        }
    }

    private getData(): Promise<SessionSsClientData[]> {
        const sessionId = this.session && this.session.id;
        if (!sessionId) {
            return this.$q((resolve) => resolve([]));
        }
        const clientId = this.client && this.client.id;
        if (!clientId) {
            return this.getDataForSession(sessionId);
        } else {
            return this.getDataForSessionAndClient(this.session , this.client);
        }
    }

    private getDataForSession(sessionId): Promise<SessionSsClientData[]> {
        return this.ApiSuggestedServicesService.getSessionClientData(sessionId);
    }

    private getDataForSessionAndClient(session: Session, client: Client): Promise<SessionSsClientData[]> {
        return this.ApiSuggestedServicesService.getClientServiceDataItems(session.id, client.id).then((clientDataItems: PreliminaryEvent[]) => {
            const clientData: SessionSsClientData = {
                client: client,
                values: null,
                services: clientDataItems,
            };
            return [clientData];
        });
    }
}
