import {Room} from '../../../model/rest/Room';
import {Therapist} from '../../../model/rest/Therapist';

export interface IJbDropDialogInput {
    changeTherapist: boolean;
    therapists: Therapist[];
    therapistNote: string;

    changeRoom: boolean;
    rooms: Room[];
    roomNote: string;
}
export interface IJbDropDialogResult {
    therapist: Therapist;
    room: Room;
}
declare let angular: any;

/** @ngInject */
export function JbDialogService($mdDialog) {

    return {
        changeTherapistAndRoom: changeTherapistAndRoom
    };

    function changeTherapistAndRoom(args: IJbDropDialogInput) {
        return $mdDialog.show({
            controller: ['$mdDialog', '$scope', ($mdDialog, $scope) => {

                $scope.displayItem = o => o && o.name;

                $scope.isApplyDisabled = () => {
                    return !(args.changeTherapist ? $scope.therapist : true) || !(args.changeRoom ? $scope.room : true);
                };

                $scope.onTherapistChange = (t) => {
                    $scope.therapist = t;
                };

                $scope.onRoomChange = (r) => {
                    $scope.room = r;
                };


                $scope.therapist = null;
                $scope.therapists = args.therapists;
                $scope.changeTherapist = args.changeTherapist;
                $scope.therapistNote = args.therapistNote;

                $scope.room = null;
                $scope.rooms = args.rooms;
                $scope.changeRoom = args.changeRoom;
                $scope.roomNote = args.roomNote;

                $scope.cancel = () => {
                    $mdDialog.cancel();
                };

                $scope.hide = () => {
                    const result: IJbDropDialogResult = {
                        therapist: $scope.therapist,
                        room: $scope.room
                    };
                    $mdDialog.hide(result);
                };

            }],
            controllerAs: 'ctrl',
            templateUrl: 'app/components/moduleSuggestedServices/services/changeTherapistAndRoom.html',
            clickOutsideToClose: true
        });
    }

}
