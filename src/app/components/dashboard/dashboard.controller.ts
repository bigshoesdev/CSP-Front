export class DashboardController {
    /** @ngInject */
    constructor(private $scope,
                private $mdSidenav,
                private _: any,
                private SidebarService,
                private $window: ng.IWindowService,
                private $timeout: ng.ITimeoutService,
                private RightSidebarConfig) {

        $scope.isOpen = false;

        $scope.rightSidebarConfig = RightSidebarConfig;

        $scope.hideRightToggle = () => !$scope.rightSidebarConfig.state;

        $scope.isLeftPageslideOpen = SidebarService.isLeftPageslideOpen();

        $scope.toggleRight = () => this.toggleRight();
    }

    toggleLeft() {
        const $scope = this.$scope;
        this.$scope.leftMenuExpanded = !($scope.leftMenuExpanded && $scope.leftMenuExpanded === true);
        this.SidebarService.setLeftPageslideOpen($scope.isLeftPageslideOpen = !$scope.isLeftPageslideOpen);
        this.$timeout(() => this.$window.dispatchEvent(new Event('resize')), 0);
        $scope.$broadcast('render');
    }

    toggleRight() {
        return this.$mdSidenav('right').toggle();
    }

    openRight() {
        return this.$mdSidenav('right').open();
    }

    closeRight() {
        return this.$mdSidenav('right').close();
    }

}
