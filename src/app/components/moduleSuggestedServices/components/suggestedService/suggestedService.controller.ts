import {dateFormat} from '../../../../services/app.constant';
import {Room} from '../../../../model/rest/Room';
import {Id} from '../../../../model/rest/Id';
import {PreliminaryEvent} from '../../../../model/rest/PreliminaryEvent';
import {Session} from '../../../../model/rest/Session';
import {Restriction} from '../../../../model/rest/Restriction';
import {Therapist} from '../../../../model/rest/Therapist';
import {Service} from '../../../../model/rest/Service';
import {ServiceCategory} from '../../../../model/rest/ServiceCategory';
import {Collection} from '../../../../model/Collection';
import {ApiSuggestedServicesService} from '../../../../services/api/api-suggested-services.service';
import {EntityDependencyService} from '../../../../services/entity-dependency.service';
import {DialogService} from '../../../../services/dialog/dialog.service';
import {Utils} from '../../../../services/utils.service';
import {StateStack} from '../../../../services/state-stack.service';
import {IToastrService}from 'angular-toastr';
import {Client} from "../../../../model/rest/Client";

export class SuggestedServiceController {
    /** @ngInject */
    constructor(private suggestedService: PreliminaryEvent,
                private isEdit: boolean,
                private client: Client,
                private service: Service,
                private session: Session,
                private rooms: Room[],
                private restrictions: Restriction[],
                private categories: ServiceCategory[],
                private $scope,
                private $state: ng.ui.IStateService,
                private ApiSuggestedServicesService: ApiSuggestedServicesService,
                private toastr: IToastrService,
                private DialogService: DialogService,
                private UnsavedChanges,
                private Utils: Utils,
                private _,
                private StateStack,
                private EntityDependencyService: EntityDependencyService) {

        this.initForm(suggestedService, isEdit);

        $scope.displayName = (o) => o && o.name;

        $scope.convertDate2Model = (date) => Utils.dateToFormat(date);

        $scope.updateService = (service: Service) => {
            if (!service) {
                return;
            }
            $scope.suggestedService.serviceId = service.id;

            this.setupTherapists();
            this.setupTherapist();

            this.setupRooms();
        };

        $scope.updateTherapist = () => {
            this.setupRooms();
        };

        $scope.save = () => {
            toastr.clear();
            $scope.waitResponse = true;

            let promis: Promise<void>;
            if (isEdit) {
                promis = ApiSuggestedServicesService.putClientServiceDataItem(session.id, client.id, service.id, $scope.suggestedService)
                    .then(() => {
                        toastr.info('suggestedService updated successfully');
                        $scope.waitResponse = false;
                        UnsavedChanges.register($scope, $scope.suggestedService);
                        if (StateStack.canGoBack()) {
                            StateStack.goBack();
                        } else { $state.go('auth.suggestedServices.juggleBoard'); }

                    });

            } else {
                promis = ApiSuggestedServicesService.postClientServiceDataItem(session.id, client.id, $scope.suggestedService)
                    .then((response: Id) => {
                        toastr.info('suggestedService created successfully');
                        if (StateStack.canGoBack()) {
                            StateStack.goBack();
                        } else { $state.go('auth.suggestedServices.juggleBoard'); }
                    });
            }

            promis.then(null, (err) => {
                $scope.waitResponse = false;
            });
        };

        $scope.cancel = () => {
            if (isEdit && StateStack.canGoBack()) {
                StateStack.goBack();
            } else {
                $state.go('auth.suggestedServices.table');
            }
        };

        $scope.delete = ($event) => {
            toastr.clear();

            DialogService
                .dialogConfirm({
                    title: 'Delete Suggested Service',
                    textContent: 'Are you sure to delete the Suggested Service: "' + $scope.suggestedService.note + '"?',
                    targetEvent: $event,
                    cancel: 'Cancel',
                    ok: 'Delete'
                })
                .then(() => {
                    $scope.waitResponse = true;

                    ApiSuggestedServicesService.deletePreliminaryEvent(suggestedService.id)
                        .then(() => {
                            toastr.info('Suggested Service deleted successfully');
                            UnsavedChanges.deregister();
                            if (StateStack.canGoBack()) {
                                StateStack.goBack();
                            } else {
                                $state.go('auth.suggestedServices.table');
                            }
                        }, (err) => {
                            $scope.waitResponse = false;
                        });
                });

        };

        $scope.isUnsaved = () => {
            return UnsavedChanges.isChanged();
        };

    }

    private initForm(suggestedService: PreliminaryEvent, isEdit: boolean) {
        const $scope = this.$scope;
        $scope.isEdit = isEdit;
        $scope.suggestedService = suggestedService;

        if (!isEdit && !suggestedService.date) {
            suggestedService.date = this.session.startDate;
        }

        this.setupServices();
        this.setupService();

        if (isEdit) {
            const service: Service = suggestedService.service;
            $scope.title = service.name;
        } else {
            $scope.title = 'New Suggested Service';
        }

        this.setupTherapists();
        this.setupTherapist();

        this.setupRooms();

        $scope.date = this.Utils.initDateFromStr(suggestedService.date, dateFormat);
        $scope.startDate = this.Utils.initDateFromStr(this.session.startDate, dateFormat);
        $scope.endDate = this.Utils.initDateFromStr(this.session.endDate, dateFormat);

        if (isEdit) {
            this.UnsavedChanges.register($scope, $scope.suggestedService);
        }
    }


    private setupServices() {
        const id2Service: Collection<Service> = this.session.therapists.reduce((id2Service: Collection<Service>, therapist: Therapist): Collection<Service> => {
            return this.EntityDependencyService.collectServicesAndCategories(therapist.serviceCategories, therapist.services, id2Service);
        }, {});
        this.$scope.services = this._.map(id2Service, s => s);
    }

    private setupService() {
        const service: Service = this.suggestedService.service;
        if (!service) {
            this.suggestedService.service = null;
        }
        this.$scope.service = service;
    }

    private setupTherapists() {
        const $scope = this.$scope;
        if ($scope.service) {
            const serviceId = $scope.service.id;
            $scope.therapists = this.EntityDependencyService.filterTherapistsByService(this.session.therapists, serviceId);
        } else {
            $scope.therapists = [];
        }
    }

    private setupTherapist() {
        const $scope = this.$scope;
        let therapist: Therapist = this.suggestedService.therapist;
        if (!therapist) {
            if ($scope.therapists.length > 0) {
                therapist = $scope.therapists[0];
                this.suggestedService.therapist = therapist;
            } else {
                this.suggestedService.therapist = null;
            }
        }
    }

    private setupRooms() {
        let roomsForService: Room[];

        const service: Service = this.$scope.service;
        if (service) {
            roomsForService = this.EntityDependencyService.getRoomsAvailableForService(service.id, this.restrictions, this.categories, this.rooms);
        } else {
            roomsForService = this.rooms;
        }

        const therapist: Therapist = this.$scope.suggestedService.therapist;
        if (therapist) {
            this.$scope.rooms = this.Utils.sortRoomsForTherapist(roomsForService, therapist);
        } else {
            this.$scope.rooms = roomsForService;
        }
    }

}
