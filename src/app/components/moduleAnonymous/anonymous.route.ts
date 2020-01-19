import {getPlain} from '../../services/route.generators';
import {ApiBookingService} from '../../services/api/api-booking.service';

/** @ngInject */
export function anonymousRouterConfig($stateProvider: ng.ui.IStateProvider) {

    // For anonymous users
    $stateProvider
        .state('authless', {})
        .state('authless.login', {
            url: '/login',
            views: {
                '@': {
                    templateUrl: 'app/components/moduleAnonymous/login/login.html',
                    controller: 'LoginController',
                    controllerAs: 'login'
                }
            }
        })
        .state('authless.forgotPassword', {
            url: '/forgotPassword',
            views: {
                '@': {
                    templateUrl: 'app/components/moduleAnonymous/password/forgotPassword.html',
                    controller: 'ForgotPasswordController',
                    controllerAs: 'password'
                }
            }
        })
        .state('authless.restorePassword', {
            url: '/restorePassword?securityKey&email',
            views: {
                '@': {
                    templateUrl: 'app/components/moduleAnonymous/password/restorePassword.html',
                    controller: 'RestorePasswordController',
                    controllerAs: 'password'
                }
            }
        })
        .state('authless.matchingBoardConfirmation', {
            url: '/matchingBoardConfirmation/{secret}',
            views: {
                '@': {
                    templateUrl: 'app/components/moduleAnonymous/matchingBoard/matchingBoardViewConfirmation.html',
                    controller: 'MatchingBoardViewConfirmationController',
                    controllerAs: 'ctrl',
                    resolve: {
                        secret: ($stateParams) => $stateParams.secret,
                        clientSimpleMatchingInfo: ($stateParams, Restangular) => {
                            return Restangular
                                .one('matchingBoard/confirmation', $stateParams.secret)
                                .get()
                                .then(getPlain);
                        }
                    }
                }
            }
        })
        .state('authless.bookingEventConfirmation', {
            url: '/bookingEventConfirmation/{eventCode}',
            views: {
                '@': {
                    templateUrl: 'app/components/moduleAnonymous/booking/bookingEventConfirmation.html',
                    controller: 'BookingEventConfirmationController',
                    controllerAs: 'ctrl',
                    resolve: {
                        eventCode: ($stateParams) => $stateParams.eventCode,
                        concreteEventChangeCode: ($stateParams, ApiBookingService: ApiBookingService) => ApiBookingService.getEventLastChange($stateParams.eventCode)
                    }
                }
            }
        });

}
