import {HsFlagColumn} from '../../../../model/rest/HsFlagColumn';
import {HsColumnValue} from '../../../../model/rest/HsColumnValue';
import {HsBaseFlagColor_Ns} from '../../../../model/rest/HsBaseFlagColor';
import * as restangular from 'restangular';

declare let angular: any;

export class HsEditFlagController {
    /** @ngInject */
    constructor(sectionType: string,
                healthSectionFlagColumn: HsFlagColumn,
                $scope, Restangular: restangular.IService, StateStack, _) {

        initForm();

        function initForm() {
            $scope.healthSectionFlagColumn = healthSectionFlagColumn;
            $scope.sectionType = sectionType;
        }

        $scope.isDisabled = (value: HsColumnValue) => {
            return _.includes(HsBaseFlagColor_Ns.$all, value.color);
        };

        $scope.remove = (value: HsColumnValue) => {
            if (!$scope.isDisabled(value)) {
                $scope.healthSectionFlagColumn.values = $scope.healthSectionFlagColumn.values
                    .filter((val, pos) => val !== value);
                update();
            }
        };

        $scope.newValue = null;
        $scope.addNew = () => {
            const newValue: HsColumnValue = {
                title: '',
                color: null,
                value: 0
            };
            $scope.newValue = newValue;
        };

        $scope.onNewValueChange = (newValue: HsColumnValue) => {
            if (newValue.title && newValue.color) {
                $scope.healthSectionFlagColumn.values.push(newValue);
                $scope.newValue = null;
                update();
            }
        };

        $scope.onValueChange = (value: HsColumnValue) => {
            update();
        };

        $scope.backOrDone = () => {
            StateStack.goBack();
        };

        function update() {
            return Restangular
                .one('healthFlag', sectionType)
                .customPUT($scope.healthSectionFlagColumn);

        }

    }
}
