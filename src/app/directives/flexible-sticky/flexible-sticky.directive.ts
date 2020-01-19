declare let angular: any;
declare let _: any;

/** @ngInject */
export function flexibleSticky($window: any) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            const $win = angular.element($window);
            const item = {
                placeholder: attrs.usePlaceholder !== undefined,
                start: element.offset().top,
                styles: {}
            };

            const getCSS = ($el: any, prop: string) => {
                const el = $el[0],
                    computed = window.getComputedStyle(el),
                    prevDisplay = computed.display;
                let val;

                // hide the element so that we can get original css
                // values instead of computed values
                el.style.display = 'none';

                // NOTE - computed style declaration object is a reference
                // to the element's CSSStyleDeclaration, so it will always
                // reflect the current style of the element
                val = computed[prop];

                // restore previous display value
                el.style.display = prevDisplay;

                return val;
            };

            const checkPostion = () => {
                const pos = $win.scrollTop();
                if (pos > item.start) {
                    stickElement(pos);
                }
                else if (pos < item.start) {
                    unStickElement();
                }
            };

            const recheckPositions = () => {
                const parentCalendar = element.closest('.calendarRowTable');
                item.start = parentCalendar.offset().top + 8;
                item.styles['width'] = getCSS(parentCalendar, 'width');
                // item.styles.width = getCSS(parentCalendar, 'width');
                checkPostion();
            };

            const setParams = () => {
                item.start = element.offset().top;
                Object.assign(item.styles, scope.getInitialDimensions());
            };

            const stickElement = (pos) => {
                element.addClass('stuck');
                element.css('top', pos - item.start);
                element.css('width', item.styles['width']);
                // element.css('width', item.styles.width]);
            };

            const unStickElement = () => {
                element.removeClass('stuck');
                element.css('width', 'inherit');
            };

            scope.getInitialDimensions = function () {
                return {
                    zIndex: element.css('z-index'),
                    top: element.css('top'),
                    position: element.offset(), // revert to true initial state
                    marginTop: element.css('margin-top'),
                    marginBottom: element.css('margin-bottom'),
                    cssLeft: getCSS(element, 'left'),
                    width: element[0].offsetWidth,
                    height: element.css('height')
                };
            };


            $win.on('scroll.sticky', function (e) {
                checkPostion();
            });
            $win.on('resize', recheckPositions);
            setTimeout(() => setParams(), 100);
        }
    };
}
