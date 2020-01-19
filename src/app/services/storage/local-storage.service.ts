declare const localStorage: any;

export class LocalStorageService {

    /** @ngInject */
    constructor(private _) {
        if (!this.isStorageAvailable('localStorage')) {
            throw new Error('localStorage isn\'t supported');
        }
    }

    setItem(key: string, val: any) {
        this._.set(localStorage, key, JSON.stringify(val));
    }

    getItem(key: string, defaultVal: string = null) {
        const storageValue = localStorage.getItem(key);

        return this._.isEmpty(storageValue)
            ? defaultVal
            : JSON.parse(storageValue);
    }

    removeItem(key: string) {
        localStorage.removeItem(key);
    }

    clear() {
        localStorage.clear();
    }

    length() {
        return localStorage.length;
    }

    key(idx: number) {
        return localStorage.key(idx);
    }

    isStorageAvailable(type) {
        const storage = window[type];
        const x = '__storage_test__';
        try {
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        } catch (e) {
            return e instanceof DOMException && (
                    // everything except Firefox
                e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                e.name === 'QuotaExceededError' ||
                // Firefox
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
                // acknowledge QuotaExceededError only if there's something already stored
                storage.length !== 0;
        }
    }
}
