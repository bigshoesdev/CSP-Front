/** @ngInject */
export function chipsSelector() {
    return {
        restrict: 'A',
        templateUrl: 'app/directives/selectors/chipsSelector/chipsSelector.html',
        scope: {
            selectedList: '=chipsSelector', // { id, name }[]
            displayItem: '=?selectorDisplayItem',
            allList: '=chipsSelectorAll', // { id, name }[]
            onClose: '&?chipsSelectorOnClose',
            title: '@chipsSelectorTitle', // string
            multiple: '@?multiple',
            searchable: '@?searchable',
            ngRequired: '=?ngRequired',
            disabled: '=',
        },
        link: function postLink(scope, element, attrs) {
            if (!scope.displayItem) {
                scope.displayItem = (item) => item && item.name;
            }
        }
    };
}

