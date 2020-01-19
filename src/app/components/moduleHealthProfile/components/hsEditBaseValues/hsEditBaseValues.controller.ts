import {HsBaseColumnValue} from '../../../../model/rest/HsBaseColumnValue';

declare let angular: any;

export abstract class HsEditBaseValuesController {

    constructor(values: HsBaseColumnValue[],
                $scope, StateStack) {

        const __this = this;

        initForm(values);

        function initForm(values: HsBaseColumnValue[]) {
            $scope.values = values;
        }

        $scope.sortableOptions = {
            stop: function (e, ui) {
                $scope.values.forEach((value: HsBaseColumnValue, columnPosition) => {
                    value.position = columnPosition;
                });
                __this.update($scope.values);
            }
        };

        $scope.remove = (value, position) => {
            $scope.values = $scope.values.filter((val, pos) => val !== value);
            __this.update($scope.values);
        };

        $scope.newValue = null;
        $scope.addNew = () => {
            $scope.newValue = {
                title: '',
                value: 0,
                position: $scope.values.length
            };
        };

        $scope.onNewValueAdd = (newValue) => {
            if (newValue.title && newValue.value) {
                $scope.values.push(newValue);
                $scope.newValue = null;
                __this.update($scope.values);
            }
        };

        $scope.onValueChange = (value, position) => {
            __this.update($scope.values);
        };

        $scope.backOrDone = () => {
            StateStack.goBack();
        };

    }


    abstract update(values: HsBaseColumnValue[]);
}
