declare let moment: any;

/** @ngInject */
export function config($logProvider,
                       toastrConfig,
                       $httpProvider,
                       RestangularProvider,
                       env,
                       $mdThemingProvider,
                       $mdDateLocaleProvider) {
    // enable log
    $logProvider.debugEnabled(env.enableDebug);
    // set options third-party lib
    toastrConfig.autoDismiss = true;
    toastrConfig.allowHtml = true;
    toastrConfig.timeOut = 10000;
    toastrConfig.extendedTimeOut = 0;
    toastrConfig.newestOnTop = true;
    toastrConfig.positionClass = 'toast-bottom-right';
    toastrConfig.preventDuplicates = false;
    toastrConfig.preventOpenDuplicates = true;
    // toastrConfig.progressBar = true;

    RestangularProvider.setBaseUrl(env.apiUrl);

    $httpProvider.interceptors.push('authInterceptor');


    const primaryPalette = $mdThemingProvider.extendPalette('light-green', {'500': '#9ECC4E'});
    $mdThemingProvider.definePalette('primaryPalette', primaryPalette);

    const accentPalette = $mdThemingProvider.extendPalette('light-green', {'A200': '#32651C'});
    $mdThemingProvider.definePalette('accentPalette', accentPalette);

    const warnPalette = $mdThemingProvider.extendPalette('deep-orange', {'500': '#F16723'});
    $mdThemingProvider.definePalette('warnPalette', warnPalette);

    $mdThemingProvider.theme('csp')
        .primaryPalette('primaryPalette')
        .accentPalette('accentPalette')
        .warnPalette('warnPalette')
    // .backgroundPalette('grey')
    ;

    $mdThemingProvider.setDefaultTheme('csp');

    $mdDateLocaleProvider.formatDate = function (date) {
        return moment(date).format('MM-DD-YYYY');
    };
}
