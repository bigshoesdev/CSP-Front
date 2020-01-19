/**
 *
 * Generators
 *
 */

import {Profile} from '../model/rest/Profile';
import {ApiInjectableBaseService} from './api/api-injectable-base.service';

// generate functions to get collection's item
export const getCalendarEvent = getOneFromCollectionGenerator('calendarEvents', 'calendarEventId');
export const getUser = getOneFromCollectionGenerator('user', 'userId');
export const getCategory = getOneFromCollectionGenerator('serviceCategory', 'categoryId');
export const getTherapist = getOneFromCollectionGenerator('therapist', 'therapistId');
export const getService = getOneFromCollectionGenerator('services', 'serviceId');
export const getTax = getOneFromCollectionGenerator('taxes', 'taxId');
export const getClient = getOneFromCollectionGenerator('client', 'clientId');
export const getReport = getOneFromCollectionGenerator('reports', 'reportId');
export const getReportTable = getOneFromCollectionGenerator('reports/table', 'reportKey');
export const getReportByKey = getOneFromCollectionGenerator('reports/byKey', 'reportKey');
export const getRoom = getOneFromCollectionGenerator('room', 'roomId');
export const getWeek = getOneFromCollectionGenerator('week', 'weekId');
export const getEvent = getOneFromCollectionGenerator('events', 'eventId');
export const getEventTypes = getOneFromCollectionGenerator('eventTypes', 'eventTypeId');
export const getEquipment = getOneFromCollectionGenerator('equipment', 'equipmentId');
export const getRestriction = getOneFromCollectionGenerator('restriction', 'restrictionId');
export const getSession = getOneFromCollectionGenerator('session', 'sessionId');
export const getRequest = getOneFromCollectionGenerator('availability/request', 'requestId');
export const getMails = getOneFromCollectionGenerator('mails', 'mailId');

export function checkModuleAccess(moduleKey) {

    /** @ngInject */
    function _checkModuleAccess($rootScope, $q: any, AuthService) {

        return AuthService.getCurrentUserProfilePromise().then((profile: Profile) => {
            const exist = profile.currentUser.modules.some((userModule) => moduleKey == userModule);
            if (exist) {
                $rootScope.modulesSelectorConf.selectedKey = moduleKey;
                return moduleKey;
            } else {
                return $q.reject('Access to the module "' + moduleKey + '" is denied');
            }
        }, (err) => {
            console.log('AuthService.getCurrentUserProfilePromise() Error:', err);
        });
    }

    return _checkModuleAccess;

}

export function isModuleAccess(moduleKey) {
    /** @ngInject */
    function _getModuleAccess(AuthService) {
        return AuthService.getCurrentUserProfilePromise().then((profile: Profile) => {
            return profile.currentUser.modules.some((userModule) => moduleKey == userModule);
        });
    }

    return _getModuleAccess;
}


export function getOneFromCollectionGenerator(elementUrl, elementIdName) {
    /** @ngInject */
    function _getOne(ApiInjectableBaseService: ApiInjectableBaseService, $stateParams) {
        const elementId = $stateParams[elementIdName];
        return ApiInjectableBaseService.getOne(elementUrl, elementId);
    }

    return _getOne;
}


/** Get plain object for Restangular response */
export function getPlain(o) {
    return o.plain();
}
