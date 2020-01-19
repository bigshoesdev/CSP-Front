import {Collection} from '../../model/Collection';

declare const localStorage: any;

/**
 * Expiring localStorage based or in-memory based service
 */
export class StorageService {

    private isLocalStorageProvided: boolean;
    private storage: Collection<Object> = {};


    /** @ngInject */
    constructor(private _,
                private lscache) {
        this.isLocalStorageProvided = this.ifLocalStorageProvided();
        if (!this.isLocalStorageProvided) {
            console.warn('LocalStorage is not available. In-memory storage will be used.');
        }
    }

    set(key: string, value: Object | string, time?: number): void {
        if (this.isLocalStorageProvided) {
            this.lscache.set(key, value, time);
        } else {
            this.storage[key] = value;
        }
    }

    get(key: string): string | Object {
        if (this.isLocalStorageProvided) {
            return this.lscache.get(key);
        } else {
            return this.storage[key];
        }
    }

    remove(key: string): void {
        if (this.isLocalStorageProvided) {
            this.lscache.remove(key);
        } else {
            delete this.storage[key];
        }
    }

    supported(): boolean {
        return this.lscache.supported();
    }

    flush(): void {
        if (this.isLocalStorageProvided) {
            return this.lscache.flush();
        } else {
            this.storage = {};
        }
    }

    flushExpired(): void {
        return this.lscache.flushExpired();
    }

    setBucket(bucket: string): void {
        return this.lscache.setBucket(bucket);
    }

    resetBucket(): void {
        return this.lscache.resetBucket();
    }

    enableWarnings(enabled: boolean) {
        return this.lscache.enableWarnings(enabled);
    }


    /**
     * Safari doesn't provide localStorage in private mode
     * @returns {boolean}
     */
    ifLocalStorageProvided(): boolean {
        if (window.localStorage) {
            const test = '__localstoragetest__';

            try {
                window.localStorage.setItem(test, test);
                window.localStorage.removeItem(test);
            } catch (ex) {
                console.log('No storage for you!');
                return false;
            }

            return true;
        }

        return false;
    }

}
