import {Moment} from '../../../../../../../../bower_components/moment/moment';
import {dateFormat} from '../../../../../../services/app.constant';
import {JbDatesController} from './jbDates.controller';
import {LocalStorageService} from '../../../../../../services/storage/local-storage.service';
import {Session} from '../../../../../../model/rest/Session';
import {ApiSuggestedServicesService} from '../../../../../../services/api/api-suggested-services.service';
import {EntityDependencyService} from '../../../../../../services/entity-dependency.service';
import {JuggleBoardService} from '../../../../services/juggleBoard.service';
import {ApiCalendarEventsService} from '../../../../../../services/api/api-calendar-events.service';
import {Utils} from '../../../../../../services/utils.service';
import {ApiAvailabilityTherapistService} from '../../../../../../services/api/api-availability-therapist.service';
import {CalendarService} from '../../../../../../services/calendar.service';

export class JbDatesWeekController extends JbDatesController {
    /** @ngInject */
    constructor(public $scope,
                public LocalStorageService: LocalStorageService,
                public Utils: Utils,
                public moment,
                public $timeout: ng.ITimeoutService,
                public _,
                public JuggleBoardService: JuggleBoardService,
                public ApiSuggestedServicesService: ApiSuggestedServicesService,
                public ApiCalendarEventsService: ApiCalendarEventsService,
                public ApiAvailabilityTherapistService: ApiAvailabilityTherapistService,
                public $q: any,
                public $mdDialog,
                public JbDialogService,
                public CalendarService: CalendarService,
                public EntityDependencyService: EntityDependencyService) {
        super($scope, LocalStorageService, Utils, moment, $timeout, _, JuggleBoardService, ApiSuggestedServicesService,
            ApiCalendarEventsService, ApiAvailabilityTherapistService, $q, $mdDialog, JbDialogService, CalendarService, EntityDependencyService);

        $scope.getMaxDate = () => $scope.maxDate;
        $scope.getMinDate = () => $scope.minDate;
    }


    public initForm() {
        const session: Session = this.$scope.JuggleBoardController.session;

        const fromDate: string = this.LocalStorageService.getItem('moduleSuggestedServices.fromDate') || (session && session.startDate);
        const m = fromDate
            ? this.moment(fromDate, dateFormat)
            : this.moment();
        this._onMomentChange(m);
    }


    public applySession() {
        const $scope = this.$scope;
        const session: Session = $scope.JuggleBoardController.session;
        const moment = this.moment;

        if (session) {
            const startMoment: Moment = moment(session.startDate, dateFormat);
            $scope.minDate = startMoment.isValid() ? startMoment.day(0).toDate() : null;

            const endMoment: Moment = moment(session.endDate, dateFormat);
            $scope.maxDate = endMoment.isValid() ? endMoment.day(6).toDate() : null;
        } else {
            $scope.minDate = null;
            $scope.maxDate = null;
        }
    }

    public onFromDateChange(date) {
        this._onDateChange(date);
    }

    public onToDateChange(date) {
        this._onDateChange(date);
    }


    private _onDateChange(someWeekDate) {
        const $scope = this.$scope;

        const m: Moment = this.moment(someWeekDate);
        this._onMomentChange(m);

        this.LocalStorageService.setItem('moduleSuggestedServices.fromDate', this.Utils.dateToFormat($scope.fromDate));
        this.LocalStorageService.setItem('moduleSuggestedServices.toDate', this.Utils.dateToFormat($scope.toDate));
    }

    private _onMomentChange(m: Moment) {
        const $scope = this.$scope;
        const moment = this.moment;

        if (!m.isValid()) {
            m = moment($scope.minDate);
        }
        $scope.fromDate = moment(m).day(0).toDate();
        $scope.toDate = moment(m).day(6).toDate();
    }

    public getColumnDateFormat(): string {
        return 'ddd';
    }

}
