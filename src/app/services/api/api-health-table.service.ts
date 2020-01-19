import {ApiBaseService} from './api-base.service';
import {HtCustomColumn} from '../../model/rest/HtCustomColumn';
import {HtColumn} from '../../model/rest/HtColumn';
import {HealthSection} from '../../model/rest/HealthSection';
import {HsFlagColumn} from '../../model/rest/HsFlagColumn';
import {HsConditionColumn} from '../../model/rest/HsConditionColumn';

export class ApiHealthTableService extends ApiBaseService {
    /** @ngInject */
    constructor(Restangular) {
        super(Restangular);
    }

    getColumns(): Promise<HtColumn[]> {
        return this.getList(ApiHealthTableService.HealthTableApiEndpoints.healthTableColumns);
    }

    getCustomColumns(): Promise<HtCustomColumn[]> {
        return this.getList(ApiHealthTableService.HealthTableApiEndpoints.healthTableCustomColumns);
    }

    getHealthSections(): Promise<HealthSection[]> {
        return this.getList(ApiHealthTableService.HealthTableApiEndpoints.healthSections);
    }

    getHealthConditions(): Promise<HsConditionColumn[]> {
        return this.getList(ApiHealthTableService.HealthTableApiEndpoints.healthConditions);
    }

    getHealthFlags(): Promise<HsFlagColumn[]> {
        return this.getList(ApiHealthTableService.HealthTableApiEndpoints.healthFlags);
    }

}

export namespace ApiHealthTableService {
    export enum HealthTableApiEndpoints {
        healthTableColumns = <any>'healthTable/columns',
        healthTableCustomColumns = <any>'healthTable/customColumns',
        healthSections = <any>'healthSections',
        healthConditions = <any>'healthConditions',
        healthFlags = <any>'healthFlags',
    }
}
