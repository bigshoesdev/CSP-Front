import {CalendarMode_Ns} from './CalendarMode';
import {Moment} from '../../../bower_components/moment/moment';
import CalendarModeEnum = CalendarMode_Ns.CalendarMode;

export interface CalendarConf {
    model: any[];
    startDate?: string;
    endDate?: string;
    defaultGridMode?: CalendarModeEnum;
    disableGridMode?: boolean;
    isReadOnly?: boolean;
    /**
     * return model for the date range
     * @param start - included (for example: start the week)
     * @param end - excluded (for example: start next week)
     */
    loadModel?: (start: Moment, end: Moment) => Promise<any[]>;
}
