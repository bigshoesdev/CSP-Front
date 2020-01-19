import {checkModuleAccess, } from '../../services/route.generators';
import {EstimateListController} from './components/estimateList/estimateList.controller';
import {DataCacheService} from '../../services/storage/data-cache.service';
import {EstimateController} from './components/estimate/estimate.controller';
import {ApiEstimateService} from '../../services/api/api-estimate.service';
import {ApiBookingService} from '../../services/api/api-booking.service';
import {dateFormat} from '../../services/app.constant';
import {Estimate} from '../../model/rest/Estimate';
import {ApiReconcileService} from '../../services/api/api-reconcile.service';

/** @ngInject */
export function estimateRouterConfig($stateProvider: ng.ui.IStateProvider) {

    // Reconcile module
    $stateProvider
        .state('auth.reconcile', {
            url: '/reconcile',
            views: {
                'sidebar@': {
                    templateUrl: 'app/directives/sidebar/sidebar.html',
                    controller: 'SidebarController',
                    resolve: {
                        items: (Sidebars) => Sidebars.reconcile,
                    },
                },
                'main@auth': {
                    template: '<menu-button></menu-button><h1>Reconcile module</h1>',
                },
            },
            resolve: {
                checkModuleAccess: checkModuleAccess('RECONCILE'),
            },
        });

    // Remote Server
    $stateProvider
        .state('auth.reconcile.reconcile', {
            url: '/reconcile?date',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleEstimate/components/reconcile/reconcile.html',
                    controller: 'ReconcileController',
                    resolve: {
                        reconcileEvents: (ApiReconcileService: ApiReconcileService, $stateParams, moment) => {
                            const date = $stateParams.date || moment().format(dateFormat);
                            return ApiReconcileService.getReconcileEventsOfDate(date);
                        },
                        unsentEstimates: (ApiEstimateService: ApiEstimateService): Promise<Estimate[]> => ApiEstimateService.getEstimates(),
                        date: ($stateParams) => $stateParams.date,
                        services: (DataCacheService: DataCacheService) => DataCacheService.getServices(),
                        therapists: (DataCacheService: DataCacheService) => DataCacheService.getTherapists(),
                        clients: (DataCacheService: DataCacheService) => DataCacheService.getClients(),
                        rooms: (DataCacheService: DataCacheService) => DataCacheService.getRooms(),
                        categories: (DataCacheService: DataCacheService) => DataCacheService.getCategories(),
                        sessions: (DataCacheService: DataCacheService) => DataCacheService.getSessions(),
                        restrictions: (DataCacheService: DataCacheService) => DataCacheService.getRestrictions(),
                        concreteEventSubStatuses: (ApiBookingService: ApiBookingService) => ApiBookingService.getEventSubStatus(),
                    },
                },
            },
        });

    // Estimate
    $stateProvider
        .state('auth.estimate', {
            url: '/estimates',
            views: {
                'sidebar@': {
                    templateUrl: 'app/directives/sidebar/sidebar.html',
                    controller: 'SidebarController',
                    resolve: {
                        items: (Sidebars) => Sidebars.estimate,
                    },
                },
                'main@auth': {
                    template: '<menu-button></menu-button><h1>Estimate</h1>',
                },
            },
            resolve: {
                checkModuleAccess: checkModuleAccess('ESTIMATE'),
            },
        });

    $stateProvider
        .state('auth.estimate.list', {
            url: '/list',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleEstimate/components/estimateList/estimateList.html',
                    controller: 'EstimateListController',
                    controllerAs: 'EstimateListController',
                    resolve: {
                        sessions: (DataCacheService: DataCacheService) => DataCacheService.getSessions(),
                        clients: (DataCacheService: DataCacheService) => DataCacheService.getClients(),
                    },
                },
            },
        })
        .state('auth.estimate.new', {
            url: '/new',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleEstimate/components/estimate/estimate.html',
                    controller: 'EstimateController',
                    controllerAs: 'EstimateController',
                    resolve: {
                        estimate: () => ({clientId: null, sent: false, events: []}),
                        isCreationMode: () => true,
                        isReadOnly: () => false,
                        sessions: (DataCacheService: DataCacheService) => DataCacheService.getSessions(),
                        clients: (DataCacheService: DataCacheService) => DataCacheService.getClients(),
                        services: (DataCacheService: DataCacheService) => DataCacheService.getServices(),
                        therapists: (DataCacheService: DataCacheService) => DataCacheService.getTherapists(),
                        rooms: (DataCacheService: DataCacheService) => DataCacheService.getRooms(),
                        categories: (DataCacheService: DataCacheService) => DataCacheService.getCategories(),
                        restrictions: (DataCacheService: DataCacheService) => DataCacheService.getRestrictions(),
                        concreteEventSubStatuses: (ApiBookingService: ApiBookingService) => ApiBookingService.getEventSubStatus(),
                    },
                },
            },
        })
        .state('auth.estimate.edit', {
            url: '/edit/{estimateId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleEstimate/components/estimate/estimate.html',
                    controller: 'EstimateController',
                    controllerAs: 'EstimateController',
                    resolve: {
                        estimate: ($stateParams, ApiEstimateService: ApiEstimateService) => ApiEstimateService.getEstimate($stateParams.estimateId),
                        isCreationMode: () => false,
                        isReadOnly: () => false,
                        sessions: (DataCacheService: DataCacheService) => DataCacheService.getSessions(),
                        clients: (DataCacheService: DataCacheService) => DataCacheService.getClients(),
                        services: (DataCacheService: DataCacheService) => DataCacheService.getServices(),
                        therapists: (DataCacheService: DataCacheService) => DataCacheService.getTherapists(),
                        rooms: (DataCacheService: DataCacheService) => DataCacheService.getRooms(),
                        categories: (DataCacheService: DataCacheService) => DataCacheService.getCategories(),
                        restrictions: (DataCacheService: DataCacheService) => DataCacheService.getRestrictions(),
                        concreteEventSubStatuses: (ApiBookingService: ApiBookingService) => ApiBookingService.getEventSubStatus(),
                    },
                },
            },
        })
        .state('auth.estimate.view', {
            url: '/view/{estimateId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleEstimate/components/estimate/estimate.html',
                    controller: 'EstimateController',
                    controllerAs: 'EstimateController',
                    resolve: {
                        estimate: ($stateParams, ApiEstimateService: ApiEstimateService) => ApiEstimateService.getEstimate($stateParams.estimateId),
                        isCreationMode: () => false,
                        isReadOnly: () => true,
                        sessions: (DataCacheService: DataCacheService) => DataCacheService.getSessions(),
                        clients: (DataCacheService: DataCacheService) => DataCacheService.getClients(),
                        services: (DataCacheService: DataCacheService) => DataCacheService.getServices(),
                        therapists: (DataCacheService: DataCacheService) => DataCacheService.getTherapists(),
                        rooms: (DataCacheService: DataCacheService) => DataCacheService.getRooms(),
                        categories: (DataCacheService: DataCacheService) => DataCacheService.getCategories(),
                        restrictions: (DataCacheService: DataCacheService) => DataCacheService.getRestrictions(),
                        concreteEventSubStatuses: (ApiBookingService: ApiBookingService) => ApiBookingService.getEventSubStatus(),
                    },
                },
            },
        })
    ;

}
