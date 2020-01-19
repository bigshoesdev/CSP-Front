import {ApiBaseService} from "./api-base.service";
import {Room} from "../../model/rest/Room";
import {Therapist} from "../../model/rest/Therapist";
import {Client} from "../../model/rest/Client";

export class ApiReportsService extends ApiBaseService {
    /** @ngInject */
    constructor(Restangular) {
        super(Restangular);
    }

    //TODO: Set valid request when it will be possible
    getRoomsBySessionId = (sessionId: number): Promise<Room[]> => {
        return this.Restangular
            .all('rooms')
            .getList()
            .then(this.getPlain);
    };

    getTherapistsBySessionId = (sessionId: number): Promise<Therapist[]> => {
        return this.Restangular
            .all('therapists')
            .getList()
            .then(this.getPlain);
    };

    getClientsBySessionId = (sessionId: number): Promise<Client[]> => {
        return this.Restangular
            .all('clients')
            .getList()
            .then(this.getPlain);
    }
}