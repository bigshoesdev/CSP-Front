
/** @ngInject */
export function flexibleStickyColumn() {
    return {
        restrict: 'A',
        link: function (scope: object, element: JQuery, attrs: object) {
            const changeColumnPosition = (scrollLeft) => {
                const columnOfTimes = element.find('.calendarTimes');
                columnOfTimes.css({position: 'relative', left: scrollLeft, background: 'white'});
            };

            setTimeout(() => {
                $(window).scroll(() => {
                    const ElementScrollX = element.find('.ps-scrollbar-x-rail');
                    ElementScrollX.css('height', 15);

                    const BookingElementHeight = element.parents('.booking').height();
                    const topPosition = element.height();
                    const top = $(document).scrollTop();
                    const dblScrollTop = window.innerHeight - BookingElementHeight + topPosition - 241 + top;
                    ElementScrollX.css('top', dblScrollTop);
                    ElementScrollX.css('z-index', 10);
                    if (dblScrollTop > topPosition) {
                        ElementScrollX.css('top', 'auto');
                    }
                });
            });

            element.bind('scroll', function (e) {
                changeColumnPosition(e.currentTarget.scrollLeft);
            });
        }
    };
}