import {Collection} from '../../model/Collection';
import {StorageService} from './storage.service';

export class BaseCacheService {

    private expirationMinutesMap: Collection<number> = {};
    private memMap: Collection<Object> = {}; // used if cache expired (in memory)

    constructor(protected StorageService: StorageService,
                private $q: any,
                private _,
                private env) {
        this.expirationMinutesMap = env.cacheExpirationMinutesMap || {};
    }

    protected getFast<T>(key: string, load: () => Promise<T>): Promise<T> {
        const cachedValue: T = <T>this.StorageService.get(key);
        if (cachedValue) {
            // Already cached
            this.memMap[key] = cachedValue; // Update if app just started
            return this.$q.resolve(this._.cloneDeep(cachedValue)); // return immediately
        } else {
            // If doesn't exist or expired
            const promise: Promise<T> = this.getFresh(key, load);

            const memoryValue: T = <T>this.memMap[key];
            if (memoryValue) {
                // Return immediately
                return this.$q.resolve(this._.cloneDeep(memoryValue));
            } else {
                // Will have to wait
                return promise;
            }
        }
    }

    protected getFresh<T>(key: string, load: () => Promise<T>): Promise<T> {
        return load().then((loadedValue: T): T => {
            if (loadedValue) {
                this.memMap[key] = loadedValue;
                this.StorageService.set(key, loadedValue, this.expirationMinutesMap[key]);
            }
            return this._.cloneDeep(loadedValue);
        }, (err) => {
            // Need this to propagate the error to the calling function if the error happens immediately (as in the browser is offline)
            console.error('Error fetching data', err);
        });
    }

}
