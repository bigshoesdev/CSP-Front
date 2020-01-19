export namespace CalendarMode_Ns {
    export enum CalendarMode {
        dates = 0,
        everyWeek = 1,
        everyDay = 2
    }

    export const $all: CalendarMode[] = [
        CalendarMode.dates,
        CalendarMode.everyWeek,
        CalendarMode.everyDay
    ];

    export const toString = (e: CalendarMode) => {
        switch (e) {
            case CalendarMode.dates:
                return 'All Days';
            case CalendarMode.everyWeek:
                return 'Every Week';
            case CalendarMode.everyDay:
                return 'Every Day';
            // default:
            //     return CalendarModeEnum_Ns[e];
        }
    };
}
