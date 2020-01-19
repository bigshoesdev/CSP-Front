/** @ngInject */
export function list($parse: ng.IParseService,
                     $mdSidenav,
                     $log,
                     $localStorage: any) {
    return {
        restrict: 'A',
        templateUrl: 'app/directives/list/list.html',
        compile: function (tElement, tAttrs) {
            const fn = $parse(tAttrs.list, /* interceptorFn */ null, /* expensiveChecks */ true);

            return function postLink(scope: any) {
                scope.sortState = [];

                scope.pageElements = [5, 10, 15, 20];

                if ($localStorage.itemsPerPage) {
                    scope.paging.itemsPerPage = $localStorage.itemsPerPage;
                }

                scope.hideOflineFilter = tAttrs.listFilter && JSON.parse(tAttrs.listFilter);
                scope.$watch(() => fn(scope), (config) => {
                    scope.config = config;
                });

                scope.toggleRight = buildToggler('right');

                scope.toggleSort = (sortKey) => {
                    if (scope.sortBy) {
                        const sortState = scope.sortState[sortKey];
                        scope.sortState.map(() => false);
                        scope.sortState[sortKey] = !sortState;
                        scope.sortBy(!sortState ? '-' + sortKey : '+' + sortKey);
                    }
                };

                scope.isSortActive = (sortKey) => {
                    return scope.sort.indexOf(sortKey) >= 0;
                };

                scope.isSortInverse = (sortKey) => {
                    return scope.isSortActive(sortKey) && scope.sort.indexOf('-') >= 0;
                };

                scope.changeItemsPerPage = (count) => {
                    scope.paging.itemsPerPage = $localStorage.itemsPerPage = count;
                    scope.paging.pageChanged();
                };

                function buildToggler(navID) {
                    return function () {
                        // component lookup should always be available since we are not using `ng-if`
                        $mdSidenav(navID)
                            .toggle()
                            .then(function () {
                                $log.debug("toggle " + navID + " is done");
                            });
                    };
                }

            };
        }

    };
}

