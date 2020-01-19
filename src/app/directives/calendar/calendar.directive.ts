import {EventCalendarController} from './eventCalendar.controller';
import {AvailabilityCalendarController} from './availabilityCalendar.controller';
import {BimodelEventCalendarController} from './bimodelEventCalendar.controller';

declare let angular: any;
declare let $: any;

/** @ngInject */
export function eventCalendar($window: ng.IWindowService, $document: ng.IDocumentService, $timeout: ng.ITimeoutService) {
    return _getDirectiveConf('eventCalendar', EventCalendarController, $window, $document, $timeout);
}

/** @ngInject */
export function availabilityCalendar($window: ng.IWindowService, $document: ng.IDocumentService, $timeout: ng.ITimeoutService) {
    return _getDirectiveConf('availabilityCalendar', AvailabilityCalendarController, $window, $document, $timeout);
}

/** @ngInject */
export function bimodelEventCalendar($window: ng.IWindowService, $document: ng.IDocumentService, $timeout: ng.ITimeoutService) {
    return _getDirectiveConf('bimodelEventCalendar', BimodelEventCalendarController, $window, $document, $timeout);
}

function _getDirectiveConf(directiveName, controller, $window: ng.IWindowService, $document: ng.IDocumentService, $timeout: ng.ITimeoutService) {

    return {
        restrict: 'AC',
        templateUrl: 'app/directives/calendar/calendar.html',
        controller: controller,
        controllerAs: 'ctrl',
        scope: {
            config: '=' + directiveName, // CalendarConf
            controller: '=?calendarCtrl'
        },
        compile: function (tElement, tAttrs, transclude) {
            /*
             let tHeader = tElement.find('.header');
             let headerTemplate = tHeader[0].outerHTML;
             */

            return function postLink(scope, iElement, iAttrs) {
                /*
                 // makes header sticky
                 let iHeader = iElement.find('.header');
                 $mdSticky(scope, iHeader, $compile(headerTemplate)(scope));
                 */
                const canvas = iElement.find('canvas.virtualGrid');

                const ctrl = scope.ctrl;

                waitSize().then((calendarBodyWidthHeightPair) => {
                    ctrl.init(calendarBodyWidthHeightPair[0], canvas);
                    updateWidthCalendar();
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

                function updateWidthCalendar() {
                    // The timeout need for updated styles in calendar
                    $timeout(() => ctrl.onCalendarResize(calendarBody.width()));
                }

                // detect screen with changes
                const _w = $($window);
                _w.on('resize.doResize', () => {
                    scope.$apply(() => {
                        updateWidthCalendar();
                    });
                });

            };
        }
    };

}
