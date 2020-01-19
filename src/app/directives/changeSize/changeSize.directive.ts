import {IAngularStatic, IDocumentService, IParseService} from 'angular';

export interface IChangeSizeHoverAttr extends Attr {
    changesize: string;
}

/** @ngInject */
export function changeSizeHover($document: IDocumentService, ang: IAngularStatic, $parse: IParseService, $timeout: ng.ITimeoutService) {

    const paddingWidth = 10; // px

    const getTextWidth = (font: string, text: string): number => {
        const document = ang.element($document)[0] as any;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        context.font = font;
        const metrics = context.measureText(text);
        return metrics.width;
    };

    const getRectWidth = (textWidth: number, buttonEditWidth: number) => textWidth + paddingWidth * 2 + buttonEditWidth;

    return {
        restrict: 'AE',
        link: function (scope: ng.IScope, elem: JQuery, attrs: IChangeSizeHoverAttr) {
            let rect;
            let calendarWidth;
            let heightFromTime;
            let boolWidth;
            let show = true;
            let diffWidth;
            const scopeKey = 'item';
            const scopeParentKey = 'slotSize';

            function updateStyles(show: boolean) {
                if (show) {
                    if (!rect) rect = scope['item']['rect'];
                    elem.removeClass('hide-booking-event');
                    elem.addClass('show-booking-event');

                    const elemDiv = elem.find('div');

                    const innerText = maxLengthInnerText([elemDiv[0].innerText, elemDiv[1].innerText, elemDiv[2].innerText, elemDiv[3].innerText]); // elem.find('div')[3].innerText;
                    const font_size = window.getComputedStyle(elem[0], null).getPropertyValue('font-size');
                    const font_family = window.getComputedStyle(elem[0], null).getPropertyValue('font-family');
                    const buttonEditWidth = elem.find('button').outerWidth();
                    const updatedWidth = getRectWidth(getTextWidth(font_size + ' ' + font_family, innerText), buttonEditWidth);

                    heightFromTime = getHeightFromTime();
                    if (heightFromTime < 25 * 4) {
                        elem.css('height', 25 * 4);
                    }

                    if (typeof rect.left === 'string') {
                        rect.left = parseFloat(rect.left, 10);
                        rect.top = parseFloat(rect.top, 10);
                        rect.width = parseFloat(rect.width, 10);
                        rect.height = parseFloat(rect.height, 10);
                    }
                    diffWidth = parseInt(rect.width, 10) - updatedWidth;
                    boolWidth = true; // calendarWidth - rect.left - updatedWidth < 0;
                    if (rect.width < updatedWidth) {
                        // if (boolWidth) elem.css('left', rect.left + diffWidth);
                        elem.width(updatedWidth);
                    }
                } else {
                    elem.removeClass('show-booking-event');
                    elem.addClass('hide-booking-event');
                    heightFromTime = getHeightFromTime() + 1;
                    elem.outerHeight(heightFromTime);
                    elem.outerWidth(rect.width + 1);

                    // if (boolWidth) elem.css('left', rect.left);
                }
            }

            function getHeightFromTime() {
                const slotSize = scope.$parent.$parent[scopeParentKey];
                let eventSize = (scope[scopeKey].timeEnd - scope[scopeKey].timeStart) / slotSize;
                eventSize = Math.ceil(eventSize);
                console.log('get Height', eventSize * 25);
                return eventSize * 25;
            }

            function maxLengthInnerText(arr: string[]) {
                let maxLength = Math.max.apply(Math, arr.map((text) => {
                    return text.length;
                }));
                let result;
                arr.forEach((text) => {
                    if (text.length === maxLength) {
                        result = text;
                    }
                });
                return result;
            }

            scope.$parent.$watch('freshRectSize', (item, item2) => {
                rect = item2 ? item2 : item;
            });

            elem.bind('drag', () => {
                console.log('drag');
                updateStyles(false);
            });

            scope.$parent.$watch('ctrl.$calendarWidth', (item, item2) => {
                calendarWidth = item2;
            });

            let countClick = true;
            const showAction = elem.find('.showAction');
            const editAction = elem.find('.editAction');
            const heightRect = getHeightFromTime();

            showAction.css('top', heightRect / 2 - 20);

            elem.hover(() => {
                if (countClick) {
                    showAction.css('display', 'block');
                }
            }, () => {
                updateStyles(false);
                editAction.css('display', 'none');
                showAction.css('display', 'none');
                countClick = true;
            });

            showAction.on('click', () => {

                updateStyles(true);
                showAction.css('display', 'none');
                editAction.css('display', 'block');
                countClick = false;
            });
        }
    };
}



