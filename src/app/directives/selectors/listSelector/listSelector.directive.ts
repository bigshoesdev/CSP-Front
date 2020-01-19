
/** @ngInject */
export function listSelector(_) {
    return {
        restrict: 'A',
        templateUrl: 'app/directives/selectors/listSelector/listSelector.html',
        scope: {
            selectedList: '=listSelector', // string[]
            allList: '=listSelectorAll', // string[]
            title: '@listSelectorTitle' // string
        },
        link: function postLink(scope, element, attrs) {
            scope.unselect = (excludeName) => {
                scope.selectedList = _.filter(scope.selectedList, (name) => name != excludeName);
            };
        }
    };
}

