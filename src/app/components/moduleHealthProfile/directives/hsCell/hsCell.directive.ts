import {IHealthSectionTableConf} from '../healthSectionTable/healthSectionTable.directive';
import {HsColumn} from '../../../../model/rest/HsColumn';
import {HsRow} from '../../../../model/rest/HsRow';
import {HsRowItem} from '../../../../model/rest/HsRowItem';
import {HsFlagColumn} from '../../../../model/rest/HsFlagColumn';
import {HsConditionColumn} from '../../../../model/rest/HsConditionColumn';
import {HsColumnType_Ns} from '../../../../model/rest/HsColumnType';
import {HsCustomColumn} from '../../../../model/rest/HsCustomColumn';
import {HsCustomColumnType_Ns} from '../../../../model/rest/HsCustomColumnType';
import {HsCustomColumnValue} from '../../../../model/rest/HsCustomColumnValue';
import {HsFlagColumnValue} from '../../../../model/rest/HsFlagColumnValue';
import {HsConditionColumnValue} from '../../../../model/rest/HsConditionColumnValue';
import {HsSelectColumnValue} from '../../../../model/rest/HsSelectColumnValue';
import HsColumnType = HsColumnType_Ns.HsColumnType;
import HsCustomColumnType = HsCustomColumnType_Ns.HsCustomColumnType;
declare let angular: any;
/** @ngInject */
export function hsCell($compile, $templateRequest, _, $state) {
    return {
        restrict: 'A',
        scope: {
            column: '=hsCell', // HsColumn
            columnIndex: '=hsCellId', // number
            row: '=hsCellData', // HsRow
            onChange: '=hsCellChange',
            isReadOnly: '=hsCellReadonly'
        },
        link: function (scope, iElement, iAttrs) {
            const column: HsColumn = scope.column;
            const columnId = column.id;
            const row: HsRow = scope.row;
            let rowItem: HsRowItem = _.find(row.values, (v: HsRowItem) => v.columnId === columnId);
            if (!rowItem) {
                rowItem = {
                    columnId: columnId,
                    textValue: null,
                    selectValue: null,
                    colorValue: null
                };
                row.values.push(rowItem);
            }
            scope.rowItem = rowItem;

            const config: IHealthSectionTableConf = scope.$parent.config;
            const flagColumn: HsFlagColumn = config.flagColumn;
            const conditionColumn: HsConditionColumn = config.conditionColumn;

            let templateUrl: string;
            if (column.type === HsColumnType.custom) {

                const customColumn: HsCustomColumn = column.customColumn;

                switch (customColumn.type) {
                    case HsCustomColumnType.checkbox:
                        templateUrl = 'app/components/moduleHealthProfile/directives/hsCell/hsCheckbox.html';
                        break;
                    case HsCustomColumnType.select: {
                        const values: HsCustomColumnValue[] = customColumn.values;
                        scope.values = values;
                        templateUrl = 'app/components/moduleHealthProfile/directives/hsCell/hsSelect.html';
                        break;
                    }
                    case HsCustomColumnType.input:
                    default:
                        templateUrl = 'app/components/moduleHealthProfile/directives/hsCell/hsInput.html';
                        break;
                }

            } else {
                const type: HsColumnType = column.type;
                switch (type) {
                    case HsColumnType.flag: {
                        const values: HsFlagColumnValue[] = flagColumn.values;
                        scope.values = values;
                        scope.getFlagByColor = (colorValue) => _.find(values, (v) => v.color === colorValue);
                        templateUrl = 'app/components/moduleHealthProfile/directives/hsCell/hsFlag.html';
                        break;
                    }
                    case HsColumnType.condition: {
                        const values: HsConditionColumnValue[] = conditionColumn.values;
                        scope.values = values;
                        scope.getConditionById = (selectValue) => _.find(values, (v) => v.id === selectValue);
                        templateUrl = 'app/components/moduleHealthProfile/directives/hsCell/hsCondition.html';
                        break;
                    }
                    case HsColumnType.select: {
                        const values: HsSelectColumnValue[] = column.selectColumn ? column.selectColumn.values : [];
                        scope.values = values;
                        templateUrl = 'app/components/moduleHealthProfile/directives/hsCell/hsSelect.html';
                        break;
                    }
                    case HsColumnType.input:
                    case HsColumnType.cost:
                        templateUrl = 'app/components/moduleHealthProfile/directives/hsCell/hsInput.html';
                        break;
                    case HsColumnType.text:
                    default:
                        templateUrl = 'app/components/moduleHealthProfile/directives/hsCell/hsText.html';
                        break;
                }

            }

            $templateRequest(templateUrl).then(compileTemplate);

            function compileTemplate(template) {
                iElement.append($compile(template)(scope));
            }

        }
    };


}
