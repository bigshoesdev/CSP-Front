import {BaseEditColumnsController, ColumnType} from './baseEditColumns.controller';
import {Id} from '../../../../model/rest/Id';
import {HsColumn} from '../../../../model/rest/HsColumn';
import {HsCustomColumn} from '../../../../model/rest/HsCustomColumn';
import {HsColumnType_Ns} from '../../../../model/rest/HsColumnType';
import {BaseColumn} from '../../../../model/rest/BaseColumn';
import {BaseColumnDefinition} from '../../../../model/rest/BaseColumnDefinition';
import HsColumnType = HsColumnType_Ns.HsColumnType;
import * as restangular from 'restangular';
declare let angular: any;

export class HsEditColumnsController extends BaseEditColumnsController {
    /** @ngInject */
    constructor(protected sectionType: string,
                protected columns: HsColumn[],
                protected customColumns: HsCustomColumn [],
                protected $scope,
                protected _,
                protected Restangular: restangular.IService,
                protected StateStack,
                protected $state) {

        super(columns,
            customColumns,
            $scope, _, Restangular, StateStack, $state);

        $scope.sectionType = sectionType;
        $scope.headerTitle = 'Edit Columns for ' + sectionType + ' section';
    }


    public getStandardTypes(): string[] {
        return HsColumnType_Ns.$standard;
    }

    public getCustomType(): string {
        return HsColumnType[HsColumnType.custom];
    }

    public makeColumnDefinition(column: BaseColumn, selectedColumnType: ColumnType, columnPosition: number): BaseColumnDefinition {
        return {
            id: column.id,
            title: column.title,
            type: selectedColumnType.columnType,
            position: columnPosition,
            customColumnId: selectedColumnType.customColumnId,
            selectColumnId: selectedColumnType.selectColumnId
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
            customColumn: null,
            selectColumn: null
        };
    }

    public remove(columnId: number): any {
        const __this = this;
        return __this.Restangular
            .one('healthSection', __this.sectionType)
            .one('column', columnId)
            .remove()
            .then(__this.update.bind(__this));
    }

    public getColumns() {
        const __this = this;
        return __this.Restangular
            .one('healthSection', __this.sectionType)
            .all('columns')
            .getList()
            .then((o: any) => o.plain());

    }

    public postColumn(columnDefinition: BaseColumnDefinition) {
        const __this = this;
        return __this.Restangular
            .one('healthSection', __this.sectionType)
            .all('column')
            .post(columnDefinition)
            .then(() => {
                return __this.update();
            });
    }

    public putColumn(columnId: number, columnDefinition: BaseColumnDefinition) {
        const __this = this;
        return __this.Restangular
            .one('healthSection', __this.sectionType)
            .one('column', columnId)
            .customPUT(columnDefinition)
            .then(__this.update.bind(__this));
    }

    public putColumns(columnDefinitions: BaseColumnDefinition[]) {
        const __this = this;
        return __this.Restangular
            .one('healthSection', __this.sectionType)
            .one('columns')
            .customPUT(columnDefinitions)
            .then(__this.update.bind(__this));
    }

    public goToEditCustomFields(): void {
        const __this = this;
        __this.$state.go('auth.healthProfile.healthSectionEditCustomColumns', {
            sectionType: __this.sectionType
        });
    }
}
