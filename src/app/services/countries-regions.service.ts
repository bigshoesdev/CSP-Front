const json = require('full-countries-cities/regions.json');
import {MdSelectType} from '../model/rest/TherapistInfo';

declare var require: any;

export class CountriesRegions {
    /** @ngInject */
    constructor(private _) {
    }

    public getCountries(): Array<string> {
        return json.filter(country => country.region_division === 'country').map(country => country.region_name);
    }

    public getRegions(CountryName: string): Array<any> {

        const startIndex = this._.findIndex(json, obj => obj.region_name === CountryName);
        const regions: Array<any> = [];
        if (startIndex >= 0) {
            for (let i = startIndex + 1; i <= json.length - 1; i++) {
                if (json[i].region_division === 'country') { break; }
                regions.push(json[i]);
            }
        }
        return regions;
    }

    public getCountriesAsObj(): Array<MdSelectType> {
        return this.getCountries().map((item: string, index: number) => ({
            id: index,
            name: item
        }));
    }

    public getRegionsAsObj(country: MdSelectType) {
        return (!this._.isEmpty(country)) ?
            this.getRegions(country.name).map((item: any, index: number) => ({
                name: item.region_name,
                id: index
            })) : [];
    }

    public getRegionObj(regionName: string, regions: Array<MdSelectType>): MdSelectType {
        return regions.filter((region: MdSelectType) => region.name === regionName)[0];
    }


    public getCountryFromList(country: string, countries: Array<MdSelectType>): MdSelectType {
        return countries.filter((item: MdSelectType) => item.name === country)[0];
    }

}
