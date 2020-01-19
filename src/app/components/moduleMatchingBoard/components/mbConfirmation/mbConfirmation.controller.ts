import {Room} from '../../../../model/rest/Room';
import {Client} from '../../../../model/rest/Client';
import {ClientMatchingConfirmation} from '../../../../model/rest/ClientMatchingConfirmation';
import {Therapist} from '../../../../model/rest/Therapist';
import {Service} from '../../../../model/rest/Service';
import {Session} from '../../../../model/rest/Session';
import {PreliminaryEvent} from '../../../../model/rest/PreliminaryEvent';
import {CompositeTime} from '../../../../model/rest/CompositeTime';

declare let angular: any;

interface IViewMatchingDataItem {
    note: string;
    room: string;
    service: string;
    therapist: string;
    date: string;
    duration: number; // duration in minutes
    time: string; // time for event in format 'HH:mm'. if null = not set yet
}

export class MbConfirmationController {

    /** @ngInject */
    constructor(confirmationData: ClientMatchingConfirmation,
                services: Service[],
                sessions: Session[],
                clients: Client[],
                sessionId: number,
                clientId: number,
                $scope, StateStack, _) {

        initForm();

        function initForm() {
            $scope.session = _.find(sessions, (s: Session) => s.id === +sessionId);
            $scope.client = _.find(clients, (c: Client) => c.id === +clientId);

            $scope.confirmationLink = '/#/matchingBoardConfirmation/' + confirmationData.secret;
            $scope.viewMatchingDataItems = confirmationData.items.map((item: PreliminaryEvent): IViewMatchingDataItem => {
                const room: Room = item.room;
                const therapist: Therapist = item.therapist;
                const service: Service = item.service;

                const d: CompositeTime = item.duration;
                const duration: number = d.prep + d.processing + d.clean;
                return {
                    note: item.note,
                    room: room.name,
                    service: service.name,
                    therapist: therapist.name,
                    date: item.date,
                    duration: duration,
                    time: item.time,
                };
            });

        }

        $scope.backOrDone = () => {
            StateStack.goBack();
        };


    }
}

