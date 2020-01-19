import {Id} from '../../../../model/rest/Id';
import {PreliminaryEvent} from '../../../../model/rest/PreliminaryEvent';
import {Session} from '../../../../model/rest/Session';
import {Restriction} from '../../../../model/rest/Restriction';
import {Therapist} from '../../../../model/rest/Therapist';
import {Service} from '../../../../model/rest/Service';
import {ServiceCategory} from '../../../../model/rest/ServiceCategory';
import {Collection} from '../../../../model/Collection';
import {Room} from '../../../../model/rest/Room';
import {dateFormat} from '../../../../services/app.constant';
import * as restangular from 'restangular';
import {IToastrService} from 'angular-toastr';
import {Utils} from "../../../../services/utils.service";
import {ApiSuggestedServicesService} from "../../../../services/api/api-suggested-services.service";
import {DataCacheService} from "../../../../services/storage/data-cache.service";
import {ApiInjectableBaseService} from "../../../../services/api/api-injectable-base.service";
import {EntityDependencyService} from "../../../../services/entity-dependency.service";
import {DialogService} from "../../../../services/dialog/dialog.service";

declare let angular: any;

/** @ngInject */
export function suggestedForm($state: ng.ui.IStateService,
                              Restangular: restangular.IService,
                              toastr: IToastrService,
                              DialogService: DialogService,
                              UnsavedChanges,
                              StateStack,
                              Utils: Utils,
                              _,
                              EntityDependencyService: EntityDependencyService,
                              ApiInjectableBaseService: ApiInjectableBaseService,
                              DataCacheService: DataCacheService,
                              ApiSuggestedServicesService: ApiSuggestedServicesService,
                              moment,
                              $q) {
    return {
        restrict: 'EA',
        templateUrl: 'app/components/moduleSuggestedServices/directives/suggestedForm/suggestedForm.html',
        scope: {
            clientData: ' = ',
            currentService: ' = ',
            tableData: ' = ',
            onChangedCb: '&',
            session: '='
        },
        link: function (scope, iElement, iAttributes) {
            const client = scope.clientData.client;
            const sugService: PreliminaryEvent = scope.currentService;
            const rooms: Room[] = scope.tableData.rooms;
            const restrictions: Restriction[] = scope.tableData.restrictions;
            const categories: ServiceCategory[] = scope.tableData.categories;
            const session: Session = scope.session;

            initForm(sugService);

            if (sugService.client) {
                scope.updateTable = false;
            }

            function initForm(sugService: PreliminaryEvent) {
                scope.startDate = Utils.initDateFromStr(session.startDate, dateFormat);
                scope.endDate = Utils.initDateFromStr(session.endDate, dateFormat);
                scope.date = (sugService.service) ? Utils.initDateFromStr(sugService.date, dateFormat) : new Date();
                scope.updateTable = true;

                if (sugService.note == null) {
                    sugService.note = '';
                }
                sugService.date = scope.date;

                scope.sugService = sugService;

                setupServices();
                setupService();

                setupTherapists();
                setupTherapist();

                setupRooms();

                if (sugService.client) {
                    UnsavedChanges.register(scope, scope.sugService);
                }
            }

            function setupServices() {
                const id2Service: Collection<Service> = session
                    .therapists
                    .reduce((id2Service: Collection<Service>, therapist: Therapist): Collection<Service> => {
                        return EntityDependencyService.collectServicesAndCategories(therapist.serviceCategories, therapist.services, id2Service);
                    }, {});
                scope.services = _.map(id2Service, s => s);
            }

            function setupService() {
                const service: Service = scope.sugService.service;
                if (!service) {
                    sugService.service = null;
                }
            }

            function setupTherapists() {
                scope.therapists = scope.sugService.service
                    ? EntityDependencyService.filterTherapistsByService(session.therapists, scope.sugService.service.id)
                    : [];
            }

            function setupTherapist() {
                let therapist: Therapist = sugService.therapist;

                if (!therapist) {
                    if (scope.therapists.length > 0) {
                        therapist = scope.therapists[0];
                        sugService.therapist = therapist;
                    } else {
                        sugService.therapist = null;
                    }
                }
            }

            function setupRooms() {
                const service: Service = scope.sugService.service;
                const roomsForService: Room[] = (service)
                    ? EntityDependencyService.getRoomsAvailableForService(service.id, restrictions, categories, rooms)
                    : rooms;

                const therapist: Therapist = scope.sugService.therapist;
                scope.rooms = therapist
                    ? Utils.sortRoomsForTherapist(roomsForService, therapist)
                    : roomsForService;
            }

            function removeSugService() {
                const index = scope.clientData.services.indexOf(scope.currentService);
                scope.clientData.services.splice(index, 1);
            }

            function updateForm() {
                scope.onChangedCb && scope.onChangedCb();
                scope.updateTable = false;
                scope.waitResponse = false;
            }

            scope.listenEvents = function (e) {
                e.keyCode === 27 && scope.cancel();
            };

            scope.updateService = (service: Service) => {
                if (service) {
                    setupTherapists();
                    setupRooms();
                }
            };

            scope.updateTherapist = () => {
                setupRooms();
            };

            scope.displayName = (o) => o && o.name;

            scope.convertDate2Model = (date) => Utils.dateToFormat(date);

            scope.fDate = (date: string) => Utils.formatDate(date);

            scope.cancel = function () {
                if (scope.currentService.client.id && scope.currentService.service.id) {
                    scope.onChangedCb && scope.onChangedCb();
                    scope.updateTable = false;
                } else {
                    scope
                        .clientData
                        .services
                        .splice(-1, 1);
                    scope.onChangedCb && scope.onChangedCb();
                }
            };

            scope.edit = function () {
                scope.updateTable = true;
                // updateServices();
            };

            scope.remove = function ($event) {
                toastr.clear();

                DialogService
                    .dialogConfirm({
                        title: 'Delete Suggested Service',
                        textContent: 'Are you sure to delete the Suggested Service: "' + scope.sugService.note + '"?',
                        targetEvent: $event,
                        cancel: 'Cancel',
                        ok: 'Delete'
                    })
                    .then(() => {
                        scope.waitResponse = true;
                        const {id} = scope.currentService;
                        ApiSuggestedServicesService.deletePreliminaryEvent(id)
                            .then(() => {
                                toastr.info('Suggested Service deleted successfully');
                                UnsavedChanges.deregister();
                                removeSugService();
                            }, (err) => {
                                scope.waitResponse = false;
                            });
                    });
            };

            scope.save = function () {
                toastr.clear();
                scope.waitResponse = true;
                const currentService = angular.copy(scope.sugService);
                currentService.date = Utils.formatDate(currentService.date);
                let promis;

                if (scope.sugService.client) {
                    promis = ApiSuggestedServicesService.putClientServiceDataItem(scope.session.id, scope.sugService.client.id, scope.sugService.service.id, currentService)
                        .then(() => {
                            toastr.info('suggestedService updated successfully');
                            scope.waitResponse = false;
                            UnsavedChanges.register(scope, scope.sugService);
                            updateForm();
                        });
                } else {
                    promis = ApiSuggestedServicesService.postClientServiceDataItem(scope.session.id, client.id, currentService)
                        .then((response: Id) => {
                            toastr.info('suggestedService created successfully');
                            updateForm();
                        });
                }

                promis.then(null, (err) => {
                    scope.waitResponse = false;
                });
            };
        }
    };
}
