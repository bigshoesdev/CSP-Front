import {AbstractController} from '../../../../controllers/abstract.controller';
import {IToastrService} from 'angular-toastr';
import {LoDashStatic} from '@types/lodash';
import {DialogService} from '../../../../services/dialog/dialog.service';
import {Session} from '../../../../model/rest/Session';
import {ApiReportsService} from '../../../../services/api/api-reports.service';
import {Room} from '../../../../model/rest/Room';
import {Client} from '../../../../model/rest/Client';
import {Report} from '../../../../model/rest/Report';
import {Utils} from '../../../../services/utils.service';
import {IAngularStatic} from 'angular';

declare let angular: IAngularStatic;

export class ReportController extends AbstractController {
    protected scope: any;

    /** @ngInject */
    constructor(isEdit: boolean,
                report: Report,
                sessions: Session[],
                $scope: any,
                _: LoDashStatic,
                $state: ng.ui.IStateService,
                Restangular,
                toastr: IToastrService,
                DialogService: DialogService,
                ApiReportsService: ApiReportsService,
                UnsavedChanges,
                Utils: Utils,
                StateStack) {
        super(initForm(), $state, Restangular, _, DialogService, toastr, UnsavedChanges, StateStack);

        function initForm(): any {
            $scope.modelParams = {
                elementTitle: 'Report',
                elementUrl: 'reports',
                elementList: 'auth.reports.reportList',
            };

            $scope.title = isEdit ? 'Report editing' : 'New Report';
            $scope.model = report;
            $scope.isEdit = isEdit;
            $scope.disableEdit = false;
            $scope.sessions = sessions;
            $scope.clients = $scope.therapists = $scope.rooms = [];

            $scope.displayRoomItem = (item: Room) => {
                return item && item.name;
            };

            $scope.displayItem = (item: Client) => {
                return item && item.firstName;
            };

            $scope.fetchRecordType = (type) => {
                switch (type) {
                    case 'rooms':
                        if (_.isEmpty($scope.rooms)) {
                            ApiReportsService.getRoomsBySessionId(type)
                                .then(value => {
                                    return $scope.rooms = value;
                                });
                        }
                        break;
                    case 'clients':
                        if (_.isEmpty($scope.clients)) {
                            ApiReportsService.getClientsBySessionId(type)
                                .then(value => {
                                    return $scope.clients = value;
                                });
                        }
                        break;
                    case 'therapists':
                        if (_.isEmpty($scope.therapists)) {
                            ApiReportsService.getTherapistsBySessionId(type)
                                .then(value => {
                                    return $scope.therapists = value;
                                });
                        }
                        break;
                    default:
                        return [];
                }
            };

            $scope.setDateType = (type) => {
                switch (type) {
                    case '1':   // singleDay
                        $scope.model.dateTo = undefined;
                        break;
                    case '2':
                        const session = $scope.model.session as Session;
                        $scope.model.dateFrom = session.startDate;
                        $scope.model.dateTo = session.endDate;
                        break;
                    case '3':
                        break;
                    default:
                        return;
                }
            };

            $scope.beforeSave = () => {

                if (!_.isNil($scope.model.dateFrom)) {
                    $scope.model.dateFrom = Utils.dateToFormat($scope.model.dateFrom);
                }

                if (!_.isNil($scope.model.dateTo)) {
                    $scope.model.dateTo = Utils.dateToFormat($scope.model.dateTo);
                }

                /**
                 * Seek to fieldArr in Report and set single field value
                 * @param {string} fieldArr
                 * @param {string} field
                 */
                const repeatReport = (fieldArr: string, field: string): Report[] => {
                    const reportList: Report[] = [];
                    if ($scope.model[fieldArr]) {
                        $scope.model[fieldArr].forEach((fieldItem: any) => {
                            const report: Report = angular.copy($scope.model);
                            report[field] = fieldItem;
                            reportList.push(report);
                        });
                    }
                    return reportList;
                };

                // check for selectAll option
                // prepare model for repeatReport func
                const {selectedAll = false, type} = $scope.model;

                if (selectedAll) {
                    $scope.fetchRecordType(type);
                    switch ($scope.model.type) {
                        case 'rooms':
                            $scope.model.rooms = $scope.rooms;
                            break;
                        case 'therapists':
                            $scope.model.therapists = $scope.therapists;
                            break;
                        case 'clients':
                            $scope.model.clients = $scope.clients;
                            break;
                    }
                }

                $scope.model = [].concat(
                    repeatReport('clients', 'client'),
                    repeatReport('rooms', 'room'),
                    repeatReport('therapists', 'therapist'),
                );
            }; // end beforeSave

            if (isEdit) {
                $scope.fetchRecordType(report.type);

                if (_.isEmpty(report.dateTo)) {
                    $scope.dateType = '1';
                } else if (Utils.dateToFormat(report.dateFrom) === report.session.startDate &&
                    Utils.dateToFormat(report.dateTo) === report.session.endDate) {
                    $scope.dateType = '2';
                } else {
                    $scope.dateType = '3';
                }

                UnsavedChanges.register($scope, $scope.room);
            } else {
                // create new report
                $scope.model.dateFrom = new Date();
            }

            return $scope;
        }

        this.scope = $scope;
    }

    /**
     * Late binding method to pass in abstractController
     */
    protected getScope() {
        return this.scope;
    }
}
