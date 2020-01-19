import {Id} from '../model/rest/Id';

export abstract class AbstractController {
    protected scope: any;

    constructor($scope: any,
                $state,
                Restangular,
                _,
                DialogService,
                toastr,
                UnsavedChanges,
                StateStack) {
        this.scope = $scope; // for LateBinding
        const {modelParams, isEdit, model} = this.getScope();

        $scope.disableEdit = !(!isEdit && _.isNil(model.id)) || (isEdit && !_.isNil(model.id));

        $scope.edit = () => {
            $scope.isEdit = true;
            $scope.disableEdit = false;
            getTitle();
        };

        $scope.save = () => {
            toastr.clear();
            $scope.waitResponse = true;

            if ($scope.beforeSave) {
                $scope.beforeSave();
            }

            // we can change the model in beforeSave method
            const model = this.getScope().model;

            const promise = isEdit ?

                saveEvent(model)
                    .then(() => {
                        toastr.info(`${modelParams.elementTitle} updated successfully`);
                        $scope.waitResponse = false;
                        UnsavedChanges.register($scope, model);
                        $state.go(modelParams.elementList);
                    })

                : createEvent(model)
                    .then(saveId)
                    .then(() => {
                        toastr.info(`${modelParams.elementTitle} created successfully`);
                        $state.go(modelParams.elementList);
                    });

            promise.then(null, () => {
                $scope.waitResponse = false;
            });
        };

        $scope.cancel = () => {
            if (!isEdit && StateStack.canGoBack()) {
                StateStack.goBack();
            } else {
                $state.go(modelParams.elementList);
            }
        };

        $scope.delete = function ($event) {
            toastr.clear();

            DialogService
                .dialogConfirm({
                    title: `Delete ${modelParams.elementTitle}`,
                    textContent: `Are you sure to delete ${modelParams.elementTitle} ?`,
                    targetEvent: $event,
                    cancel: 'Cancel',
                    ok: 'Delete'
                })
                .then(() => {
                    $scope.waitResponse = true;

                    deleteEventType()
                        .then(() => {
                            toastr.info(`${modelParams.elementTitle} deleted successfully`);
                            UnsavedChanges.deregister();
                            $state.go(modelParams.elementList);
                        }, () => {
                            $scope.waitResponse = false;
                        });
                });
        };

        $scope.isUnsaved = () => {
            return UnsavedChanges.isChanged();
        };

        const getTitle = () => {
            $scope.title = $scope.disableEdit ? `Show ${modelParams.elementTitle}`
                : $scope.isEdit
                    ? `Edit ${modelParams.elementTitle}`
                    : `New ${modelParams.elementTitle}`;
        };

        const saveEvent = (model: any) => {
            return Restangular
                .one(modelParams.elementUrl, model.id)
                .customPUT(model);
        };

        const createEvent = (model: any) => {
            return Restangular
                .all(modelParams.elementUrl)
                .post(model);
        };

        const deleteEventType = () => {
            return Restangular
                .one(modelParams.elementUrl, model.id)
                .remove();
        };

        const saveId = (response: Id) => {
            if (!model.id && response) {// save right after creation
                model.id = response.id;
            }
        };

        getTitle();
    }

    protected getScope() {
        return this.scope;
    }

    protected getPlain(o) {
        return o && o.plain() || o;
    }
}
