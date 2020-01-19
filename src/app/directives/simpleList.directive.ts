
/** @ngInject */
export function simpleList() {
    return {
        restrict: 'A',
        templateUrl: 'app/directives/simpleList.html',
        scope: {
            /**
             * simpleList: [{ id:number, name:string }],
             */
            list: '=simpleList',
        }
    };
}

