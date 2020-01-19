declare let angular: any;

export interface IAutocompleteListConf {
    collectedItems: [{ id: number, name: string }];
    getMatchesPromise(searchText: string): Promise<{ id: number, name: string }[]>;
    onItemsChanged?(): any;
    removeConfirmPromise?: any; // asc confirm about removing

    // autocomplete configuration
    minLength?: number;
    floatingLabel?: string;
    noCache?: boolean;
    delay?: number;
    autoselect?: boolean;
}

/** @ngInject */
export function autocompleteList() {
    return {
        restrict: 'A',
        templateUrl: 'app/directives/autocompleteList/autocompleteList.html',
        scope: {
            config: '=autocompleteList', // instance of IAutocompleteListConf
            disabled: '=?disabled',
        },
        link: function postLink(scope, element, attrs) {

            const defaultConfig = {
                minLength: 0,
                floatingLabel: 'Search to add clients',
                noCache: false,
                delay: 0,
                autoselect: false
            };
            scope.config = angular.extend(defaultConfig, scope.config);

            scope.items = [];
            scope.selectedItem = null;
            scope.$watch('searchText', (searchText, p) => {
                scope.config
                    .getMatchesPromise(searchText)
                    .then((items: { id: number, name: string }[]) => {
                        const collectedItems = scope.config.collectedItems;
                        scope.items = items.filter((item: { id: number, name: string }) => {
                            const itemId = item.id;
                            return !collectedItems.some((collectedItem) => {
                                return itemId == collectedItem.id;
                            });
                        });
                    }, (reject) => {
                        scope.items = [];
                    });
            });
            scope.addItem = (selectedItem) => {
                if (selectedItem) {
                    const selectedItemId = selectedItem.id;
                    const includes = scope.config.collectedItems.some((item) => item.id == selectedItemId);
                    if (!includes) {
                        scope.config.collectedItems = scope.config.collectedItems.concat(selectedItem);
                    }
                }
                scope.searchText = '';
                scope.config.onItemsChanged();
            };

            let saveSearchText = '';
            scope.onSearchTextChange = (searchText) => {
                saveSearchText = searchText;
            };

            scope.removeItem = (excludedItem, $event) => {
                if (scope.config.removeConfirmPromise) {
                    scope.config.removeConfirmPromise(excludedItem, $event)
                        .then(() => removeItem(excludedItem));
                } else {
                    removeItem(excludedItem);
                }
            };

            function removeItem(excludedItem) {
                console.log('removeItem in directive');
                const excludedItemId = excludedItem.id;
                scope.config.collectedItems = scope.config.collectedItems.filter((item) => item.id != excludedItemId);
                scope.config.onItemsChanged();
            }
        }
    };
}

