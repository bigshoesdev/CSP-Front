
/** @ngInject */
export function repeatPassword() {
    return {
        require: 'ngModel',
        restrict: 'A',
        scope: {
            password: '=repeatPassword'
        },
        link: postLink
    };

    function postLink(scope, iElement, iAttrs, ngModelCtrl) {
        ngModelCtrl.$validators.repeatPassword = function (modelValue, viewValue) {
            return scope.password == viewValue;
        };
        scope.$watch('password', (password) => {
            ngModelCtrl.$setValidity('repeatPassword', password === ngModelCtrl.$viewValue);
        });
    }
}
