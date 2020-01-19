import {weekDaysShort} from '../../services/app.constant';

declare let angular: any;

export class WeekSelectorController {
    /** @ngInject */
    constructor(private $scope) {
        $scope.weekDaysShort = angular.copy(weekDaysShort);
        $scope.items = [0, 1, 2, 3, 4, 5, 6];
    }

    public toggle(item, list) {
        const idx = list.indexOf(item);
        if (idx > -1) {
            list.splice(idx, 1);
        } else {
            list.push(item);
        }
    }

    public exists(item, list) {
        return list.indexOf(item) > -1;
    }

    public isIndeterminate() {
        const $scope = this.$scope;
        const selected = $scope.selected;
        return (selected.length > 0 && selected.length !== $scope.items.length);
    }

    public isChecked() {
        const $scope = this.$scope;
        return $scope.selected.length === $scope.items.length;
    }

    public toggleAll() {
        const $scope = this.$scope;
        if ($scope.selected.length === $scope.items.length) {
            $scope.selected = [];
        } else {
            $scope.selected = $scope.items.slice(0);
        }
    }

    public isDayDisabled(item) {
        const $scope = this.$scope;
        const disabledDays = $scope.disabledDays;
        if (!disabledDays || disabledDays.length === 0) {
            return false;
        }
        return disabledDays.some((disabledDay) => disabledDay === item);
    }
}
