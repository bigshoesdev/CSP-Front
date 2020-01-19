import {LocalStorageService} from './storage/local-storage.service';
declare let window: any;

/** @ngInject */
function AuthInterceptor($injector, LocalStorageService: LocalStorageService, $q: any, $log) {

    const apiUrl = window.__env.apiUrl;

    return {
        request: function (config) {
            // only requests to API
            if (config.url.indexOf('/api/') > 0) {
                const token = LocalStorageService.getItem('AuthKey');
                if (token) {
                    config.headers.AuthKey = token;
                }
            }
            return config;
        },

        responseError: function(rejection) {

            $log.error('AuthInterceptor:', rejection);

            if (rejection.config.url.indexOf(apiUrl) === 0) { // if it was API request:
                let errorToast = rejection.data && rejection.data.message || '';
                if (rejection.status == 403) {
                    errorToast += ' You have no permission to method ' + rejection.config.method + ' ' + rejection.data.path;
                    $injector.get('AuthService').eraseCredentials();
                    $injector.get('$state').go('authless.login');
                } else if (rejection.status == -1) {
                    errorToast += ' Server is down ';
                    $injector.get('AuthService').eraseCredentials();
                    $injector.get('$state').go('authless.login');
                }
                $injector.get('toastr').error(errorToast, 'Error');
            }

            return $q.reject(rejection);
        }
    };

}

export {AuthInterceptor};
