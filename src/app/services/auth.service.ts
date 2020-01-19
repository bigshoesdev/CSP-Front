import {LocalStorageService} from './storage/local-storage.service';
import {Profile} from '../model/rest/Profile';

/** @ngInject */
export function AuthService(Restangular,
                     LocalStorageService: LocalStorageService,
                     $q) {

    return {
        isLoggedIn: isLoggedIn,
        logout: logout,
        eraseCredentials: eraseCredentials,
        getCurrentUserProfilePromise: getCurrentUserProfilePromise
    };

    function isLoggedIn() {
        return !!LocalStorageService.getItem('AuthKey');
    }

    function logout() {
        return Restangular
            .all('logout')
            .post()
            .then(eraseCredentials, eraseCredentials);
    }

    function eraseCredentials() {
        LocalStorageService.removeItem('AuthKey');
        LocalStorageService.removeItem('currentUserProfile');
        LocalStorageService.removeItem('rememberMe');
    }

    function getCurrentUserProfilePromise() {
        const currentUserProfile: Profile = LocalStorageService.getItem('currentUserProfile');
        if (!currentUserProfile) {
            return Restangular
                .one('profile')
                .get()
                .then(o => o.plain())
                .then((profile) => {
                    LocalStorageService.setItem('currentUserProfile', profile);
                    return profile;
                });
        } else {
            return $q((resolve, reject) => resolve(currentUserProfile));
        }
    }

}
