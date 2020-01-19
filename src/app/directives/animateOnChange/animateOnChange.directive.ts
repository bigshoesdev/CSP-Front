/** @ngInject */
export function animateOnChange($animate, $timeout) {
    return {
        restrict: 'AE',
        link: postLink
    };

    function postLink(scope, elem, attr) {
        scope.$watch(attr.animateOnChange, function (nv, ov) {
            if (nv != ov) {
                const c = nv > ov ? 'change-up' : 'change';
                $animate.addClass(elem, c).then(function () {
                    $timeout(function () {
                        $animate.removeClass(elem, c)
                    });
                });
            }
        })
    }
}
