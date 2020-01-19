export interface IReportExpandListAttr extends Attr {
    data: string;
    listFilter: string;
}

/** @ngInject */
export function reportExpandList($parse: ng.IParseService,
                                 $mdSidenav,
                                 $state: ng.ui.IStateService,
                                 $log: ng.ILogService,
                                 $localStorage: any) {

    return {
        restrict: 'AE',
        templateUrl: 'app/components/moduleReports/directives/reportExpandList/reportExpandList.html',
        compile: function (tElement: JQuery, tAttrs: IReportExpandListAttr) {
            const fn = $parse(tAttrs.data, null, true);

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

                scope.redirectToReportTable = (reportKey: string) => {
                    const url = $state.href('reportTable', {reportKey});
                    window.open(url, '_blank');
                };

                scope.toggleExpand = (index: number) => {
                    const panel = tElement.find(`#expandPanel${index}`);
                    if (panel.hasClass('expanded')) {
                        panel[0].className = 'expand';
                        // panel.removeClass('expanded');
                    } else {
                        panel[0].className = 'expand expanded';
                        // panel.addClass('expanded');
                    }

                };

                scope.toggleRight = buildToggler('right');

                scope.toggleSort = (sortKey: string) => {
                    if (scope.sortBy) {
                        const sortState = scope.sortState[sortKey];
                        scope.sortState.map(() => false);
                        scope.sortState[sortKey] = !sortState;
                        scope.sortBy(!sortState ? '-' + sortKey : '+' + sortKey);
                    }
                };

                scope.isSortActive = (sortKey: string) => {
                    return scope.sort.indexOf(sortKey) >= 0;
                };

                scope.isSortInverse = (sortKey: string) => {
                    return scope.isSortActive(sortKey) && scope.sort.indexOf('-') >= 0;
                };

                scope.changeItemsPerPage = (count: number) => {
                    scope.paging.itemsPerPage = $localStorage.itemsPerPage = count;
                    scope.paging.pageChanged();
                };

                function buildToggler(navID) {
                    return function () {
                        // component lookup should always be available since we are not using `ng-if`
                        $mdSidenav(navID)
                            .toggle()
                            .then(function () {
                                $log.debug('toggle ' + navID + ' is done');
                            });
                    };
                }

            };
        }

    };
}

