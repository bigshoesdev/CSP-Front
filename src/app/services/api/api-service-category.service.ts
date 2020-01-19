import {ApiBaseService} from './api-base.service';
import {Id} from '../../model/rest/Id';

export class ApiServiceCategoryService extends ApiBaseService {
    /** @ngInject */
    constructor(Restangular) {
        super(Restangular);
    }

    postServiceCategory(name: string): Promise<Id> {
        return this.Restangular
            .all('serviceCategory')
            .post({
                name: name
            });
    }

    putServiceCategory(categoryId: number, name: string): Promise<Id> {
        return this.Restangular
            .one('serviceCategory', categoryId)
            .customPUT({
                name: name
            });
    }

    postService(categoryId: number, servicesIds: number[]) {
        return this.Restangular
            .one('serviceCategory', categoryId)
            .post('services', servicesIds);
    }

    deleteServiceCategory(categoryId: number) {
        return this.Restangular
            .one('serviceCategory', categoryId)
            .remove();
    }

}
