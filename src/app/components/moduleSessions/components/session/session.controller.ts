import {IAutocompleteListConf} from '../../../../directives/autocompleteList/autocompleteList.directive';
import {Id} from '../../../../model/rest/Id';
import {Session} from '../../../../model/rest/Session';
import {Therapist} from '../../../../model/rest/Therapist';
import {DialogService} from '../../../../services/dialog/dialog.service';
import {Utils} from '../../../../services/utils.service';
import {ApiSettingsService} from '../../../../services/api/api-settings.service';
import {IToastrService} from 'angular-toastr';
import {AbstractController} from "../../../../controllers/abstract.controller";

export class SessionController extends AbstractController {
    /** @ngInject */
    constructor(session: Session,
                therapists: Therapist[],
                isEdit: boolean,
                $scope,
                $state: ng.ui.IStateService,
                Restangular,
                toastr: IToastrService,
                DialogService: DialogService,
                ApiSettingsService: ApiSettingsService,
                Utils: Utils,
                $q: any,
                _,
                UnsavedChanges,
                StateStack,
                ) {

        super(initForm(), $state, Restangular, _, DialogService, toastr, UnsavedChanges, StateStack);

        const now = new Date();

        function initForm() {
            $scope.modelParams = {
                elementTitle: 'Session',
                elementUrl: 'session',
                elementList: 'auth.sessions.sessionList',
            };

            $scope.isEdit = isEdit;
            $scope.model = session;

            $scope.model.startDate = Utils.initDateFromStr(session.startDate) || now;
            $scope.model.endDate = Utils.initDateFromStr(session.endDate) || now;

            if (isEdit) {
                UnsavedChanges.register($scope, $scope.model);
            }

            return $scope;
        }

        $scope.convertDate2Model = (date) => Utils.dateToFormat(date);

        $scope.autocompleteClientsConfig = {
            collectedItems: $scope.model.clients,
            getMatchesPromise: (searchText) => {
                if (!searchText || searchText.length < 3) {
                    return $q.reject();
                }
                return ApiSettingsService.findClients(searchText);
            },
            onItemsChanged: () => {
                session.clients = $scope.autocompleteClientsConfig.collectedItems;
            },
            removeConfirmPromise: (excludedItem, $event) => {
                return DialogService.dialogConfirm({
                    title: 'Note',
                    textContent: 'Are you sure to remove the client from session? ' +
                    'All of the proposed therapy, and notes on health ' +
                    'made during the session for the client will be lost.',
                    targetEvent: $event,
                    cancel: 'Cancel',
                    ok: 'Remove'
                });
            },
            minLength: 3,
            floatingLabel: 'Search to add clients',
            noCache: true,
            delay: 100,
            autoselect: true
        } as IAutocompleteListConf;

        $scope.autocompleteTherapistsConfig = {
            collectedItems: $scope.model.therapists,
            getMatchesPromise: (searchText) => {
                return $q((resolve, reject) => {
                    const text = searchText && searchText.toLowerCase();
                    const filtered = therapists.filter((t) => _.includes(t.name.toLowerCase(), text));
                    return resolve(filtered);
                });
            },
            onItemsChanged: () => {
                session.therapists = $scope.autocompleteTherapistsConfig.collectedItems;
            },
            minLength: 1,
            floatingLabel: 'Search to add therapists',
            noCache: true,
            delay: 100,
            autoselect: true
        } as IAutocompleteListConf;

        /**
         * Validate Session date to perform
         */
        function updateSessionModel() {

            $scope.model.startDate = Utils.formatDate($scope.model.startDate);
            $scope.model.endDate = Utils.formatDate($scope.model.endDate);

            (Utils.dateUnixDiff($scope.model.startDate, $scope.model.endDate) < 0) ?
                $scope.ctrl.form.fEndDate.$setValidity('dateIsLess', false) :
                $scope.ctrl.form.fEndDate.$setValidity('dateIsLess', true);
        }

        function create() {
            return Restangular
                .all('session')
                .post($scope.model);
        }

        function update() {
            return Restangular
                .one('session', session.id)
                .customPUT($scope.model);
        }

        function saveId(response: Id) {
            if (!$scope.model.id && response) {// save right after creation
                $scope.model.id = response.id;
            }
        }

        $scope.save = function () {
            toastr.clear();
            let promis;

            updateSessionModel();

            $scope.waitResponse = true;
            if (isEdit) {
                promis = update()
                    .then(function (response) {
                        toastr.info('session updated successfully');
                        $scope.waitResponse = false;
                        UnsavedChanges.register($scope, $scope.model);
                        $state.go('auth.sessions.sessionList');
                    });
            } else {
                promis = create()
                    .then(saveId)
                    .then(() => {
                        toastr.info('session created successfully');
                        $state.go('auth.sessions.sessionList');
                    });
            }

            promis.then(null, (err) => {
                $scope.waitResponse = false;
                if (err.data.status == 409) {
                    $scope.ctrl.form.fName.$setValidity('alreadyExists', false);
                    $scope.ctrl.form.fStartDate.$setValidity('alreadyExists', false); // todo distinguish it
                    $scope.ctrl.form.fEndDate.$setValidity('alreadyExists', false); // todo distinguish it
                }
            });
        };

        $scope.onChangeUniqueness = () => {
            $scope.ctrl.form.fName.$setValidity('alreadyExists', true);
            $scope.ctrl.form.fStartDate.$setValidity('alreadyExists', true); // todo distinguish it
            $scope.ctrl.form.fEndDate.$setValidity('alreadyExists', true); // todo distinguish it
        };

    }
}

