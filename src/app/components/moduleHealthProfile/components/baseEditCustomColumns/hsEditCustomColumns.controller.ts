import {BaseEditCustomColumnsController} from './baseEditCustomColumns.controller';
import {HsCustomColumn} from '../../../../model/rest/HsCustomColumn';
import {HsCustomColumnType_Ns} from '../../../../model/rest/HsCustomColumnType';
import HsCustomColumnType = HsCustomColumnType_Ns.HsCustomColumnType;
import * as restangular from 'restangular';
declare let angular: any;

export class HsEditCustomColumnsController extends BaseEditCustomColumnsController {
    /** @ngInject */
    constructor(protected sectionType: string,
                protected customColumns: HsCustomColumn[],
                protected $scope, protected Restangular: restangular.IService, protected StateStack, protected $state) {

        super(customColumns,
            $scope, StateStack);

        $scope.headerTitle = 'Edit Columns Types for ' + sectionType + ' section';
        $scope.sectionType = sectionType;
    }


    public getTypes(): string[] {
        return angular.copy(HsCustomColumnType_Ns.$all);
    }

    public putCustomColumn(customColumn: HsCustomColumn): any {
        const __this = this;
        return __this.Restangular
            .one('healthSection', __this.$scope.sectionType)
            .one('customColumn', customColumn.id)
            .customPUT(customColumn);
    }

    public postCustomColumn(customColumn: HsCustomColumn): any {
        const __this = this;
        return __this.Restangular
            .one('healthSection', __this.$scope.sectionType)
            .all('customColumn')
            .post(customColumn);
    }

    public removeCustomColumn(customColumn: HsCustomColumn): any {
        const __this = this;
        return __this.Restangular
            .one('healthSection', __this.$scope.sectionType)
            .one('customColumn', customColumn.id)
            .remove();
    }

    public isSelectType(customColumn: HsCustomColumn): boolean {
        return customColumn && customColumn.type === HsCustomColumnType.select;
    }

    public editSelectValues(customColumn: HsCustomColumn, $event): void {
        // todo match type
        const __this = this;
        __this.$state.go('auth.healthProfile.healthSectionEditCustomValues', {
            sectionType: __this.$scope.sectionType,
            columnId: customColumn.id
        });

    }

    public getCustomColumns(): any {
        const __this = this;
        return __this.Restangular
            .one('healthSection', __this.$scope.sectionType)
            .all('customColumns')
            .getList()
            .then(HsEditCustomColumnsController.getPlain);
    }

    static getPlain(o) {
        return o && o.plain() || o;
    }

}
