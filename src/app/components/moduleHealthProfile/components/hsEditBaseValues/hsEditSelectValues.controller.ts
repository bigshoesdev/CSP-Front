import {HsEditBaseValuesController} from './hsEditBaseValues.controller';
import {HsColumn} from '../../../../model/rest/HsColumn';
import {HsBaseColumnValue} from '../../../../model/rest/HsBaseColumnValue';
import * as restangular from 'restangular';

declare let angular: any;

export class HsEditSelectValuesController extends HsEditBaseValuesController {
    /** @ngInject */
    constructor(protected columnId: number,
                protected sectionType: string,
                protected column: HsColumn,
                protected $scope, protected Restangular: restangular.IService, protected StateStack) {

        super(column.selectColumn && column.selectColumn.values || [],
            $scope, StateStack);

        $scope.headerTitle = `Edit Select Column's Values - "${column.title}" (${sectionType})`;
    }

    public update(values: HsBaseColumnValue[]) {
        return this.Restangular
            .one('healthSection', this.sectionType)
            .one('column', this.columnId)
            .one('values')
            .customPUT(values);
    }
}
