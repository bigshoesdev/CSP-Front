import * as restangular from 'restangular';
import {LoDashStatic} from '@types/lodash';
import {HtColumn} from '../../../../model/rest/HtColumn';
import {IHtData} from '../../../../model/rest/IHtData';
import {HtDataItem} from '../../../../model/rest/HtDataItem';
import {HtColumnType_Ns} from '../../../../model/rest/HtColumnType';
import {ClientStatus_Ns} from '../../../../model/rest/ClientStatus';
import HtColumnType = HtColumnType_Ns.HtColumnType;
import ClientStatus = ClientStatus_Ns.ClientStatus;

export interface IHealthTableModel {
    columns: HtColumn[];
    data: IHtData[];
}

/** @ngInject */
export function healthTable($q: any,
                            Restangular: restangular.IService,
                            _: LoDashStatic,
                            $state) {
    return {
        templateUrl: 'app/components/moduleHealthProfile/directives/healthTable/healthTable.html',
        restrict: 'A',
        scope: {
            sessionId: '=healthTable',
            canEditData: '=healthTableEdit',
            canEditUi: '=healthTableUi',

        },
        link: function postLink(scope, iElement, iAttrs, controller) {

            scope.model = {
                columns: [],
                data: []
            };

            scope.$watch('sessionId', (sessionId, prevSessionId) => {
                if (sessionId < 0) {
                    return;
                }

                $q.all({
                    columns: getColumns(),
                    data: getClientsData(sessionId)
                }).then((model: IHealthTableModel) => {
                    // init empty data cell
                    const columns: HtColumn[] = model.columns;
                    const data: IHtData[] = model.data;

                    data.forEach((clientData: IHtData) => {
                        columns.forEach((column: HtColumn) => {
                            const columnId = column.id;
                            const foundItem = _.find(clientData.values, (clientDataItem: HtDataItem) => clientDataItem.columnId == columnId);
                            if (!foundItem) {
                                clientData.values.push({
                                    columnId: columnId,
                                    textValue: null,
                                    selectValue: null
                                });
                            }
                        });
                    });

                    scope.model = model;
                });

            });

            scope.htChange = (column: HtColumn, clientData: IHtData) => {
                if (column.type !== HtColumnType.custom) {
                    return; // save only custom fields in HealthTable
                }

                const columnId = column.id;
                const clientDataItem: HtDataItem = _.find(clientData.values, (value: HtDataItem) => value.columnId === columnId);

                return Restangular // PUT /healthTable/session/{sessionId}/client/{clientId}/value
                    .one('healthTable/session', scope.sessionId)
                    .one('client', clientData.clientId)
                    .one('column', columnId)
                    .one('value')
                    .customPUT(clientDataItem);
            };


            function getColumns() {
                return Restangular
                    .all('healthTable/columns')
                    .getList()
                    .then(getPlain);
            }

            function getClientsData(sessionId) {
                return Restangular
                    .one('healthTable/session', sessionId)
                    .one('data')
                    .get()
                    .then(getPlain);
            }

            function getPlain(o) {
                return o && o.plain() || o;
            }

            scope.customizeColumn = (column: HtColumn) => {
                $state.go('auth.healthProfile.sessionClients.editCustomColumns');
            };

            scope.getStatusValue = (clientData: IHtData) => {
                const statusColumn: HtColumn = _.find(scope.model.columns, (column: HtColumn) => column.type === HtColumnType.status);
                const statusColumnId = statusColumn.id;
                const statusDataItem: HtDataItem = _.find(clientData.values, (value: HtDataItem) => value.columnId === statusColumnId);
                return statusDataItem.textValue;
            };

            scope.isView = (statusValue: string) => {
                return statusValue === ClientStatus[ClientStatus.done];
            };

            scope.viewOrEdit = (clientData: IHtData) => {
                $state.go('auth.healthProfile.healthSections', {
                    sessionId: scope.sessionId,
                    clientId: clientData.clientId
                });
            };

        }
    };
}
