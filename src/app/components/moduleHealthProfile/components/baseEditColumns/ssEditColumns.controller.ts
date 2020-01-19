import {BaseEditColumnsController, ColumnType} from './baseEditColumns.controller';
import {SsColumnType_Ns} from '../../../../model/rest/SsColumnType';
import {BaseColumn} from '../../../../model/rest/BaseColumn';
import {BaseColumnDefinition} from '../../../../model/rest/BaseColumnDefinition';
import {SsTableColumn} from '../../../../model/rest/SsTableColumn';
import {SsCustomColumn} from '../../../../model/rest/SsCustomColumn';
import SsColumnType = SsColumnType_Ns.SsColumnType;
import * as restangular from 'restangular';
declare let angular: any;

export class SsEditColumnsController extends BaseEditColumnsController {
    /** @ngInject */
    constructor(protected columns: SsTableColumn[],
                protected customColumns: SsCustomColumn[],
                protected $scope,
                protected _,
                protected Restangular: restangular.IService,
                protected StateStack,
                protected $state) {

        super(columns,
            customColumns,
            $scope, _, Restangular, StateStack, $state);

        $scope.headerTitle = 'Edit Columns for Suggested Services Table';
    }


    public getStandardTypes(): string[] {
        return SsColumnType_Ns.$standard;
    }

    public getCustomType(): string {
        return SsColumnType[SsColumnType.custom];
    }

    public makeColumnDefinition(column: BaseColumn, selectedColumnType: ColumnType, columnPosition: number): BaseColumnDefinition {
        return {
            id: column.id,
            title: column.title,
            type: selectedColumnType.columnType,
            position: columnPosition,
            customColumnId: selectedColumnType.customColumnId
        };
    }

    public makeNewColumn(): BaseColumn {
        const __this = this;
        return {
            id: null,
            title: '',
            type: null,
            position: __this.$scope.columns.length,
            editable: true,
            customColumn: null
        };
    }

    public remove(columnId: number): any {
        const __this = this;
        return __this.Restangular
            .one('suggestedServices/column', columnId)
            .remove()
            .then(__this.update.bind(__this));
    }

    public getColumns(): any {
        const __this = this;
        return __this.Restangular
            .all('suggestedServicesTable/columns')
            .getList()
            .then(SsEditColumnsController.getPlain);
    }

    public postColumn(columnDefinition: BaseColumnDefinition): any {
        const __this = this;
        return __this.Restangular
            .all('suggestedServices/column')
            .post(columnDefinition)
            .then(() => {
                return __this.update();
            });
    }

    public putColumn(columnId: number, columnDefinition: BaseColumnDefinition): any {
        const __this = this;
        return __this.Restangular
            .one('suggestedServices/column', columnId)
            .customPUT(columnDefinition);
    }

    public putColumns(columnDefinitions: BaseColumnDefinition[]): any {
        const __this = this;
        return __this.Restangular
            .one('suggestedServices/columns')
            .customPUT(columnDefinitions);
    }

    public goToEditCustomFields(): void {
        const __this = this;
        __this.$state.go('auth.suggestedServices.table.editCustomColumns');
    }

    static getPlain(o) {
        return o && o.plain() || o;
    }
}
