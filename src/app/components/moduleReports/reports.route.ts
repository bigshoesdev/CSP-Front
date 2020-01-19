import {DataCacheService} from '../../services/storage/data-cache.service';
import {Report} from '../../model/rest/Report';
import {
    checkModuleAccess,
    getReport,
    getReportByKey,
    getReportTable
} from '../../services/route.generators';

/** @ngInject */
export function reportsRouterConfig($stateProvider: ng.ui.IStateProvider) {

    $stateProvider
        .state('auth.reports', {
            url: '/reports',
            views: {
                'sidebar@': {
                    templateUrl: 'app/components/moduleReports/components/reportList.html',
                    controller: 'ReportListController',
                    resolve: {
                        items: (Sidebars) => Sidebars.reports
                    }
                },
                'main@auth': {
                    template: '<menu-button></menu-button><h1>Reports module</h1>'
                }
            },
            resolve: {
                checkModuleAccess: checkModuleAccess('REPORTS')
            }
        })
        .state('auth.reports.reportList', {
            url: '/all',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleReports/components/reportList.html',
                    controller: 'ReportListController'
                }
            }
        })
        .state('auth.reports.reportEdit', {
            url: '/reports/edit/{reportId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleReports/components/report/report.html',
                    controller: 'ReportController',
                    resolve: {
                        isEdit: () => true,
                        sessions: (DataCacheService: DataCacheService) => DataCacheService.getSessions(),
                        report: getReport
                    }
                }
            }
        })
        .state('auth.reports.reportNew', {
            url: '/reports/new',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleReports/components/report/report.html',
                    controller: 'ReportController',
                    resolve: {
                        isEdit: () => false,
                        sessions: (DataCacheService: DataCacheService) => DataCacheService.getSessions(),
                        report: function (): Report {
                            return {
                                id: null,
                                autoupdate: false
                            } as Report;
                        }
                    }
                }
            }
        });

    $stateProvider
        .state({
            name: 'reportTable',
            url: '/report/{reportKey}',
            templateUrl: 'app/components/moduleReports/components/reportTable/reportTable.html',
            controller: 'ReportTableController',
            controllerAs: 'ctrl',
            resolve: {
                reportTable: getReportTable,
                report: getReportByKey
            }
        });
}

