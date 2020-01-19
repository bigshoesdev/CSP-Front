import {dateFormat, defaultPageSize, timeFormat} from '../services/app.constant';
import {Moment} from '../../../bower_components/moment/moment.d';
import {Room} from '../model/rest/Room';
import {Therapist} from '../model/rest/Therapist';
import {Collection} from '../model/Collection';
import {CrossingData} from '../model/rest/CrossingData';
import {CrossingDataItem} from '../model/rest/CrossingDataItem';

declare let angular: any;


export class Utils {

    /** @ngInject */
    constructor(private _, private moment, private Restangular) {

    }

    equals(o1, o2) {
        if (o1 === o2) { return true; }
        if (o1 === null || o2 === null) { return false; }
        // eslint-disable-next-line no-self-compare
        if (o1 !== o1 && o2 !== o2) { return true; } // NaN === NaN
        let t1 = typeof o1, t2 = typeof o2, length, key, keySet;
        if (t1 === t2 && t1 === 'object') {
            if (this.isArray(o1)) {
                if (!this.isArray(o2)) { return false; }
                if (this.equalsArrays(o1, o2)) { return true; }
            } else if (this.isDate(o1)) {
                if (!this.isDate(o2)) { return false; }
                return this.simpleCompare(o1.getTime(), o2.getTime());
            } else if (this.isRegExp(o1)) {
                if (!this.isRegExp(o2)) { return false; }
                return o1.toString() === o2.toString();
            } else {
                if (this.isScope(o1) || this.isScope(o2) || this.isWindow(o1) || this.isWindow(o2) ||
                    this.isArray(o2) || this.isDate(o2) || this.isRegExp(o2)) { return false; }
                keySet = this.createMap();
                for (key in o1) {
                    if (key.charAt(0) === '$' || angular.isFunction(o1[key])) { continue; }
                    if (!this.equals(o1[key], o2[key])) { return false; }
                    keySet[key] = true;
                }
                for (key in o2) {
                    if (!(key in keySet) &&
                        key.charAt(0) !== '$' &&
                        angular.isDefined(o2[key]) &&
                        !angular.isFunction(o2[key])) { return false; }
                }
                return true;
            }
        }
        return false;
    }

    equalsArrays(arr1: any[], arr2: any[]) {
        return (arr1.length === arr2.length)
            && arr1.every((e1: any) => arr2.some((e2: any) => this.equals(e1, e2)));
    }

    simpleCompare(a, b) {
        return a === b || (a !== a && b !== b);
    }// NaN === NaN
    createMap() {
        return Object.create(null);
    }

    isRegExp(value) {
        return toString.call(value) === '[object RegExp]';
    }

    isScope(obj) {
        return obj && obj.$evalAsync && obj.$watch;
    }

    isWindow(obj) {
        return obj && obj.window === obj;
    }

    isArray(obj) {
        return Array.isArray(obj);
    }

    isDate(value) {
        return toString.call(value) === '[object Date]';
    }

    clone(o) {
        return angular.copy(o);
    }

    getAllCollection(collectionUrl: string) {
        return this.Restangular
            .all(collectionUrl)
            .get('count')
            .then((countObj) => countObj.count)
            .then((count) => this.Restangular
                .all(collectionUrl)
                .getList({
                    pageId: 1,
                    pageSize: count || defaultPageSize,
                    sort: '+id',
                }),
            )
            .then((o) => o.plain());
    }

    /**
     * REturn number
     * @param {string} date_from
     * @param {string} date_to
     * @returns {number}
     */
    dateUnixDiff(date_from: string, date_to: string): number {
        return this.moment(this.initDateFromStr(date_to)).unix() - this.moment(this.initDateFromStr(date_from)).unix();
    }

    formatDate(date: string): string {
        return date ? this.dateToFormat(this.initDateFromStr(date)) : '';
    }

    dateToFormat(date: Date, format: string = dateFormat): string {
        const m: Moment = this.moment(date);
        return m.isValid() ? m.format(format) : null;
    }

    momentToFormat(m: Moment, format: string = dateFormat): string {
        return m.isValid() ? m.format(format) : null;
    }



    initDateFromStr(dateOrTime: string, format = dateFormat): Date {
        const m: Moment = this.moment(dateOrTime, format);
        return m.isValid() ? m.toDate() : null;
    }

    strTimeToMinutes(time: string): number {
        const m: Moment = this.moment(time, timeFormat);
        return m.hours() * 60 + m.minutes();
    }

    minutesToStrTime(minutes: number): string {
        const hh = Math.floor(minutes / 60);
        const mm = minutes % 60;
        return `${hh}:${mm}`;
    }

    sortRoomsForTherapist(rooms: Room[], therapist: Therapist): Room[] {
        if (therapist && therapist.preferredRooms && therapist.preferredRooms.length > 0) {
            const prefRoomId2Room: Collection<Room> = this._.keyBy(therapist.preferredRooms, 'id');
            rooms.sort((a: Room, b: Room) => {
                const isAPreffered = !!prefRoomId2Room[a.id];
                const isBPreffered = !!prefRoomId2Room[b.id];
                if (isAPreffered && !isBPreffered) {
                    return -1;
                } else if (!isAPreffered && isBPreffered) {
                    return 1;
                } else {
                    return 0;
                }
            });
        }
        return rooms;
    }

    calculateCrossingHistogram(crossingDataArr: CrossingData[]): Collection<number> {
        const allItems: CrossingDataItem[] = this._.flatMap(crossingDataArr, (crossingData: CrossingData) => crossingData.items);
        return allItems.reduce((res: Collection<number>, item: CrossingDataItem) => {
            if (!res[item.type]) {
                res[item.type] = 1;
            } else {
                res[item.type] += 1;
            }
            return res;
        }, {});
    }

    mergeArrays<T>(arr1: T[], arr2: T[], getId: (item: T) => number | string): T[] {
        const map1: Collection<T> = this._.keyBy(arr1, getId);
        const map2: Collection<T> = this._.keyBy(arr2, getId);
        const mapResilt: Collection<T> = this._.assign(map1, map2);
        return this._.map(mapResilt, (value: T, key: number | string) => value);
    }

}
