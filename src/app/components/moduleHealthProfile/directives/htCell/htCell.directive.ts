
import {HtColumn} from '../../../../model/rest/HtColumn';
import {IHtData} from '../../../../model/rest/IHtData';
import {HtDataItem} from '../../../../model/rest/HtDataItem';
import {HtColumnType_Ns} from '../../../../model/rest/HtColumnType';
import {HtCustomColumn} from '../../../../model/rest/HtCustomColumn';
import {HtCustomColumnType_Ns} from '../../../../model/rest/HtCustomColumnType';
import {HtCustomColumnValue} from '../../../../model/rest/HtCustomColumnValue';
import HtColumnType = HtColumnType_Ns.HtColumnType;
import HtCustomColumnType = HtCustomColumnType_Ns.HtCustomColumnType;

declare let angular: any;
/** @ngInject */
export function htCell($compile, $templateRequest, _) {
    return {
        restrict: 'A',
        scope: {
            column: '=htCell', // HtColumn
            columnIndex: '=htCellId', // number
            clientData: '=htCellData', // IHtData
            onChange: '=htCellChange',
            canEditData: '=htCellEdit',
            canEditUi: '=htCellUi',
        },
        link: function (scope, iElement, iAttrs) {
            const column: HtColumn = scope.column;
            const columnId = column.id;
            const clientData: IHtData = scope.clientData;
            scope.clientDataItem = _.find(clientData.values, (v: HtDataItem) => v.columnId === columnId);

            let templateUrl: string;
            if (column.type === HtColumnType.custom) {

                const customColumn: HtCustomColumn = column.customColumn;

                switch (customColumn.type) {
                    case HtCustomColumnType.input:
                        templateUrl = 'app/components/moduleHealthProfile/directives/htCell/htInput.html';
                        break;
                    case HtCustomColumnType.checkbox:
                        scope.booleanValue = scope.clientDataItem.textValue == 'true';
                        templateUrl = 'app/components/moduleHealthProfile/directives/htCell/htCheckbox.html';
                        break;
                    case HtCustomColumnType.select:
                    default:
                        const values: HtCustomColumnValue[] = customColumn.values;
                        scope.values = angular.copy(values).sort((a: HtCustomColumnValue, b: HtCustomColumnValue) => a.position - b.position);
                        templateUrl = 'app/components/moduleHealthProfile/directives/htCell/htSelect.html';
                        break;
                }

            } else {

                const type: HtColumnType = column.type;
                switch (type) {
                    case HtColumnType.status:
                        templateUrl = 'app/components/moduleHealthProfile/directives/htCell/htStatus.html';
                        break;
                    case HtColumnType.flag:
                        templateUrl = 'app/components/moduleHealthProfile/directives/htCell/htFlag.html';
                        break;
                    case HtColumnType.name_:
                    default:
                        templateUrl = 'app/components/moduleHealthProfile/directives/htCell/htName.html';
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
