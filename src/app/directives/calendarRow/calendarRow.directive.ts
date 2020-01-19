import {CalendarRowMbDatesController} from './impl/calendarRowMbDates.controller';
import {CalendarRowMbDateController} from './impl/calendarRowMbDate.controller';
import {CalendarRowConcreteEventsController} from './impl/calendarRowConcreteEvents.controller';
import {CalendarRowController} from './calendarRow.controller';

declare let angular: any;
declare let $: any;

/** @ngInject */
export function calendarRowMbDates($window: ng.IWindowService, $document: ng.IDocumentService, $timeout: ng.ITimeoutService) {
    return _getDirectiveConf(CalendarRowMbDatesController, $window, $document, $timeout);
}

/** @ngInject */
export function calendarRowMbDate($window: ng.IWindowService, $document: ng.IDocumentService, $timeout: ng.ITimeoutService) {
    return _getDirectiveConf(CalendarRowMbDateController, $window, $document, $timeout);
}

/** @ngInject */
export function calendarRowConcreteEvents($window: ng.IWindowService, $document: ng.IDocumentService, $timeout: ng.ITimeoutService) {
    return _getDirectiveConf(CalendarRowConcreteEventsController, $window, $document, $timeout);
}

function _getDirectiveConf(controller: any,
                           $window: ng.IWindowService,
                           $document: ng.IDocumentService,
                           $timeout: ng.ITimeoutService) {
    return {
        restrict: 'A',
        templateUrl: 'app/directives/calendarRow/calendarRow.html',
        controller: controller,
        controllerAs: 'ctrl',
        scope: {
            config: '=calendarRowModel', // type IRowCalModel
            columns: '=calendarRowColumns', // type IRowCalColumn[]
            controller: '=?calendarRowCtrl',
            customOnDrop: '=calendarRowOnDrop', // ()=>promise // validation criteria
            customOnAdd: '=calendarRowOnAdd', // ()=>promise
            customOnEdit: '=calendarRowOnEdit', // ()=>promise
        },
        link: function postLink(scope, iElement, iAttrs) {

            /*
             // makes header sticky
             let iHeader = iElement.find('.header');
             $mdSticky(scope, iHeader, $compile(headerTemplate)(scope));
             */
            const canvas = iElement.find('canvas.virtualGrid');
            const ctrl: CalendarRowController<any> = scope.ctrl;
            scope.$watch('config', () => {
                waitSize().then((calendarBodyWidthHeightPair) => {
                    ctrl.init(calendarBodyWidthHeightPair[0], canvas);
                });
            });

            const _w = $($window);
            const calendarBody = iElement.find('.calendarBody');
            let originalWindowWidth = 0;
            let originalCalendarWidth = 0;

            function waitSize() {
                return $timeout(() => {
                    const width = calendarBody.innerWidth();
                    const height = calendarBody.innerHeight();
                    if (width > 0 && height > 0) {
                        originalWindowWidth = _w.innerWidth();
                        originalCalendarWidth = width;
                        return [width, height];
                    } else {
                        return waitSize();
                    }
                }, 10);
            }

            scope.$on('render', () => {
                $timeout(() => {
                    scope.$apply(() => {
                        const leftIndent = $('.leftMenu').width() - 270;
                        const canvasWidth = originalCalendarWidth + _w.innerWidth() - originalWindowWidth - leftIndent;
                        ctrl.onCalendarResize(canvasWidth);
                    });
                }, 300);
            });

            // detect screen with changes
            _w.on('resize', () => {
                scope.$apply(() => {
                    // ctrl.onCalendarResize(originalCalendarWidth + _w.innerWidth() - originalWindowWidth);
                    const leftIndent = $('.leftMenu').width() - 270;
                    const canvasWidth = originalCalendarWidth + _w.innerWidth() - originalWindowWidth - leftIndent;
                    ctrl.onCalendarResize(canvasWidth);
                });
            });

        }

    };
}
