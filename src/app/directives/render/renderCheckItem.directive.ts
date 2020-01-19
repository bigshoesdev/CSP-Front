
/** @ngInject */
export function renderCheckItem(_) {
    return {
        template: '<md-checkbox ng-checked="ifSelected()" ng-click="toggle()" aria-label="{{itemId}}"></md-checkbox>',
        restrict: 'A',
        scope: {
            itemId: '=renderCheckItem',
            listId: '=renderCheckList'
        },
        link: function (scope, iElement, iAttrs) {

            if (!scope.listId) {
                scope.listId = [];
            }

            const itemId = scope.itemId;

            scope.ifSelected = () => {
                return _.includes(scope.listId, itemId);
            };

            scope.toggle = () => {
                const isIncludes = _.includes(scope.listId, itemId);
                if (isIncludes) {
                    const foundId = _.findIndex(scope.listId, (id) => id === itemId);
                    if (foundId >= 0) {
                        scope.listId.splice(foundId, 1);
                    }
                } else {
                    scope.listId.push(itemId);
                }
            };

        }
    };


}
