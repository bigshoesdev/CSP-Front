import {LocalStorageService} from '../../../../services/storage/local-storage.service';
import {Client} from '../../../../model/rest/Client';
import {SsTableColumn} from '../../../../model/rest/SsTableColumn';
import {SessionSsClientData} from '../../../../model/rest/SessionSsClientData';
import {Session} from '../../../../model/rest/Session';
import {SessionClientDataItem} from '../../../../model/rest/SessionClientDataItem';
import {SsColumnType_Ns} from '../../../../model/rest/SsColumnType';
import {ApiSuggestedServicesService} from '../../../../services/api/api-suggested-services.service';
import SsColumnType = SsColumnType_Ns.SsColumnType;

export interface ISuggestedServicesTableModel {
    columns: SsTableColumn[];
    data: SessionSsClientData[];
    sessionId: number;
}

/** @ngInject */
export function suggestedServicesTable($q: any,
                                       ApiSuggestedServicesService: ApiSuggestedServicesService,
                                       _,
                                       $state: ng.ui.IStateService,
                                       moment,
                                       LocalStorageService: LocalStorageService) {
    return {
        templateUrl: 'app/components/moduleSuggestedServices/directives/suggestedServicesTable/suggestedServicesTable.html',
        restrict: 'AE',
        scope: {
            canEditData: '=suggestedServicesTableEdit',
            canEditUi: '=suggestedServicesTableUi',
            data: '=suggestedServicesTableData',
            session: '=session'
        },
        link: function postLink(scope, iElement, iAttrs, controller) {

            scope.model = {
                columns: [],
                data: [],
            } as ISuggestedServicesTableModel;

            scope.showAddBtn = true;

            scope.$watch('session', (session: Session) => {
                if (!session || session.id < 0) {
                    return;
                }

                $q.all({
                    columns: ApiSuggestedServicesService.getTableColumn(),
                    data: ApiSuggestedServicesService.getSessionClientData(session.id)
                }).then((model: ISuggestedServicesTableModel) => {
                    // init empty data cell
                    const columns: SsTableColumn[] = model.columns;
                    const data: SessionSsClientData[] = model.data;

                    const newData: SessionSsClientData[] = session.clients.map((client: Client): SessionSsClientData => {
                        const findClientData: SessionSsClientData = _.find(data, (clientData: SessionSsClientData) => clientData.client.id === client.id);
                        return findClientData || {// return dummy to show event creation buttons
                            client: client,
                            services: [],
                            values: []
                        } as SessionSsClientData;
                    });

                    newData.forEach((clientData: SessionSsClientData) => {
                        columns.forEach((column: SsTableColumn) => {
                            const columnId = column.id;
                            const foundItem = _.find(clientData.values, (clientDataItem: SessionClientDataItem) => clientDataItem.columnId == columnId);
                            if (!foundItem) {
                                clientData.values.push({
                                    columnId: columnId,
                                    textValue: null,
                                    selectValue: null
                                });
                            }
                        });
                    });

                    model.data = newData;
                    scope.model = model;
                });

            });

            scope.htChange = (column: SsTableColumn, clientData: SessionSsClientData) => {
                if (column.type !== SsColumnType.custom) {
                    return; // save only custom fields in table
                }

                const columnId = column.id;
                const clientDataItem: SessionClientDataItem = _.find(clientData.values, (value: SessionClientDataItem) => value.columnId === columnId);

                return ApiSuggestedServicesService.putColumn(scope.session.id, clientData.client.id, columnId, clientDataItem);
            };

            scope.isColumnCustomizable = (column: SsTableColumn) => {
                return scope.canEditUi && column.type == SsColumnType.custom;
            };

            scope.customizeColumn = (column: SsTableColumn) => {
                // $state.go('auth.healthProfile.sessionClients.editCustomColumns');
            };

            scope.viewOrEdit = (clientData: SessionSsClientData) => {
                $state.go('auth.healthProfile.healthSections', {
                    sessionId: scope.session.id,
                    clientId: clientData.client.id
                });
            };

            scope.goJuggleBoard = (clientData: SessionSsClientData) => {
                LocalStorageService.setItem('moduleSuggestedServices.clientId', clientData.client.id);
                $state.go('auth.suggestedServices.juggleBoard.daily');
            };

            scope.addSuggestedService = (client: Client) => {
                const currentClientData = _.find(scope.model.data, {client});

                if (Object.keys(currentClientData).length) {
                    currentClientData.services.push({});
                    scope.showAddBtn = false;
                }
            };

            scope.addCb = function () {
                scope.showAddBtn = true;
            };
        }
    };
}

