import {HsConditionColumn} from '../../../../model/rest/HsConditionColumn';
import {HsFlagColumn} from '../../../../model/rest/HsFlagColumn';
import {HsConditionColumnValue} from '../../../../model/rest/HsConditionColumnValue';
import {HsFlagColumnValue} from '../../../../model/rest/HsFlagColumnValue';
import {HsType_Ns} from '../../../../model/rest/HsType';
import {HsColumnValue} from '../../../../model/rest/HsColumnValue';
import HsType = HsType_Ns.HsType;
import * as restangular from 'restangular';
import {IPromise} from "angular";

declare let angular: any;

export class HsEditConditionController {
    /** @ngInject */
    constructor(sectionType: HsType,
                healthConditionColumn: HsConditionColumn,
                healthSectionFlagColumn: HsFlagColumn,
                $scope, Restangular: restangular.IService, StateStack) {

        initForm();

        function initForm() {
            sortHsConditionColumnValues(healthConditionColumn.values); // sort for consistency
            $scope.healthConditionColumn = healthConditionColumn;
            $scope.sectionType = sectionType;
            $scope.flagsValues = healthSectionFlagColumn.values.map((v: HsFlagColumnValue) => v.color);
            $scope.newHealthCondition = null as HsConditionColumnValue;
        }

        $scope.availableSections = angular.copy(HsType_Ns.$conditionAvailable);


        $scope.addNew = () => {
            $scope.newHealthCondition = {
                id: null,
                title: '',
                defaultFlagColor: '',
                sections: [sectionType]
            } as HsConditionColumnValue;
        };

        $scope.applyNew = () => {
            const healthConditionColumn: HsConditionColumn = $scope.healthConditionColumn;
            healthConditionColumn.values.push($scope.newHealthCondition);
            sortHsConditionColumnValues(healthConditionColumn.values); // sort for consistency
            updateModel().then(() => {
                $scope.newHealthCondition = null;
            });
        };

        $scope.onChange = (healthCondition: HsConditionColumnValue) => {
            if (healthCondition.title &&
                healthCondition.sections.length) {
                updateModel();
            }
        };

        $scope.displayFlag = (flag: HsColumnValue) => flag.title;

        $scope.remove = (healthCondition: HsConditionColumnValue, $event) => {
            $event.stopPropagation();
            $scope.healthConditionColumn.values = $scope.healthConditionColumn.values
                .filter((hc: HsConditionColumnValue) => hc !== healthCondition);
            updateModel();
        };

        $scope.backOrDone = () => {
            StateStack.goBack();
        };

        function updateModel() {
            return putModel();
        }

        function putModel(): IPromise<void> {
            const healthConditionColumn: HsConditionColumn = $scope.healthConditionColumn;
            return Restangular
                .one('healthCondition', sectionType)
                .customPUT(healthConditionColumn);
        }

        function sortHsConditionColumnValues(values: HsConditionColumnValue[]): HsConditionColumnValue[] {
            values.sort((a: HsConditionColumnValue, b: HsConditionColumnValue) => {
                if (a.title < b.title) { return -1; } else if (a.title > b.title) { return 1; } else { return 0; }
            });
            return values;
        }
    }
}
