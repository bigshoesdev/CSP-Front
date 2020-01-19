import {dateFormat} from '../../../services/app.constant';
import {ClientSimpleMatchingInfo} from '../../../model/rest/ClientSimpleMatchingInfo';
export class MatchingBoardViewConfirmationController {
    /** @ngInject */
    constructor(clientSimpleMatchingInfo: ClientSimpleMatchingInfo[],
                secret: string,
                $scope, moment, Restangular) {

        $scope.matchingInfoArr = clientSimpleMatchingInfo;

        $scope.confirm = () => {
            Restangular
                .one('matchingBoard/confirmation', secret)
                .one('confirm')
                .customPOST();
        };

        $scope.decline = () => {
            Restangular
                .one('matchingBoard/confirmation', secret)
                .one('decline')
                .customPOST();
        };

        $scope.showDate = (date: string) => moment(date, dateFormat).format('MMM D YYYY');
    }
}

