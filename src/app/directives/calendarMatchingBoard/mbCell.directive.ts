import {MbCellController} from './mbCell.controller';

declare let angular: any;
declare let $: any;

/** @ngInject */
export function mbCell($window: ng.IWindowService, $document: ng.IDocumentService, $timeout: ng.ITimeoutService) {

    return {
        restrict: 'A',
        templateUrl: 'app/directives/calendarMatchingBoard/mbCell.html',
        controller: 'MbCellController',
        controllerAs: 'ctrl',
        scope: {
            config: '=mbCell' // IMbCell
        },
        link: function postLink(scope, iElement, iAttrs) {

            /*
             // makes header sticky
             let iHeader = iElement.find('.header');
             $mdSticky(scope, iHeader, $compile(headerTemplate)(scope));
             */
            const canvas = iElement.find('canvas.virtualGrid');

            const ctrl: MbCellController = scope.ctrl;

            waitSize().then((calendarBodyWidthHeightPair) => {
                ctrl.init(calendarBodyWidthHeightPair[0], canvas);
            });

            const calendarBody = iElement.find('.calendarBody');

            function waitSize() {
                return $timeout(() => {
                    const width = calendarBody.innerWidth();
                    const height = calendarBody.innerHeight();
                    if (width > 0 && height > 0) {
                        return [width, height];
                    } else {
                        return waitSize();
                    }
                }, 0);
            }

            // detect screen with changes
            const _w = $($window);
            _w.on('resize.doResize', () => {
                scope.$apply(() => {
                    ctrl.onCalendarResize(calendarBody.width());
                });
            });

        }
    };

}
