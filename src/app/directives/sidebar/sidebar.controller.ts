export class SidebarController {

    /** @ngInject */
    constructor(private $scope,
                private items) {

        $scope.items = items;
    }

}
