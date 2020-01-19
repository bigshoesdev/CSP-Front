import {BaseColumn} from '../../../../model/rest/BaseColumn';
import {BaseCustomColumn} from '../../../../model/rest/BaseCustomColumn';
import {BaseColumnDefinition} from '../../../../model/rest/BaseColumnDefinition';
import * as restangular from 'restangular';

declare let angular: any;

export interface ColumnType {
    id: number;
    columnType: string;
    customColumnId?: number;
    selectColumnId?: number;
}

export abstract class BaseEditColumnsController {

    constructor(protected columns: BaseColumn[],
                protected customColumns: BaseCustomColumn[],
                protected $scope,
                protected _,
                protected Restangular: restangular.IService,
                protected StateStack,
                protected $state) {
        const __this = this;

        $scope.customColumns = customColumns;

        __this.initForm(columns);

        $scope.selectTypeToString = (selectColumnType: ColumnType) => {
            if (!selectColumnType) {
                return '';
            }
            if (selectColumnType.columnType === __this.getCustomType()) {
                const customColumnId = selectColumnType.customColumnId;
                const found: BaseCustomColumn = _.find($scope.customColumns, (customColumn: BaseCustomColumn) => customColumn.id === customColumnId);
                return found && found.title;
            } else {
                return selectColumnType.columnType;
            }
        };

        $scope.isTypeStandard = (type) => {
            return _.includes(__this.getStandardTypes(), type);
        };

        $scope.onColumnChange = onColumnChange;

        function onColumnChange(column: BaseColumn, selectedColumnType: ColumnType, columnPosition) {
            const columnDefinition = __this.makeColumnDefinition(column, selectedColumnType, columnPosition);

            __this.putColumn(column.id, columnDefinition);
        }


        $scope.backOrDone = () => {
            StateStack.goBack();
        };

        $scope.editCustomFields = () => {
            __this.goToEditCustomFields();
        };

        $scope.sortableOptions = {
            stop: function (e, ui) {
                const selectedColumnTypes = $scope.selectedColumnTypes;
                const definitions = $scope.columns.map((column: BaseColumn, columnPosition) => {
                    // onColumnChange(column, $scope.selectedColumnTypes[column.id], columnPosition);
                    const columnType: ColumnType = selectedColumnTypes[column.id];
                    return __this.makeColumnDefinition(column, columnType, columnPosition);
                });
                __this.putColumns(definitions);
            }
        };

        $scope.addNew = () => {
            const newColumn: BaseColumn = __this.makeNewColumn();
            $scope.newColumn = newColumn;
            $scope.newSelectedColumnType = null;

        };

        $scope.onNewColumnChange = add;
        $scope.onNewColumnAdd = add;

        function add(newColumn: BaseColumn, selectedColumnType: ColumnType) {
            if (!(newColumn.title && selectedColumnType)) {
                return;
            }


            const columnDefinition = __this.makeColumnDefinition(newColumn, selectedColumnType, $scope.columns.length);

            $scope.newColumn = null;
            $scope.newSelectedColumnType = null;

            __this.postColumn(columnDefinition);
        }

        $scope.remove = (column: BaseColumn) => {
            __this.remove(column.id);
        };
    }

    protected initForm(columns: BaseColumn[]) {
        const __this = this;
        const $scope = __this.$scope;
        const _ = __this._;

        $scope.columns = columns;

        let selectTypeId = 0;
        const standardColumnTypes: ColumnType[] = __this.getStandardTypes().map((type: string): ColumnType => {
            return {
                id: ++selectTypeId,
                columnType: type,
                customColumnId: null
            };
        });
        $scope.standardColumnTypes = standardColumnTypes;

        const customColumnTypes: ColumnType[] = $scope.customColumns.map((customColumn: BaseCustomColumn): ColumnType => {
            return {
                id: ++selectTypeId,
                columnType: __this.getCustomType(),
                customColumnId: customColumn.id
            };
        });
        $scope.customColumnTypes = customColumnTypes;

        $scope.selectedColumnTypes = columns.reduce((selectedColumnTypes, column: BaseColumn) => {
            let columnType: ColumnType;
            if (column.customColumn) {
                const customColumnId = column.customColumn.id;
                columnType = _.find(customColumnTypes, (columnType: ColumnType) => columnType.customColumnId === customColumnId);
            } else {
                const type = column.type;
                columnType = _.find(standardColumnTypes, (columnType: ColumnType) => columnType.columnType === type);
            }
            selectedColumnTypes[column.id] = columnType;
            return selectedColumnTypes;
        }, {});

    }


    protected update(): any {
        const __this = this;
        return __this.getColumns()
            .then(__this.initForm.bind(__this));
    }


    abstract getStandardTypes(): string[];

    abstract getCustomType(): string;

    abstract makeColumnDefinition(column: BaseColumn, selectedColumnType: ColumnType, columnPosition: number): BaseColumnDefinition;

    abstract makeNewColumn(): BaseColumn;

    abstract remove(columnId: number): any;

    abstract getColumns(): any;

    abstract postColumn(columnDefinition: BaseColumnDefinition): any;

    abstract putColumn(columnId: number, columnDefinition: BaseColumnDefinition): any;

    abstract putColumns(columnDefinitions: BaseColumnDefinition[]): any;

    abstract goToEditCustomFields(): void;


}
