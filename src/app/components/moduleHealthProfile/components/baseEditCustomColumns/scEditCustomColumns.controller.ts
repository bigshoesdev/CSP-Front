import {BaseEditCustomColumnsController} from './baseEditCustomColumns.controller';
import {HtCustomColumn} from '../../../../model/rest/HtCustomColumn';
import {HtCustomColumnValue} from '../../../../model/rest/HtCustomColumnValue';
import {HtCustomColumnType_Ns} from '../../../../model/rest/HtCustomColumnType';
import HtCustomColumnType = HtCustomColumnType_Ns.HtCustomColumnType;
import {DialogService} from '../../../../services/dialog/dialog.service';
import * as restangular from 'restangular';
declare let angular: any;

export class ScEditCustomColumnsController extends BaseEditCustomColumnsController {
    /** @ngInject */
    constructor(protected customColumns: HtCustomColumn[],
                protected $scope,
                protected _,
                protected Restangular: restangular.IService,
                protected StateStack,
                protected $state: ng.ui.IStateService,
                protected DialogService: DialogService) {

        super(customColumns,
            $scope, StateStack);

        $scope.headerTitle = 'Edit Columns Types for Session Clients';
    }

    protected saveValues(customColumnId: number, values: HtCustomColumnValue[]) {
        const __this = this;
        return __this.Restangular
            .one('healthTable/customColumn', customColumnId)
            .one('values')
            .customPUT(values)
            .then(__this.update.bind(__this));

    }

    public getTypes(): string[] {
        return angular.copy(HtCustomColumnType_Ns.$all);
    }

    public putCustomColumn(customColumn: HtCustomColumn): any {
        const __this = this;
        return __this.Restangular
            .one('healthTable/customColumn', customColumn.id)
            .customPUT(customColumn);
    }

    public postCustomColumn(customColumn: HtCustomColumn): any {
        const __this = this;
        return __this.Restangular
            .all('healthTable/customColumn')
            .post(customColumn);

    }

    public removeCustomColumn(customColumn: HtCustomColumn): any {
        const __this = this;
        return __this.Restangular
            .one('healthTable/customColumn', customColumn.id)
            .remove();

    }

    public isSelectType(customColumn: HtCustomColumn): boolean {
        return customColumn && customColumn.type === HtCustomColumnType.select;
    }

    public editSelectValues(customColumn: HtCustomColumn, $event): void {
        const __this = this;
        __this.DialogService
            .customizeSelectorValues(customColumn, $event)
            .then((values: HtCustomColumnValue[]) => {
                __this.saveValues(customColumn.id, values);
                customColumn.values = values;
            });

    }

    public getCustomColumns(): any {
        const __this = this;
        return __this.Restangular
            .all('healthTable/customColumns')
            .getList()
            .then(ScEditCustomColumnsController.getPlain);
    }

    static getPlain(o) {
        return o && o.plain() || o;
    }
}
