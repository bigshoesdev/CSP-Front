import {Client} from '../../../../model/rest/Client';
import {CountriesRegions} from '../../../../services/countries-regions.service';
import {Utils} from '../../../../services/utils.service';
import {MdSelectType} from '../../../../model/rest/TherapistInfo';
import {IToastrService} from 'angular-toastr';
import {LoDashStatic} from '@types/lodash';
import {AbstractController} from "../../../../controllers/abstract.controller";

declare const angular: any;

export class ClientController extends AbstractController {
    private oldModel = {} as Client;

    /** @ngInject */
    constructor(UnsavedChanges: any,
                client: Client,
                $scope: any,
                CountriesRegions: CountriesRegions,
                _: LoDashStatic,
                DialogService,
                $state: any,
                StateStack: any,
                toastr: IToastrService,
                Utils: Utils,
                Restangular: any,
                isEdit: boolean) {

        super(initForm(), $state, Restangular, _, DialogService, toastr, UnsavedChanges, StateStack);

        this.oldModel = angular.copy(client);
        const self = this;

        function initForm() {

            $scope.modelParams = {
                elementTitle: 'Client',
                elementUrl: 'client',
                elementList: 'auth.settings.clientList',
            };

            $scope.isEdit = isEdit;
            $scope.countries = CountriesRegions.getCountriesAsObj();
            $scope.displayCountries = (item) => item && item.name;

            if (client.id) {
                fetchClientSessions(client.id);

                if (_.isEmpty(_.trim(client.firstName)) && !_.isEmpty(client.name)) {
                    const [firstName, ...rest] = client.name.split(' ');

                    client.firstName = firstName;
                    client.lastName = _.reduce(rest, function (memo: string, item: string) {
                        return memo + ' ' + item;
                    }, '');
                }

                if (!_.isEmpty(client.country)) {
                    client.country = CountriesRegions.getCountryFromList(
                        client.country as string,
                        $scope.countries
                    );

                    $scope.regions = CountriesRegions.getRegionsAsObj(client.country as MdSelectType);
                }

                if (!_.isEmpty(client.state)) {

                    client.state = CountriesRegions.getRegionObj(
                        client.state as string,
                        $scope.regions
                    );
                }

                client.birthday = _.isNil(client.birthday) ? undefined : client.birthday;
                client.clientSince = _.isNil(client.clientSince) ? undefined : client.clientSince;

                UnsavedChanges.register($scope, $scope.category);
            }

            $scope.model = client;

            return $scope;
        }

        function fetchClientSessions(clientId) {
            Restangular.all(`/client/${clientId}/sessions`)
                .getList()
                .then((o) => o.plain())
                .then(results => {
                    $scope.sessions = results;
                });
        }

        function saveClient(client: Client) {
            if (_.isEmpty(client)) {
                return;
            }

            return ($scope.isEdit) ?
                Restangular.one('client', client.id).customPUT(client) :
                Restangular.all('client').post(client);
        }

        $scope.clientSessionClick = (sessionID) => {
            $state.go('auth.sessions.sessionEdit', {sessionId: sessionID});
        };

        $scope.getRegions = () => {
            const {country} = $scope.model;
            $scope.regions = CountriesRegions.getRegionsAsObj(country);
        };

        $scope.isDisableRegions = () => {
            const {regions} = $scope;
            return !(regions && regions.length > 0);
        };

        $scope.checkEmail = () => {
            const {email} = $scope.model;

            if (!_.isEmpty(email)) {
                if ($scope.isEdit && _.isEqual(email, self.oldModel.email)) {
                    $scope.ctrl.form.cEmail.$setValidity('unique', true);
                    return;
                }

                $scope.waitResponse = true;

                Restangular
                    .all('client/checkEmail')
                    .customPOST(email)
                    .then((val) => {
                        $scope.ctrl.form.cEmail.$setValidity('unique', val);
                        $scope.waitResponse = false;
                    });
            }
        };

        $scope.save = () => {
            toastr.clear();
            $scope.waitResponse = true;
            const client = angular.copy($scope.model);

            client.name = client.firstName + ' ' + (client.lastName || '');

            if (!_.isNil(client.country)) {
                client.country = client.country.name;
            }

            if (!_.isNil(client.state)) {
                client.state = client.state.name;
            }
            if (!_.isNil(client.birthday)) {
                client.birthday = Utils.dateToFormat(client.birthday);
            }

            if (!isEdit) {
                saveClient(client).then(() => {
                    toastr.info('client created successfully');
                    UnsavedChanges.register($scope, client);
                    $state.go('auth.settings.clientList');
                    $scope.waitResponse = false;
                }, () => {
                    $scope.waitResponse = false;
                });
            } else {
                saveClient(client).then(() => {
                    toastr.info('client updated successfully');
                    $scope.waitResponse = false;
                    UnsavedChanges.register($scope, client);
                    $state.go('auth.settings.clientList');
                }).then(null, () => {
                    $scope.waitResponse = false;
                });
            }
        };
    }
}
