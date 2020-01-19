import {DashboardController} from '../../components/dashboard/dashboard.controller';

/** @ngInject */
export function menuButton() {
    return {
        templateUrl: 'app/directives/menuButton/menuButton.html',
        restrict: 'AE',
        link: postLink,
    };

    function postLink(scope, iElement, iAttrs) {
        scope.toggleLeft = () => {
            const dashboardController: DashboardController = scope.DashboardController;
            dashboardController.toggleLeft();
        };
    }
}
