
/** @ngInject */
export function runBlock($rootScope, _, StateStack) {
    $rootScope._ = _; // // use in views, ng-repeat="x in _.range(3)"

    $rootScope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) => {
        StateStack.putState(toState, toParams, fromState, fromParams);
    });
}
