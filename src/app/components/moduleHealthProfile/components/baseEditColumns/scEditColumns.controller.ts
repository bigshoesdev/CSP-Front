import {BaseEditColumnsController, ColumnType} from './baseEditColumns.controller';
import {Id} from '../../../../model/rest/Id';
import {HtColumn} from '../../../../model/rest/HtColumn';
import {HtCustomColumn} from '../../../../model/rest/HtCustomColumn';
import {HtColumnType_Ns} from '../../../../model/rest/HtColumnType';
import {BaseColumn} from '../../../../model/rest/BaseColumn';
import {BaseColumnDefinition} from '../../../../model/rest/BaseColumnDefinition';
import HtColumnType = HtColumnType_Ns.HtColumnType;
import * as restangular from 'restangular';
declare let angular: any;

export class ScEditColumnsController extends BaseEditColumnsController {
    /** @ngInject */
    constructor(protected columns: HtColumn[],
                protected customColumns: HtCustomColumn[],
                protected $scope,
                protected _,
                protected Restangular: restangular.IService,
                protected StateStack,
                protected $state) {

        super(columns,
            customColumns,
            $scope, _, Restangular, StateStack, $state);

        $scope.headerTitle = 'Edit Columns for Session Clients';
    }


    public getStandardTypes(): string[] {
        return HtColumnType_Ns.$standard;
    }

    public getCustomType(): string {
        return HtColumnType[HtColumnType.custom];
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
            .one('healthTable/column', columnId)
            .remove()
            .then(__this.update.bind(__this));
    }

    public getColumns(): any {
        const __this = this;
        return __this.Restangular
            .all('healthTable/columns')
            .getList()
            .then(ScEditColumnsController.getPlain);
    }

    public postColumn(columnDefinition: BaseColumnDefinition): any {
        const __this = this;
        return __this.Restangular
            .all('healthTable/column')
            .post(columnDefinition)
            .then(() => {
                return __this.update();
            });
    }

    public putColumn(columnId: number, columnDefinition: BaseColumnDefinition): any {
        const __this = this;
        return __this.Restangular
            .one('healthTable/column', columnId)
            .customPUT(columnDefinition);
    }

    public putColumns(columnDefinitions: BaseColumnDefinition[]): any {
        const __this = this;
        return __this.Restangular
            .one('healthTable/columns')
            .customPUT(columnDefinitions);
    }

    public goToEditCustomFields(): void {
        const __this = this;
        __this.$state.go('auth.healthProfile.sessionClients.editCustomColumns');
    }

    static getPlain(o) {
        return o && o.plain() || o;
    }
}
