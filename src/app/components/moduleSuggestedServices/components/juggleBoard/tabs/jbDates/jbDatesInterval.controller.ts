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

export class JbDatesIntervalController extends JbDatesController {
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

        $scope.getMaxDate = () => $scope.toDate || $scope.maxDate;
        $scope.getMinDate = () => $scope.fromDate || $scope.minDate;
    }

    public initForm() {
        const $scope = this.$scope;
        const Utils: Utils = this.Utils;
        const LocalStorageService: LocalStorageService = this.LocalStorageService;
        const session: Session = this.$scope.JuggleBoardController.session;

        const fromDate: string = LocalStorageService.getItem('moduleSuggestedServices.fromDate') || (session && session.startDate);
        $scope.fromDate = Utils.initDateFromStr(fromDate);

        const toDate: string = LocalStorageService.getItem('moduleSuggestedServices.toDate') || (session && session.startDate);
        $scope.toDate = Utils.initDateFromStr(toDate);
    }


    public applySession() {
        const $scope = this.$scope;
        const session: Session = $scope.JuggleBoardController.session;

        if (session) {
            $scope.minDate = this.Utils.initDateFromStr(session.startDate);
            $scope.maxDate = this.Utils.initDateFromStr(session.endDate);
        }
    }


    public onFromDateChange(date) {
        this.LocalStorageService.setItem('moduleSuggestedServices.fromDate', this.Utils.dateToFormat(date));
    }

    public onToDateChange(date) {
        this.LocalStorageService.setItem('moduleSuggestedServices.toDate', this.Utils.dateToFormat(date));
    }

    public getColumnDateFormat(): string {
        return 'MMM D';
    }
}
