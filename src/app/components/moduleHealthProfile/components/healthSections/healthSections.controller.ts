import {IHealthSectionTableConf} from '../../directives/healthSectionTable/healthSectionTable.directive';
import {Client} from '../../../../model/rest/Client';
import {HealthSection} from '../../../../model/rest/HealthSection';
import {HsRow} from '../../../../model/rest/HsRow';
import {HsFlagColumn} from '../../../../model/rest/HsFlagColumn';
import {HsConditionColumn} from '../../../../model/rest/HsConditionColumn';
import {HsColumn} from '../../../../model/rest/HsColumn';
import {HsType_Ns} from '../../../../model/rest/HsType';
import {ClientStatus_Ns} from '../../../../model/rest/ClientStatus';
import HsType = HsType_Ns.HsType;
import ClientStatus = ClientStatus_Ns.ClientStatus;
import * as restangular from 'restangular';

declare let angular: any;

export class HealthSectionsController {
    /** @ngInject */
    constructor(sessionId: number,
                clientId: number,
                client: Client,
                status: {status: string},
                healthSections: HealthSection[],
                rows: HsRow[],
                flagColumns: HsFlagColumn[],
                conditionColumns: HsConditionColumn[],
                canEditData,
                canEditUi,
                $scope, StateStack, $window: ng.IWindowService, $interpolate, Restangular: restangular.IService, $state: ng.ui.IStateService, _) {

        initForm();

        function initForm() {
            $scope.canEditData = canEditData;
            $scope.canEditUi = canEditUi;
            $scope.client = client;

            $scope.status = status.status;

            $scope.healthSections = healthSections;
            $scope.hsTableConfigs = healthSections.map((healthSection: HealthSection): IHealthSectionTableConf => {
                const sectionColumns: HsColumn[] = healthSection.columns.filter((col: HsColumn) => col.position != null);
                const hsType: HsType = healthSection.type;
                const sectionRows: HsRow[] = rows.filter((row: HsRow) => {
                    return row.clientId == clientId
                        && row.sessionId == sessionId
                        && row.section == hsType;
                });
                const flagColumn: HsFlagColumn = _.find(flagColumns, (flagColumn: HsFlagColumn) => flagColumn.sectionType == hsType);
                const conditionColumn: HsConditionColumn = _.find(conditionColumns, (conditionColumn: HsConditionColumn) => conditionColumn.sectionType == hsType);

                return {
                    sessionId: sessionId,
                    clientId: clientId,
                    sectionType: hsType,

                    columns: sectionColumns,
                    rows: sectionRows,

                    flagColumn: flagColumn,
                    conditionColumn: conditionColumn
                };
            });

            $scope.healthProfileUrl = $interpolate($window.__env.healthProfileUrlTemplate)({clientId: client.id});
        }

        function isEditStatus() {
            return $scope.status === ClientStatus.edit;
        }
        $scope.isEditMode = () => $scope.canEditData && isEditStatus();
        $scope.isUiMode = () => $scope.canEditUi && isEditStatus();
        $scope.isEditBtnShown = () => ($scope.canEditData || $scope.canEditUi) && !isEditStatus();

        $scope.back = () => {
            StateStack.goBack();
        };
        $scope.complete = () => {
            putStatus(ClientStatus.done).then(() => {
                $state.go('auth.healthProfile.sessionClients');
            });

        };
        $scope.edit = () => {
            putStatus(ClientStatus.edit).then(() => {
                $scope.status = ClientStatus.edit;
            });
        };

        function putStatus(status) {
            // PUT /healthTable/session/{sessionId}/client/{clientId}/status
            return Restangular
                .one('healthTable/session', sessionId)
                .one('client', clientId)
                .one('status')
                .customPUT({
                    status: status
                });
        }

        $scope.customizeSection = (sectionType: string) => {
            $state.go('auth.healthProfile.healthSectionEditColumns', {
                sectionType: sectionType
            });
        };

    }
}
