import {BaseEditCustomColumnsController} from './baseEditCustomColumns.controller';
import {SsCustomColumn} from '../../../../model/rest/SsCustomColumn';
import {SsCustomColumnValue} from '../../../../model/rest/SsCustomColumnValue';
import {SsCustomColumnType_Ns} from '../../../../model/rest/SsCustomColumnType';
import SsCustomColumnType = SsCustomColumnType_Ns.SsCustomColumnType;
import {DialogService} from '../../../../services/dialog/dialog.service';
import * as restangular from 'restangular';
declare let angular: any;

export class SsEditCustomColumnsController extends BaseEditCustomColumnsController {
    /** @ngInject */
    constructor(protected customColumns: SsCustomColumn[],
                protected $scope,
                protected _,
                protected Restangular: restangular.IService,
                protected StateStack,
                protected $state: ng.ui.IStateService,
                protected DialogService: DialogService) {

        super(customColumns,
            $scope, StateStack);

        $scope.headerTitle = 'Edit Columns Types for Suggested Services Table';
    }

    protected saveValues(customColumnId: number, values: SsCustomColumnValue[]) {
        const __this = this;
        return __this.Restangular
            .one('suggestedServices/customColumn', customColumnId)
            .one('values')
            .customPUT(values)
            .then(__this.update.bind(__this));

    }

    public getTypes(): string[] {
        return angular.copy(SsCustomColumnType_Ns.$all);
    }

    public putCustomColumn(customColumn: SsCustomColumn): any {
        const __this = this;
        return __this.Restangular
            .one('suggestedServices/customColumn', customColumn.id)
            .customPUT(customColumn);
    }

    public postCustomColumn(customColumn: SsCustomColumn): any {
        const __this = this;
        return __this.Restangular
            .all('suggestedServices/customColumn')
            .post(customColumn);

    }

    public removeCustomColumn(customColumn: SsCustomColumn): any {
        const __this = this;
        return __this.Restangular
            .one('suggestedServices/customColumn', customColumn.id)
            .remove();

    }

    public isSelectType(customColumn: SsCustomColumn): boolean {
        return customColumn && customColumn.type === SsCustomColumnType.select;
    }

    public editSelectValues(customColumn: SsCustomColumn, $event): void {
        const __this = this;
        __this.DialogService
            .customizeSelectorValues(customColumn, $event)
            .then((values: SsCustomColumnValue[]) => {
                __this.saveValues(customColumn.id, values);
                customColumn.values = values;
            });

    }

    public getCustomColumns(): any {
        const __this = this;
        return __this.Restangular
            .all('suggestedServices/customColumns')
            .getList()
            .then(SsEditCustomColumnsController.getPlain);
    }

    static getPlain(o) {
        return o && o.plain() || o;
    }

}
