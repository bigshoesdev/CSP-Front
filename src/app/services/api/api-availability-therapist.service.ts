import {ApiBaseService} from './api-base.service';
import {AvailabilityTherapistDayRecord} from '../../model/rest/AvailabilityTherapistDayRecord';
import {getPlain} from '../route.generators';

export class ApiAvailabilityTherapistService extends ApiBaseService {
    /** @ngInject */
    constructor(Restangular) {
        super(Restangular);
    }

    getAvailabilityTherapist(therapistId: number, dateFrom: string, dateTo: string): Promise<AvailabilityTherapistDayRecord[]> {
        return this.Restangular
            .one('availability/therapist', therapistId)
            .get({
                dateFrom: dateFrom,
                dateTo: dateTo,
            })
            .then(this.getPlain);
    }

    getAvailabilityMine(dateFrom: string, dateTo: string): Promise<AvailabilityTherapistDayRecord[]> {
        return this.Restangular
            .one('availability/therapist/mine')
            .get({
                dateFrom: dateFrom,
                dateTo: dateTo,
            })
            .then(getPlain);
    }

    putAvailabilityTherapist(therapistId: number, dayRecords: AvailabilityTherapistDayRecord[]): Promise<void> {
        return this.Restangular
            .one('availability/therapist', therapistId)
            .customPUT(dayRecords);
    }

}

