import {HsColumn} from '../../../../model/rest/HsColumn';
import {HsRow} from '../../../../model/rest/HsRow';
import {HsFlagColumn} from '../../../../model/rest/HsFlagColumn';
import {HsConditionColumn} from '../../../../model/rest/HsConditionColumn';
import {HsType_Ns} from '../../../../model/rest/HsType';
import {HsRowItem} from '../../../../model/rest/HsRowItem';
import {HsColumnType_Ns} from '../../../../model/rest/HsColumnType';
import {HsConditionColumnValue} from '../../../../model/rest/HsConditionColumnValue';
import {HsCustomColumnType_Ns} from '../../../../model/rest/HsCustomColumnType';
import HsType = HsType_Ns.HsType;
import HsColumnType = HsColumnType_Ns.HsColumnType;
import HsCustomColumnType = HsCustomColumnType_Ns.HsCustomColumnType;
import * as restangular from 'restangular';

export interface IHealthSectionTableConf {
    sessionId: number;
    clientId: number;
    sectionType: HsType;

    columns: HsColumn[];
    rows: HsRow[];

    flagColumn: HsFlagColumn;
    conditionColumn: HsConditionColumn;
}


/** @ngInject */
export function healthSectionTable(Restangular: restangular.IService,
                                   $timeout: ng.ITimeoutService,
                                   _,
                                   $state) {
    return {
        templateUrl: 'app/components/moduleHealthProfile/directives/healthSectionTable/healthSectionTable.html',
        restrict: 'A',
        scope: {
            config: '=healthSectionTable', // IHealthSectionTableConf
            isEditMode: '=healthSectionTableEdit',
            isUiMode: '=healthSectionTableUi'
        },
        link: function postLink(scope, iElement, iAttrs, controller) {

            initModel();

            function initModel() {
                scope.isRowsFixed = scope.config.sectionType === HsType.goals;
                scope.waitFlag = false;
            }

            scope.hsChange = (column: HsColumn, row: HsRow) => {
                const columnId = column.id;
                const rowItem: HsRowItem = _.find(row.values, (ri: HsRowItem) => ri.columnId === columnId);

                return Restangular
                    .one('healthSections/row', row.id)
                    .one('column', columnId)
                    .one('value')
                    .customPUT(rowItem)
                    .then(_postHandler);

                function _postHandler() {
                    const config: IHealthSectionTableConf = scope.config;
                    switch (config.sectionType) {
                        case HsType.physical:
                        case HsType.emotional:
                        case HsType.structural:
                            if (column.type === HsColumnType.condition) { // if condition changed
                                postHandleCondition();
                            }
                            break;
                        case HsType.protocols:
                        case HsType.packages:
                            if (column.type === HsColumnType.select) {// more specify "Protocols" column
                                updateCost();
                            }
                            break;
                        case HsType.goals:
                        case HsType.contraindications:
                            break;
                    }

                    function postHandleCondition() {
                        const flagColumn: HsColumn = _.find(scope.config.columns, (c: HsColumn) => c.type == HsColumnType.flag);

                        const flagColumnId = flagColumn.id;
                        const flagRowItem: HsRowItem = _.find(row.values, (ri: HsRowItem) => ri.columnId === flagColumnId);

                        if (!flagRowItem.colorValue) {// and if color not defined - change it
                            getHealthCondition(config.sectionType).then(_changeColorValue);
                        }

                        function _changeColorValue(conditionColumn: HsConditionColumn) {
                            const conditionId = rowItem.selectValue;
                            const condition: HsConditionColumnValue = _.find(conditionColumn.values,
                                (c: HsConditionColumnValue) => c.id == conditionId);

                            flagRowItem.colorValue = condition.defaultFlagColor;

                            scope.hsChange(flagColumn, row);
                        }

                    }

                    function updateCost() {
                        getRow(row.id)
                            .then((updatedRow: HsRow) => {
                                // row.values = updatedRow.values;
                                const columns: HsColumn[] = scope.config.columns;
                                const costColumn: HsColumn = _.find(columns, (column: HsColumn) => column.title === 'Cost to Client');
                                const costColumnId = costColumn.id;
                                const thisArg = (value: HsRowItem) => value.columnId === costColumnId;
                                const theValue: HsRowItem = _.find(row.values, thisArg);
                                const newValue: HsRowItem = _.find(updatedRow.values, thisArg);
                                theValue.textValue = newValue && newValue.textValue;
                            });
                    }
                }
            };

            function updateRows() {
                scope.waitFlag = true;
                $timeout(() => {
                    getRows().then((rows: HsRow[]) => {
                        scope.config.rows = rows;
                        scope.waitFlag = false;
                    }, () => {
                        scope.waitFlag = false;
                    });
                }, 0);
            }

            function getRow(rowId) {
                return Restangular
                    .one('healthSections/row', rowId)
                    .get()
                    .then((o) => o.plain());
            }

            function getRows() {
                const config: IHealthSectionTableConf = scope.config;
                return Restangular
                    .one('healthSection', config.sectionType)
                    .one('client', config.clientId)
                    .one('session', config.sessionId)
                    .one('rows')
                    .get()
                    .then((o) => o.plain());
            }

            function getHealthCondition(sectionType: HsType) {
                return Restangular
                    .one('healthCondition', sectionType)
                    .get()
                    .then((o) => o.plain());
            }

            scope.isColumnCustomize = (column: HsColumn) => {
                switch (column.type) {
                    case HsColumnType.custom: {
                        return column.customColumn.type === HsCustomColumnType.select;
                    }
                    case HsColumnType.flag:
                    case HsColumnType.condition:
                    case HsColumnType.select: {
                        return true;
                    }
                    default: {
                        return false;
                    }
                }
            };

            scope.customizeColumn = (column: HsColumn) => {
                const config: IHealthSectionTableConf = scope.config;
                // todo column.editable
                if (column.type == HsColumnType.custom) {
                    $state.go('auth.healthProfile.healthSectionEditCustomValues', {
                        sectionType: config.sectionType,
                        columnId: column.customColumn.id
                    });
                } else if (column.type == HsColumnType.flag) {
                    $state.go('auth.healthProfile.healthSectionEditFlagValues', {
                        sectionType: config.sectionType
                    });
                } else if (column.type == HsColumnType.condition) {
                    $state.go('auth.healthProfile.healthSectionEditConditionValues', {
                        sectionType: config.sectionType
                    });
                } else if (column.type == HsColumnType.select) {
                    $state.go('auth.healthProfile.healthSectionEditSelectValues', {
                        sectionType: config.sectionType,
                        columnId: column.id
                    });
                }
            };

            scope.addRow = () => {
                const config: IHealthSectionTableConf = scope.config;

                const row: HsRow = {
                    id: null,
                    clientId: config.clientId,
                    sessionId: config.sessionId,
                    section: config.sectionType,
                    values: []
                };

                scope.waitFlag = true;
                Restangular
                    .one('healthSection', config.sectionType)
                    .one('client', config.clientId)
                    .one('session', config.sessionId)
                    .all('row')
                    .post(row)
                    .then(updateRows);

            };

            scope.removeRow = (rowId) => {
                if (scope.isRowsFixed) {
                    return;
                }

                const config: IHealthSectionTableConf = scope.config;
                config.rows = config.rows.filter((row) => row.id != rowId);

                scope.waitFlag = true;
                Restangular
                    .one('healthSections/row', rowId)
                    .remove()
                    .then(updateRows);
            };

        }
    };
}
