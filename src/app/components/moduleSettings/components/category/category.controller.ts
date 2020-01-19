import {Id} from '../../../../model/rest/Id';
import {Service} from '../../../../model/rest/Service';
import {ServiceCategory} from '../../../../model/rest/ServiceCategory';
import {DialogService} from '../../../../services/dialog/dialog.service';
import {ApiServiceCategoryService} from '../../../../services/api/api-service-category.service';
import {IToastrService} from 'angular-toastr';
import {AbstractController} from '../../../../controllers/abstract.controller';

export class CategoryController extends AbstractController{
    /** @ngInject */
    constructor(category: ServiceCategory,
                services: Service[],
                isEdit: boolean,
                $scope,
                _,
                $rootScope,
                $state: ng.ui.IStateService,
                $q: any,
                ApiServiceCategoryService: ApiServiceCategoryService,
                Restangular,
                toastr: IToastrService,
                DialogService: DialogService,
                RightSidebarConfig,
                UnsavedChanges,
                StateStack) {

        super(initForm(category, services, isEdit), $state, Restangular, _, DialogService, toastr, UnsavedChanges, StateStack);

        function initForm(category: ServiceCategory,
                          services: Service[],
                          isEdit) {

            $scope.modelParams = {
                elementTitle: 'Category',
                elementUrl: 'categories',
                elementList: 'auth.settings.categoryList',
            };

            $scope.isEdit = isEdit;
            $scope.model = category;

            if (isEdit) {
                UnsavedChanges.register($scope, $scope.category);
            }

            $scope.services = services;

            $scope.$on('$destroy', function () {
                $rootScope.blankServiceCategory = null;
            });

            return $scope;
        }

        function create() {
            return ApiServiceCategoryService.postServiceCategory($scope.model.name);
        }

        function update() {
            return ApiServiceCategoryService.putServiceCategory(category.id, $scope.model.name);
        }

        function handleIfNotUniqueName(err) {
            $scope.waitResponse = false;
            const status = err.data.status;
            if (status == 409) {
                $scope.ctrl.form.cName.$setValidity('notUniqueName', false);
            }
            return $q.reject(err);
        }

        function saveId(response: Id) {
            if (!category.id && response) {// save right after creation
                category.id = response.id;
            }
        }

        function saveServices() {
            const services: Service[] = $scope.model.services;
            const selectedServicesIds: number[] = services.map((service: Service) => service.id);
            return ApiServiceCategoryService.postService(category.id, selectedServicesIds);
        }


        function deleteCategory() {
            return ApiServiceCategoryService.deleteServiceCategory(category.id);
        }

        $scope.save = function () {
            toastr.clear();
            $scope.waitResponse = true;

            let promis;
            if ($scope.isEdit) {
                promis = update()
                    .then(null, handleIfNotUniqueName)
                    .then(saveServices)
                    .then(() => {
                        toastr.info('category updated successfully');
                        $scope.waitResponse = false;
                        UnsavedChanges.register($scope, $scope.category);
                        $state.go('auth.settings.categoryList');
                    });

            } else {
                promis = create()
                    .then(saveId, handleIfNotUniqueName)
                    .then(saveServices)
                    .then(() => {
                        toastr.info('category created successfully');
                        $state.go('auth.settings.categoryList');
                    });
            }

            promis.then(null, (err) => {
                $scope.waitResponse = false;
            });
        };

        $scope.onNameChange = () => {
            $scope.ctrl.form.cName.$setValidity('notUniqueName', true);
        };

        $scope.delete = function ($event) {
            toastr.clear();

            DialogService
                .dialogConfirm({
                    title: 'Delete Service Category',
                    textContent: 'Are you sure to delete Category "' + $scope.model.name + '"?',
                    targetEvent: $event,
                    cancel: 'Cancel',
                    ok: 'Delete',
                })
                .then(() => {
                    $scope.waitResponse = true;

                    deleteCategory()
                        .then(() => {
                            toastr.info('category deleted successfully');
                            UnsavedChanges.deregister();
                            $state.go('auth.settings.categoryList');
                        }, () => {
                            $scope.waitResponse = false;
                        });
                });
        };

        $scope.isUnsaved = () => {
            return UnsavedChanges.isChanged();
        };

    }
}

