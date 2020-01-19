
/** @ngInject */
export function cspModuleSelector(_) {
    return {
        templateUrl: 'app/directives/cspModuleSelector/cspModuleSelector.html',
        restrict: 'AE',
        link: postLink
    };

    function postLink(scope, iElement, iAttrs) {

        scope.openMenu = ($mdOpenMenu, ev) => {
            $mdOpenMenu(ev);
        };

        scope.currentModuleConf = null;

        scope.$watch('modulesSelectorConf.selectedKey', (selectedKey) => {
            console.log('scope.modulesSelectorConf.modulesConfigs', scope.modulesSelectorConf.modulesConfigs);
            scope.currentModuleConf = _.find(scope.modulesSelectorConf.modulesConfigs, (moduleConf) => moduleConf.key == selectedKey);
        });
    }
}


