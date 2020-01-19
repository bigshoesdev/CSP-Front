
/** @ngInject */
export function objectsSelector(_, $mdSticky) {
    return {
        restrict: 'A',
        templateUrl: 'app/directives/selectors/objectsSelector/objectsSelector.html',
        scope: {
            selectedObjects: '=objectsSelector', // { id, name }[]
            allObjects: '=objectsSelectorAll', // { id, name }[]
            selectedText: '@objectsSelectorText',// string
            disabled: '=',
        },
        link: function postLink(scope, element, attrs) {
            scope.unselect = (excludeObj) => {
                const excludeObjId = excludeObj.id;
                scope.selectedObjects = _.filter(scope.selectedObjects, (obj) => obj.id != excludeObjId);
            };

            scope.displayItem = (item) => item && item.name;
        }
    };
}

