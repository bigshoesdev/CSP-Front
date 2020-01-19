import {LoDashStatic} from '@types/lodash';

/** @ngInject */
export function leftMenu(Sidebars, _: LoDashStatic,
                         $timeout: ng.ITimeoutService,
                         $: any,
                         $document: ng.IDocumentService,
                         $localStorage: any) {
    return {
        templateUrl: 'app/directives/leftMenu/leftMenu.html',
        restrict: 'AE',
        link: postLink,
    };

    function postLink(scope) {
        scope.Sidebars = Sidebars;
        scope.itemExpanded = [];

        const watchActiveMenu = (time = 10) => {
            const selfFunc = watchActiveMenu;

            $timeout(() => {
                const subHeader = $($document).find('md-menu-item').has('md-list-item a.active');

                if (subHeader.length) {
                    const subHeaderButton = subHeader.find('>button');

                    if (!_.isEqual(scope.activeHeader, subHeaderButton)) {
                        if (!_.isNil(scope.activeHeader)) {
                            scope.activeHeader.removeClass('active');
                        }
                    }

                    subHeaderButton.addClass('active');
                    scope.activeHeader = subHeaderButton;
                } else {
                    selfFunc();
                }
            }, time);
        };
        /**
         * URL changing callback
         */
        scope.$on('$stateChangeSuccess', watchActiveMenu);

        scope.toggleExpand = (event, menuKey: string) => {
            const {itemExpanded} = scope;
            event.stopPropagation();

            for (let key in scope.itemExpanded) {
                if (key !== menuKey) {
                    scope.itemExpanded[key] = false;
                }
            }

            scope.itemExpanded[menuKey] =
                !(!_.isNil(itemExpanded[menuKey]) && itemExpanded[menuKey] === true);

            //Expand left menu if isn't
            if(scope.leftMenuExpanded){
                scope.leftMenuExpanded = false;
            }

            /**
             * Save expanded state in browser
             */
            if(scope.itemExpanded[menuKey]){
                $localStorage.activeMenu = menuKey;
            }else {
                $localStorage.activeMenu = null;
            }
        };

        scope.expandItem = (key: string) => {
            const {itemExpanded} = scope;

            return !_.isNil(itemExpanded[key]) && itemExpanded[key] === true;
        };

        watchActiveMenu(100);

        scope.toggleExpand(new Event('click'),$localStorage.activeMenu);
    }
}
