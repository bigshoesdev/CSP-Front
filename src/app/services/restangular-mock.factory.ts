
/** @ngInject */
export function RestangularMockup(Restangular) {
    return Restangular.withConfig(function (RestangularConfigurer) {
        RestangularConfigurer.setBaseUrl('/api');
    });
}
