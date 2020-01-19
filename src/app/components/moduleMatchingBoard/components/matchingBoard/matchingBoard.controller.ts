import {LocalStorageService} from '../../../../services/storage/local-storage.service';
import {Entity} from '../../../../model/Entity';
import {Client} from '../../../../model/rest/Client';
import {Room} from '../../../../model/rest/Room';
import {ClientServiceMatchingData} from '../../../../model/rest/ClientServiceMatchingData';
import {Session} from '../../../../model/rest/Session';
import {Therapist} from '../../../../model/rest/Therapist';
import {ServiceCategory} from '../../../../model/rest/ServiceCategory';
import {Service} from '../../../../model/rest/Service';
import {Restriction} from '../../../../model/rest/Restriction';
import {PreliminaryEvent} from '../../../../model/rest/PreliminaryEvent';
import {CrossingData} from '../../../../model/rest/CrossingData';
import {ClientMatchingConfirmation} from '../../../../model/rest/ClientMatchingConfirmation';
import {EntityDependencyService} from '../../../../services/entity-dependency.service';
import {ApiMatchingBoardService} from '../../../../services/api/api-matching-board.service';
import {DialogService, IDialogCrossingDataConf} from '../../../../services/dialog/dialog.service';

declare let angular: any;

enum MatchingBoardViewMode {
    daily = 1,
    weekly,
    interval
}

export class MatchingBoardController {
    _matchingDataArr: ClientServiceMatchingData[];

    matchingEvents: PreliminaryEvent[]; //     collect _matchingDataArr[i].matchingData
    confirmationEvents: PreliminaryEvent[]; // collect _matchingDataArr[i].confirmationData.items

    _tableRooms: Room[];
    _tableTherapists: Therapist[];

    session: Session;

    clients: Client[];
    client: Client;
    clientId: number;

    /** @ngInject */
    constructor(public sessions: Session[],
                private therapists: Therapist[],
                public rooms: Room[],
                public categories: ServiceCategory[],
                public services: Service[],
                public restrictions: Restriction[],
                public allClients: Client[], // just for caching
                private $scope, private LocalStorageService: LocalStorageService, private _, private $q: any,
                private ApiMatchingBoardService: ApiMatchingBoardService, private $state: ng.ui.IStateService,
                private EntityDependencyService: EntityDependencyService, private DialogService: DialogService) {

        this.initForm();

        $scope.displayEntity = (item: Entity) => item && item.name;

        $scope.applySession = (session: Session) => {
            if (session) {
                this.session = session;
                this.filterRoomsAndTherapists(this.session, $scope.categoriesFilter);
                this.applySession(this.session);
            }
        };

        $scope.applyClient = (client: Client) => {
            if (client) {
                this.client = client;
                this.filterRoomsAndTherapists(this.session, $scope.categoriesFilter);
                this.setUpModel();
            }
        };

        $scope.applyCategories = () => {
            this.filterRoomsAndTherapists(this.session, $scope.categoriesFilter);
            this.setUpModel();
        };

        $scope.setMode = (mode: string) => {
            this.setMode(mode);
        };

        $scope.isMode = (mode: string) => $state.is('auth.matchingBoard.table.' + mode);

        $scope.confirm = (force: boolean, $event) => {
            ApiMatchingBoardService.postConfirmation($scope.sessionId, this.clientId, force)
                .then(() => {
                    this.updateMatchingData();
                }, (crossingDataArr: CrossingData[]) => {
                    this.handleCrossing(crossingDataArr, $event);
                });
        };

        $scope.unconfirm = ($event) => {
            ApiMatchingBoardService.deleteConfirmation($scope.sessionId, this.clientId)
                .then(() => {
                    this.updateMatchingData();
                });
        };

        $scope.isConfirmDisabled = () => {
            return !this.matchingEvents.length || !$scope.sessionId || !this.clientId;
        };

        $scope.isUnconfirmDisabled = () => {
            return !this.confirmationEvents.length || !$scope.sessionId || !this.clientId;
        };
    }

    initForm() {
        const $scope = this.$scope;

        this.session = $scope.session = null;
        $scope.sessionId = null;

        this.clients = [];
        this.client = $scope.client = null;
        this.clientId = null;

        //one of this.categories
        $scope.categoriesFilter = [];
        $scope.categories = this.categories;

        this.matchingEvents = [];
        this.confirmationEvents = [];

        this._tableRooms = this.rooms;
        this._tableTherapists = [];

        const sessionId: number = +(this.LocalStorageService.getItem('moduleMatchingBoard.sessionId'));
        if (!isNaN(sessionId)) {
            const session: Session = this._.find(this.sessions, (s) => s.id === sessionId);
            if (session) {
                this.session = $scope.session = session;
                this._tableTherapists = session.therapists;
                this.applySession(session);
            }
        }

        this.$scope.viewMode = MatchingBoardViewMode[this.LocalStorageService.getItem('moduleMatchingBoard.viewMode')];
    }

    applySession(session: Session) {
        const $scope = this.$scope;

        let sessionId;
        if (!session || $scope.sessionId === (sessionId = session.id)) {
            return;
        }

        $scope.sessionId = sessionId;
        this.LocalStorageService.setItem('moduleMatchingBoard.sessionId', sessionId);

        this.updateAllClientsData(sessionId);
    }

    setUpModel() {
        const $scope = this.$scope;
        const client: Client = this.client;

        let matchingEvents: PreliminaryEvent[];
        let confirmationEvents: PreliminaryEvent[];

        if (client) {
            const clientId = client.id;
            this.clientId = clientId;
            this.LocalStorageService.setItem('moduleMatchingBoard.clientId', clientId);

            const clientMatchingData: ClientServiceMatchingData = this._.find(this._matchingDataArr, (md: ClientServiceMatchingData) => md.clientId === clientId);
            matchingEvents = this._.cloneDeep(clientMatchingData.matchingData);
            confirmationEvents = this._.cloneDeep(clientMatchingData.confirmationData && clientMatchingData.confirmationData.items || []);

            this.initConfirmationLink(clientMatchingData);
        } else {
            this.clientId = null;
            this.LocalStorageService.setItem('moduleMatchingBoard.clientId', this.clientId);

            let allMatchingEvents: PreliminaryEvent[] = [];
            let allConfirmationEvents: PreliminaryEvent[] = [];
            this._matchingDataArr.forEach((md: ClientServiceMatchingData) => {
                allMatchingEvents = allMatchingEvents.concat(md.matchingData);
                allConfirmationEvents = allConfirmationEvents.concat(md.confirmationData && md.confirmationData.items || []);
            });
            matchingEvents = this._.cloneDeep(allMatchingEvents);
            confirmationEvents = this._.cloneDeep(allConfirmationEvents);
        }

        const categoriesFilter: ServiceCategory[] = $scope.categoriesFilter;
        if (categoriesFilter && categoriesFilter.length > 0) {
            matchingEvents = matchingEvents.filter((matchingEvent: PreliminaryEvent) => {
                return this.EntityDependencyService.ifServiceInCategories(categoriesFilter, matchingEvent.service.id);
            });
        }

        this.matchingEvents = matchingEvents;
        this.confirmationEvents = confirmationEvents;
    }

    private initConfirmationLink(clientMatchingData: ClientServiceMatchingData) {
        const confirmationData: ClientMatchingConfirmation = clientMatchingData.confirmationData;
        this.$scope.confirmationLink = confirmationData
            ? '/#/matchingBoardConfirmation/' + confirmationData.secret
            : null;
    }

    applyAllClientsMatchingData(matchingDataArr: ClientServiceMatchingData[]) {
        const $scope = this.$scope;

        this._matchingDataArr = matchingDataArr;

        const clients: Client[] = matchingDataArr.map((matchingData: ClientServiceMatchingData): Client => {
            return {
                id: matchingData.clientId,
                name: matchingData.clientName,
            };
        });
        this.clients = clients;

        if (clients && clients.length > 0) {
            const clientId = +(this.LocalStorageService.getItem('moduleMatchingBoard.clientId'));
            this.client = $scope.client = this._.find(clients, (c: Client) => c.id === clientId);
        } else {
            this.client = $scope.client = null;
        }

        this.setUpModel();
    }

    applyOneClientMatchingData(clientId: number, matchingData: PreliminaryEvent[], confirmationData: ClientMatchingConfirmation) {
        // update storage
        const clientMatchingData: ClientServiceMatchingData = this._.find(this._matchingDataArr, (md: ClientServiceMatchingData) => md.clientId == clientId);
        clientMatchingData.matchingData = matchingData;
        clientMatchingData.confirmationData = confirmationData;
        this.setUpModel();
    }

    filterRoomsAndTherapists(session: Session, categoriesFilter: ServiceCategory[]) {
        const EntityDependencyService: EntityDependencyService = this.EntityDependencyService;

        this._tableRooms = EntityDependencyService.filteredRoomsByCategoriesRestrictions(this.rooms, categoriesFilter, this.restrictions);
        this._tableTherapists = EntityDependencyService.filteredTherapistsByCategories(session.therapists, categoriesFilter);
    }

    setMode(mode: string) {
        mode = MatchingBoardViewMode[MatchingBoardViewMode[mode]];
        if (mode) {
            // let prevMode = $scope.viewMode;
            this.$scope.viewMode = mode;
            this.LocalStorageService.setItem('moduleMatchingBoard.viewMode', MatchingBoardViewMode[mode]);

            // convertDates(mode, prevMode);

            this.$state.go('auth.matchingBoard.table.' + mode);
        }
    }

    handleCrossing(crossingDataArr: CrossingData[], $event) {
        const $scope = this.$scope;
        const dialogConf: IDialogCrossingDataConf = {
            targetEvent: $event,
            useConfirmBtn: true,
            useEditBtn: true,
        };
        this.DialogService.dialogCrossingData(crossingDataArr, dialogConf).then((force: boolean) => {
            // confirmed
            this.ApiMatchingBoardService.postConfirmation($scope.sessionId, this.clientId, true).then(() => {
                this.updateMatchingData();
            });
        });
    }

    updateMatchingData(): Promise<any> {
        const $scope = this.$scope;
        const sessionId = $scope.sessionId;
        const clientId = this.clientId;

        if (clientId && clientId > 0) {
            return this.updateOneClientData(sessionId, clientId);
        } else {
            return this.updateAllClientsData(sessionId);
        }
    }

    updateAllClientsData(sessionId: number): Promise<any> {
        return this.ApiMatchingBoardService.getClientsMixed(sessionId).then((matchingDataArr: ClientServiceMatchingData[]) => {
            this.applyAllClientsMatchingData(matchingDataArr);
        });
    }

    updateOneClientData(sessionId: number, clientId: number): Promise<any> {
        const servicesPr: Promise<PreliminaryEvent[]> = this.ApiMatchingBoardService.getServices(sessionId, clientId);
        const confirmationPr: Promise<ClientMatchingConfirmation> = this.ApiMatchingBoardService.getConfirmation(sessionId, clientId);

        return this.$q.all([servicesPr, confirmationPr]).then((result: [PreliminaryEvent[], ClientMatchingConfirmation]) => {
            this.applyOneClientMatchingData(clientId, result[0], result[1]);
        });
    }
}

