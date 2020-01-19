import {IAngularStatic, IDocumentService, IParseService} from 'angular';
import {Rectangle} from '../../model/Rectangle';

export interface IRenderRectScope extends ng.IScope {
    renderRect: Rectangle;
}

/** @ngInject */
export function renderRect($document: IDocumentService,
                           ang: IAngularStatic,
                           $parse: IParseService,
                           $timeout: ng.ITimeoutService) {
    const setRectStyle = (elem: JQuery, rect: any) => {
        if (rect) {
            $timeout(() => {
                elem.css(rect);
            });
        }
    };

    return {
        restrict: 'AE',
        scope: {
            renderRect: '='
        },
        link: function (scope: IRenderRectScope, elem: JQuery, attrs: any) {

            const rect: Rectangle = scope.renderRect;

            scope.$watch('renderRect', (newRect: Rectangle) => {
                // setRectStyle(elem, newRect);
            });

            setRectStyle(elem, rect);
        }
    };
}
