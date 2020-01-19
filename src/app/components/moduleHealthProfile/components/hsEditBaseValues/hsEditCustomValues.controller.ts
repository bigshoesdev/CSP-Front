import {HsEditBaseValuesController} from './hsEditBaseValues.controller';
import {HsCustomColumn} from '../../../../model/rest/HsCustomColumn';
import {HsBaseColumnValue} from '../../../../model/rest/HsBaseColumnValue';
import * as restangular from 'restangular';
declare let angular: any;

export class HsEditCustomValuesController extends HsEditBaseValuesController {
    /** @ngInject */
    constructor(protected columnId: number,
                protected sectionType: string,
                protected customColumn: HsCustomColumn,
                protected $scope, protected Restangular: restangular.IService, protected StateStack) {

        super(customColumn.values || [],
            $scope, StateStack);

        $scope.headerTitle = 'Edit Custom Column`s Values - "' + customColumn.title + '" (' + sectionType + ')';
    }

    public update(values: HsBaseColumnValue[]) {
        const __this = this;
        return __this.Restangular
            .one('healthSection', __this.sectionType)
            .one('customColumn', __this.columnId)
            .one('values')
            .customPUT(values);

    }
}
