import {Room} from '../../../../model/rest/Room';
import {Event} from '../../../../model/rest/Event';
import {Service} from '../../../../model/rest/Service';
import {ServiceCategory} from '../../../../model/rest/ServiceCategory';
import {Therapist} from '../../../../model/rest/Therapist';
import {EventRecord} from '../../../../model/rest/EventRecord';
import {MdSelectType, TherapistInfo} from '../../../../model/rest/TherapistInfo';
import {CountriesRegions} from '../../../../services/countries-regions.service';
import {Utils} from '../../../../services/utils.service';
import * as restangular from 'restangular';
import {IToastrService} from 'angular-toastr';
import {LoDashStatic} from '@types/lodash';
import {AbstractController} from "../../../../controllers/abstract.controller";

declare const angular: any;

export class TherapistController extends AbstractController {
    private oldModel = {} as Therapist;

    /** @ngInject */
    constructor(isEdit: boolean,
                therapist: Therapist,
                categories: ServiceCategory[],
                services: Service[],
                events: Event[],
                rooms: Room[],
                CountriesRegions: CountriesRegions,
                $scope: any,
                $state: any,
                StateStack: any,
                Restangular: restangular.IService,
                toastr: IToastrService,
                UnsavedChanges: any,
                _: LoDashStatic,
                $q: any,
                Utils: Utils,
                DialogService,
                moment: any) {

        super(initForm(therapist, categories, services, events, rooms, isEdit), $state, Restangular, _, DialogService, toastr, UnsavedChanges, StateStack);

        this.oldModel = angular.copy(therapist);
        const self = this;

        function initForm(therapist: Therapist,
                          categories: ServiceCategory[],
                          services: Service[],
                          events: Event[],
                          rooms: Room[],
                          isEdit: boolean) {

            $scope.modelParams = {
                elementTitle: 'Therapist',
                elementUrl: 'therapist',
                elementList: 'auth.settings.therapistList',
            };

            $scope.categories = categories;
            $scope.services = services;
            $scope.rooms = rooms;
            $scope.isEdit = isEdit;
            $scope.countries = CountriesRegions.getCountriesAsObj();

            $scope.allEventRecords = _.map(events, (event: Event): EventRecord => {
                return {
                    event: event,
                    capacity: 0
                };
            });

            if (!_.isNil(therapist.id)) {

                if (_.isNil(therapist.therapistInfo)) {
                    therapist.therapistInfo = {
                        firstName: ''
                    } as TherapistInfo;
                }

                if (!_.isEmpty(therapist.therapistInfo.country)) {
                    therapist.therapistInfo.country = CountriesRegions.getCountryFromList(
                        therapist.therapistInfo.country as string,
                        $scope.countries
                    );
                }

                if (!_.isEmpty(therapist.therapistInfo.state)) {
                    $scope.regions = CountriesRegions.getRegionsAsObj(therapist.therapistInfo.country as MdSelectType);
                    therapist.therapistInfo.state = CountriesRegions.getRegionObj(
                        therapist.therapistInfo.state as string,
                        $scope.regions
                    );
                }

                if (_.isEmpty(therapist.therapistInfo.firstName) && !_.isEmpty(therapist.name)) {
                    const names: Array<string> = therapist.name.split(' ');
                    therapist.therapistInfo.firstName = names[0];
                    therapist.therapistInfo.lastName = (_.isEmpty(names[1])) ? '' : names[1];
                }
                // avoid id from models for UnsavedChanges detection
                therapist.events.forEach((eventRecord: EventRecord) => delete eventRecord.id);

                // update capacity for generated allEventRecords
                therapist.events.forEach((er: EventRecord) => {
                    const eventId = er.event.id;
                    $scope.allEventRecords.forEach((allEr: EventRecord) => {
                        if (allEr.event.id === eventId) {
                            allEr.capacity = er.capacity;
                        }
                        return allEr;
                    });
                });

            } else {
                therapist.email = '';
                therapist.events = [];
                therapist.preferredRooms = [];
                therapist.serviceCategories = [];
                therapist.services = [];
            }

            $scope.model = therapist;

            $scope.checkEmail = () => {
                const {email} = $scope.model;

                if (!_.isEmpty(email)) {
                    if ($scope.isEdit && _.isEqual(email, self.oldModel.email)) {
                        $scope.ctrl.form.cEmail.$setValidity('unique', true);
                        return;
                    }

                    $scope.waitResponse = true;

                    Restangular
                        .all('therapist/checkEmail')
                        .customPOST(email)
                        .then((val) => {
                            $scope.ctrl.form.cEmail.$setValidity('unique', val);
                            $scope.waitResponse = false;
                        });
                }
            };

            $scope.minDate = $scope.maxDate = moment(new Date()).subtract(100, 'year');
            $scope.maxDate = moment(new Date()).subtract(18, 'year');
            UnsavedChanges.register($scope, therapist);
            return $scope;
        }

        function saveCategories() {
            const selectedCategoriesId = $scope.model.serviceCategories.map((o: ServiceCategory) => o.id);
            return Restangular
                .one('therapist', $scope.model.id)
                .one('categories')
                .customPUT(selectedCategoriesId);
        }

        function saveServices() {
            const selectedServicesId = $scope.model.services.map((o: Service) => o.id);
            return Restangular
                .one('therapist', $scope.model.id)
                .one('services')
                .customPUT(selectedServicesId);
        }

        function saveEvents() {
            const eventObjects = _.map($scope.model.events, (eventRecord: EventRecord) => {
                return {
                    eventId: eventRecord.event.id,
                    capacity: eventRecord.capacity
                };
            });
            return Restangular
                .one('therapist', $scope.model.id)
                .one('events')
                .customPUT(eventObjects);
        }

        function savePreferredRooms() {
            const selectedRoomsId = $scope.model.preferredRooms.map((o: Room) => o.id);
            return Restangular.one('therapist', $scope.model.id)
                .one('rooms').customPUT(selectedRoomsId);
        }

        function saveTherapist(therapist: Therapist) {
            if (_.isEmpty(therapist)) {
                return;
            }

            return ($scope.isEdit) ?
                Restangular.one('therapist', therapist.id).customPUT(therapist) :
                Restangular.all('therapist').post(therapist);
        }

        function getPlain(o: any) {
            return o && o.plain() || o;
        }

        $scope.displayEvent = (event: EventRecord) => event && event.event.name;

        $scope.getRegions = () => {
            const {country} = $scope.model.therapistInfo;
            $scope.regions = CountriesRegions.getRegionsAsObj(country);
        };

        $scope.isDisableRegions = () => {
            const {regions} = $scope;
            return !(regions && regions.length > 0);
        };

        $scope.save = () => {
            toastr.clear();
            $scope.waitResponse = true;
            const therapist = angular.copy($scope.model);
            /**
             * We can save new therapist without fields below
             * I added require validation in conditional expression
             */

            therapist.name = therapist.therapistInfo.firstName + ' ' + (therapist.therapistInfo.lastName || '');

            if (!_.isNil(therapist.therapistInfo.country)) {
                therapist.therapistInfo.country = therapist.therapistInfo.country.name;
            }

            if (!_.isNil(therapist.therapistInfo.state)) {
                therapist.therapistInfo.state = therapist.therapistInfo.state.name;
            }
            if (!_.isNil(therapist.therapistInfo.birthday)) {
                therapist.therapistInfo.birthday = Utils.dateToFormat(therapist.therapistInfo.birthday);
            }

            if (!$scope.isEdit) {
                saveTherapist(therapist)
                    .then(getPlain)
                    .then((data: { id: number }) => {
                        $scope.model.id = data.id;
                        return $q.all(
                            [
                                saveCategories(),
                                saveServices(),
                                saveEvents(),
                                savePreferredRooms(),
                            ]
                        ).then(() => {
                            toastr.info('therapist updated successfully');
                            UnsavedChanges.register($scope, therapist);
                            $state.go('auth.settings.therapistList');
                            $scope.waitResponse = false;
                        });
                    }, () => {
                        $scope.waitResponse = false;
                    });
            } else {
                $q.all([
                    saveCategories(),
                    saveServices(),
                    saveEvents(),
                    savePreferredRooms(),
                    saveTherapist(therapist)
                ]).then(() => {
                    toastr.info('therapist updated successfully');
                    $scope.waitResponse = false;
                    UnsavedChanges.register($scope, therapist);
                    $state.go('auth.settings.therapistList');
                }).then(null, () => {
                    $scope.waitResponse = false;
                });
            }
        };

    }
}

