import {Equipment} from '../../../../model/rest/Equipment';
import {Room} from '../../../../model/rest/Room';
import {Id} from '../../../../model/rest/Id';
import {Restriction} from '../../../../model/rest/Restriction';
import {Service} from '../../../../model/rest/Service';
import {ServiceCategory} from '../../../../model/rest/ServiceCategory';
import {RestrictionType_Ns} from '../../../../model/rest/RestrictionType';
import RestrictionType = RestrictionType_Ns.RestrictionType;
import {DialogService} from '../../../../services/dialog/dialog.service';
import {IToastrService} from 'angular-toastr';
import {AbstractController} from "../../../../controllers/abstract.controller";

export class RestrictionController extends AbstractController {
    /** @ngInject */
    constructor(restriction: Restriction,
                equipments: Equipment[],
                rooms: Room[],
                services: Service[],
                serviceCategories: ServiceCategory[],
                isEdit: boolean,
                $scope,
                $state: ng.ui.IStateService,
                Restangular,
                toastr: IToastrService,
                _,
                DialogService: DialogService,
                $element,
                UnsavedChanges,
                StateStack) {

        super(initForm(restriction, equipments, rooms, services, serviceCategories, isEdit),
            $state, Restangular, _, DialogService, toastr, UnsavedChanges, StateStack);

        function initForm(restriction: Restriction,
                          equipments: Equipment[],
                          rooms: Room[],
                          services: Service[],
                          serviceCategories: ServiceCategory[],
                          isEdit) {

            $scope.modelParams = {
                elementTitle: 'Restriction',
                elementUrl: 'restriction',
                elementList: 'auth.settings.restrictionList',
            };

            $scope.isEdit = isEdit;
            $scope.model = restriction;

            if (isEdit) {
                UnsavedChanges.register($scope, $scope.model);
            }

            $scope.rooms = rooms;
            $scope.equipments = equipments;

            $element.find('#searchId').on('keydown', function (ev) {
                ev.stopPropagation(); // to available typing in the input field
            });

            const serviceLinkedObjects = _.map(services, (service) => {
                return {
                    id: 's_' + service.id, // to distinguish within Selector control
                    type: RestrictionType.service,
                    item: service
                };
            });
            const categotyLinkedObjects = _.map(serviceCategories, (serviceCategory) => {
                return {
                    id: 'c_' + serviceCategory.id, // to distinguish within Selector control
                    type: RestrictionType.category,
                    item: serviceCategory
                };
            });

            $scope.allLinkedObjects = _.concat(categotyLinkedObjects, serviceLinkedObjects);

            const linkedId = $scope.model.linkedId;

            $scope.linkedObject = _.find($scope.allLinkedObjects, (linkedObj) => {
                return linkedObj.item.id == linkedId;
            });

            return $scope;
        }

        $scope.displayItem = (item) => {
            return item && (item.item.name + ' (' + item.type + ')');
        };

        $scope.updateModelFromLinkedObject = () => {
            const linkedObject = $scope.linkedObject;
            if (linkedObject) {
                $scope.model.type = linkedObject.type;
                $scope.model.linkedId = linkedObject.item.id;
            }

            const fLinkedId = $scope.ctrl.form.fLinkedId;
            if (fLinkedId.$invalid) {
                fLinkedId.$setValidity('restrictionAlreadyExists', true);
            }

            const fName = $scope.ctrl.form.fName;
            if (fName.$invalid) {
                fName.$setValidity('notUniqueName', true); // todo distinguish it
            }
        };

        $scope.onNameChange = () => {
            $scope.ctrl.form.fName.$setValidity('notUniqueName', true);
            $scope.ctrl.form.fLinkedId.$setValidity('restrictionAlreadyExists', true); // todo distinguish it
        };

        function create() {
            const restriction = $scope.model;
            return Restangular
                .all('restriction')
                .post({
                    name: restriction.name,
                    type: restriction.type,
                    linkedId: restriction.linkedId
                });
        }

        function update() {
            const restriction = $scope.model;
            return Restangular
                .one('restriction', restriction.id)
                .customPUT({
                    name: restriction.name,
                    type: restriction.type,
                    linkedId: restriction.linkedId
                });
        }

        function saveRooms() {
            const selectedRoomsId = $scope.model.rooms.map((r: Room) => r.id);
            return Restangular
                .one('restriction', restriction.id)
                .one('rooms')
                .customPUT(selectedRoomsId);
        }

        function saveEquipments() {
            const selectedEquipmentId = $scope.model.equipments.map((e: Equipment) => e.id);
            return Restangular
                .one('restriction', restriction.id)
                .one('equipments')
                .customPUT(selectedEquipmentId);
        }

        function saveId(response: Id) {
            if (!$scope.model.id && response) {// save right after creation
                $scope.model.id = response.id;
            }
        }

        $scope.save = function () {
            toastr.clear();
            $scope.waitResponse = true;

            let promis;
            if (isEdit) {
                promis = update()
                    .then(null, handleError)
                    .then(saveRooms)
                    .then(saveEquipments)
                    .then(function (response) {
                        toastr.info('restriction updated successfully');
                        $scope.waitResponse = false;
                        UnsavedChanges.register($scope, $scope.model);
                        $state.go('auth.settings.restrictionList');
                    });

            } else {
                promis = create()
                    .then(saveId, handleError)
                    .then(saveRooms)
                    .then(saveEquipments)
                    .then(() => {
                        toastr.info('restriction created successfully');
                        $state.go('auth.settings.restrictionList');
                    }, handleError);
            }

            promis.then(null, (err) => {
                $scope.waitResponse = false;
            });
        };

        function handleError(err) {
            $scope.waitResponse = false;
            const status = err.data.status;
            if (status == 400 || status == 409) {
                // todo distinguish it
                $scope.ctrl.form.fName.$setValidity('notUniqueName', false);
                $scope.ctrl.form.fLinkedId.$setValidity('restrictionAlreadyExists', false);
            }
        }

    }
}

