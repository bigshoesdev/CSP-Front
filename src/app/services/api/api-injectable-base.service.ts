import {ApiBaseService} from './api-base.service';

export class ApiInjectableBaseService extends ApiBaseService {
    /** @ngInject */
    constructor(protected Restangular) {
        super(Restangular);
    }
}
