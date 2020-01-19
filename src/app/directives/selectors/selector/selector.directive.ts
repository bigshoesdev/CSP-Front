/** @ngInject */
export function selector($mdSticky) {
    return {
        restrict: 'A',
        templateUrl: 'app/directives/selectors/selector/selector.html',
        scope: {
            selected: '=selector', // { id, name }[]
            allList: '=selectorAll', // { id, name }[]
            title: '@selectorTitle', // string
            idPropertyChain: '@selectorIdProperty', // string (id property chain, string started from dot: '.item.innerItem.id')
            displayItem: '=selectorDisplayItem',
            onClose: '&?selectorOnClose',
            name: '@', // string
            ngRequired: '=?ngRequired',
            disabled: '=',
            multiple: '@multiple',
            searchable: '@?searchable',
        },
        compile: (tElement, tAttrs, transclude) => {

            return function postLink(scope, element, attrs) {
                const isMultiple = scope.multiple !== undefined && scope.multiple !== 'false';
                const searchable = scope.searchable !== undefined && scope.searchable !== 'false';

                $mdSticky(scope, element.find('md-select-header'));

                scope.shareObj = {
                    searchTerm: '',
                    selected: null,
                    displayName: (item) => {
                        return (item && item.name)
                            ? item.name
                            : item;
                    }
                };

                if (scope.displayItem) {
                    scope.shareObj.displayName = scope.displayItem;
                }

                scope.updateSearch = (event) => {
                    event.stopPropagation();
                };

                scope.searchable = searchable;
                scope.isMultiple = isMultiple;

                scope._selectedText = () => {
                    let selectedText = scope.title;
                    if (isMultiple) {
                        // scope.selected is array
                        if (scope.selected && scope.selected.length > 0) {
                            if (!scope.allList) {
                                return '';
                            }
                            selectedText = (scope.selected.length === scope.allList.length)
                                ? 'All selected'
                                : scope.selected.length + ' selected';
                        }
                    } else {
                        if (scope.selected) {
                            selectedText = scope.shareObj.displayName(scope.selected);
                        }
                    }
                    return selectedText;
                };

                scope.isIndeterminate = () => {
                    const {selected} = scope;
                    return (selected && selected.length > 0 && selected.length !== scope.allList.length);
                };

                scope.isChecked = () => {
                    const {selected, allList} = scope;
                    return (!!selected) ? selected.length === allList.length : false;
                };

                scope.toggleAll = () => {
                    if (!!scope.selected) {
                        if (scope.selected.length === scope.allList.length) {
                            scope.selected = [];
                        } else {
                            scope.selected = scope.allList.slice(0);
                        }
                    }
                };

            };
        }
    };
}

