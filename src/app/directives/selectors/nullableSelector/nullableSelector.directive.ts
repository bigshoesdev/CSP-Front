/** @ngInject */
export function nullableSelector($mdSticky) {
    return {
        restrict: 'A',
        templateUrl: 'app/directives/selectors/nullableSelector/nullableSelector.html',
        scope: {
            selected: '=nullableSelector', // { id, name }[]
            allList: '=nullableSelectorAll', // { id, name }[]
            title: '@nullableSelectorTitle', // string
            nullTitle: '@nullableSelectorNullTitle', // string
            idPropertyChain: '@nullableSelectorIdProperty', // string (id property chain, string started from dot: '.item.innerItem.id')
            displayItem: '=?nullableSelectorDisplayItem',
            onClose: '&?nullableSelectorOnClose',
            name: '@', // string
            required: '@',
            disabled: '=',
        },
        link: (scope, element, attrs) => {

            scope.empty = null;

            element.find('#searchId').on('keydown', function (ev) {
                ev.stopPropagation(); // to available typing in the input field
            });

            scope._selectedText = () => {
                let selectedText;
                // scope.selected is array
                if (!scope.selected) {
                    selectedText = scope.nullTitle;
                } else {
                    selectedText = scope._displayItem(scope.selected);
                }
                return selectedText;
            };

            if (scope.displayItem) {
                scope._displayItem = (item) => {
                    return scope.displayItem(item);
                };
            } else {
                scope._displayItem = (item) => item;
            }

        },

    };
}

