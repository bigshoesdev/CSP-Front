import {LocalStorageService} from '../../../services/storage/local-storage.service';
import {AvailabilityType_Ns} from '../../../model/rest/AvailabilityType';
import AvailabilityType = AvailabilityType_Ns.AvailabilityType;

/** @ngInject */
export function DefaultAvailabilityService(LocalStorageService: LocalStorageService) {
    let defaultAvailability: string = LocalStorageService.getItem('moduleAvailability.defaultAvailability') || AvailabilityType.undefined;

    return {
        set: setDefaultAvailability,
        get: getDefaultAvailability
    };

    function setDefaultAvailability(availability: string) {
        defaultAvailability = availability;
        LocalStorageService.setItem('moduleAvailability.defaultAvailability', defaultAvailability);
    }

    function getDefaultAvailability(): string {
        return defaultAvailability || LocalStorageService.getItem('moduleAvailability.defaultAvailability');
    }

}
