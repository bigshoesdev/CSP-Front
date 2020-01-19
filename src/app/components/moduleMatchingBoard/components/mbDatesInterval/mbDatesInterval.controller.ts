import {Moment} from '../../../../../../bower_components/moment/moment';
import {MbDatesController} from '../mbDates.controller';
import {IMbRow, MbTable} from '../mbTable/mbTable.directive';
import {dateFormat} from '../../../../services/app.constant';
import {IRowCalColumn} from '../../../../directives/calendarRow/calendarRow.controller';
import {MbBgLayoutData} from '../mbBase.controller';
import {LocalStorageService} from '../../../../services/storage/local-storage.service';
import {Session} from '../../../../model/rest/Session';
import {ApiBookingService} from '../../../../services/api/api-booking.service';
import {Utils} from '../../../../services/utils.service';
import {ApiAvailabilityTherapistService} from '../../../../services/api/api-availability-therapist.service';
import {ApiCalendarEventsService} from '../../../../services/api/api-calendar-events.service';
import {MatchingBoardService} from '../../services/matchingBoard.service';
import {CalendarService} from '../../../../services/calendar.service';
import {PreliminaryEvent} from '../../../../model/rest/PreliminaryEvent';
import {MatchingBoardController} from '../matchingBoard/matchingBoard.controller';

export class MbDatesIntervalController extends MbDatesController {
    /** @ngInject */
    constructor(public $scope,
                public LocalStorageService: LocalStorageService,
                public Utils: Utils,
                public moment,
                public $timeout: ng.ITimeoutService,
                public _,
                public ApiAvailabilityTherapistService: ApiAvailabilityTherapistService,
                public ApiBookingService: ApiBookingService,
                public ApiCalendarEventsService: ApiCalendarEventsService,
                public $q: any,
                public $mdDialog,
                public JbDialogService,
                public CalendarService: CalendarService,
                public MatchingBoardService: MatchingBoardService) {
        super(
            $scope,
            LocalStorageService,
            Utils,
            moment,
            $timeout,
            _,
            ApiAvailabilityTherapistService,
            ApiBookingService,
            ApiCalendarEventsService,
            $q,
            $mdDialog,
            JbDialogService,
            MatchingBoardService);

        $scope.getMaxDate = () => $scope.toDate || $scope.maxDate;
        $scope.getMinDate = () => $scope.fromDate || $scope.minDate;

        $scope.onFromDateChange = (fromDate) => {
            LocalStorageService.setItem('moduleMatchingBoard.fromDate', Utils.dateToFormat(fromDate));

            const MatchingBoardController: MatchingBoardController = this.$scope.MatchingBoardController;
            this.generateMbTable(MatchingBoardController.matchingEvents, MatchingBoardController.confirmationEvents, this._rowType);
        };

        $scope.onToDateChange = (toDate) => {
            LocalStorageService.setItem('moduleMatchingBoard.toDate', Utils.dateToFormat(toDate));

            const MatchingBoardController: MatchingBoardController = this.$scope.MatchingBoardController;
            this.generateMbTable(MatchingBoardController.matchingEvents, MatchingBoardController.confirmationEvents, this._rowType);
        };


    }

    public initForm() {
    }

    private initDates(session: Session) {
        if (!session) {
            return;
        }
        const $scope = this.$scope;
        const Utils: Utils = this.Utils;
        const LocalStorageService: LocalStorageService = this.LocalStorageService;

        const startDate: string = session.startDate;

        if (!$scope.fromDate) {
            const fromDateStr: string = LocalStorageService.getItem('moduleMatchingBoard.fromDate') || startDate;
            $scope.fromDate = fromDateStr ? Utils.initDateFromStr(fromDateStr) : new Date();
        }

        if (!$scope.toDate) {
            const toDateStr: string = LocalStorageService.getItem('moduleMatchingBoard.toDate') || startDate;
            $scope.toDate = toDateStr ? Utils.initDateFromStr(toDateStr) : new Date();
        }
    }

    public applySession(session: Session) {
        if (!session) {
            return;
        }
        const $scope = this.$scope;
        const Utils: Utils = this.Utils;

        $scope.minDate = Utils.initDateFromStr(session.startDate);
        $scope.maxDate = Utils.initDateFromStr(session.endDate);

        this.initDates(session);
    }

    public generateMbTable(matchingEvents: PreliminaryEvent[],
                           confirmationEvents: PreliminaryEvent[],
                           rowType): void {

        const $scope = this.$scope;
        const moment = this.moment;

        const start: Moment = moment($scope.fromDate);
        const end: Moment = moment($scope.toDate);

        const dateFrom: string = this.Utils.momentToFormat(start);
        const dateTo: string = this.Utils.momentToFormat(end);

        if (!(dateFrom && dateTo)) {
            return;
        }

        this.loadBgLayoutData(dateFrom, dateTo).then((res: MbBgLayoutData) => {
            this.$scope.mbTableConf = this._generateMbTable(matchingEvents, confirmationEvents, rowType, res, start, end);
        });
    }

    private _generateMbTable(matchingEvents: PreliminaryEvent[],
                             confirmationEvents: PreliminaryEvent[],
                             rowType,
                             res: MbBgLayoutData,
                             start: Moment,
                             end: Moment): MbTable {

        const tableDates: Moment[] = [];
        this.CalendarService.iterateMomentRange(start, end, (date: Moment): boolean => {
            tableDates.push(date);
            return true; // continue
        });

        const columns: IRowCalColumn[] = tableDates.map((d: Moment): IRowCalColumn => {
            return {
                columnKey: d.format(dateFormat),
                columnTitle: d.format('MMM D'),
                columnMeta: d
            };
        });
        const rows: IMbRow[] = this.generateMbTableRows(matchingEvents, confirmationEvents, rowType, columns, res);

        return {
            columns: columns,
            rows: rows
        };
    }

}
