import {DashboardController} from '../../components/dashboard/dashboard.controller';

/** @ngInject */
export function rightSidebar($compile, $parse, $templateRequest) {
    return {
        restrict: 'A',
        compile: function (tElement, tAttrs, transclude) {
            const fn = $parse(tAttrs.rightSidebar, /* interceptorFn */ null, /* expensiveChecks */ true);

            return function postLink(scope, element, attrs) {
                scope.config = fn(scope);

                scope.$watch('config', handleTemplate, true);

                function handleTemplate(config, prevConfig) {
                    if (config.state == 'therapists') {
                        $templateRequest('app/directives/sidebar/rightSidebar/therapists.html').then(applyTemplate);
                    } else if (config.state == '') {
                        applyTemplate('');
                    }
                }

                function applyTemplate(template) {
                    const linkFn = $compile(template);
                    const content = linkFn(scope);
                    element.empty().append(content);
                }

                scope.clearRight = () => {
                    const dashboardController: DashboardController = scope.DashboardController;
                    dashboardController.closeRight().then(() => {
                        if (scope.config.state) {
                            delete scope.config[scope.config.state];
                            scope.config.state = '';
                        }
                    });
                };

            };
        },

    };
}


