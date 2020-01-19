import {defaultPageSize} from '../app.constant';
import {Count} from '../../model/rest/Count';

export class ApiBaseService {

    constructor(protected Restangular) {
    }

    public getWholeList<T>(collectionUrl: any): Promise<T> {
        return this.Restangular
            .all(collectionUrl)
            .get('count')
            .then((countObj: Count): Promise<T> => {
                const count: number = countObj.count;
                return this.Restangular
                    .all(collectionUrl)
                    .getList({
                        pageId: 1,
                        pageSize: count || defaultPageSize,
                        sort: '+id'
                    });
            })
            .then(this.getPlain);
    }

    public getList<T>(collectionUrl: any): Promise<T> {
        return this.Restangular
            .all(collectionUrl)
            .getList()
            .then(this.getPlain);

    }

    public getOne<T>(elementUrl: any, elementId: number): Promise<T> {
        return this.Restangular
            .one(elementUrl, elementId)
            .get()
            .then(this.getPlain);

    }

    public removeOne(elementUrl: any, elementId: number): Promise<void> {
        return this.Restangular
            .one(elementUrl, elementId)
            .remove();
    }

    protected getPlain(o) {
        return o && o.plain() || o;
    }
}
