import {LocalStorageService} from '../../../../services/storage/local-storage.service';
import {Room} from '../../../../model/rest/Room';
import {Client} from '../../../../model/rest/Client';
import {Session} from '../../../../model/rest/Session';
import {Service} from '../../../../model/rest/Service';
import {Therapist} from '../../../../model/rest/Therapist';
import {Restriction} from '../../../../model/rest/Restriction';
import {ServiceCategory} from '../../../../model/rest/ServiceCategory';
import {EntityDependencyService} from '../../../../services/entity-dependency.service';

declare let angular: any;

export class SuggestedServicesController {
    /** @ngInject */
    constructor(private canEditUi: boolean,
                private sessions: Session[],
                private rooms: Room[],
                private services: Service[],
                private therapists: Therapist[],
                private clients: Client[],
                private restrict: Restriction[],
                private categories: ServiceCategory[],
                private $scope, private LocalStorageService: LocalStorageService, private _, private $state: ng.ui.IStateService,
                private EntityDependencyService: EntityDependencyService) {

        this.initForm();

        $scope.displayItem = (item) => item && item.name;

        $scope.applySession = (session: Session) => this.applySession(session);

        $scope.customize = () => {
            $state.go('auth.suggestedServices.table.editColumns');
        };

        $scope.juggleBoard = () => {
            LocalStorageService.removeItem('moduleSuggestedServices.clientId');
            $state.go('auth.suggestedServices.juggleBoard');
        };

    }

    private initForm() {
        this.$scope.canEditUi = this.canEditUi;

        const sessionId: number = +(this.LocalStorageService.getItem('moduleSuggestedServices.sessionId')) || this.sessions[0].id;
        if (!isNaN(sessionId)) {
            const session: Session = this._.find(this.sessions, (s) => s.id === sessionId);
            this.$scope.session = session;
            this.applySession(session);
        }

        // variables for suggestedServicesTable directive
        this.$scope.tableData = {
            rooms: this.rooms,
            restrictions: this.restrict,
            categories: this.categories,
            sessionId
        };

    }

    private applySession(session: Session) {
        if (session) {
            this.LocalStorageService.setItem('moduleSuggestedServices.sessionId', session.id);
        }
    }
}

