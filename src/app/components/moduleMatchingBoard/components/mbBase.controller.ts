import {LocalStorageService} from '../../../services/storage/local-storage.service';
import {ConcreteEvent} from '../../../model/rest/ConcreteEvent';
import {Session} from '../../../model/rest/Session';
import {Therapist} from '../../../model/rest/Therapist';
import {Collection} from '../../../model/Collection';
import {AvailabilityTherapistDayRecord} from '../../../model/rest/AvailabilityTherapistDayRecord';
import {ApiBookingService} from '../../../services/api/api-booking.service';
import {Utils} from '../../../services/utils.service';
import {ApiAvailabilityTherapistService} from '../../../services/api/api-availability-therapist.service';
import {ApiCalendarEventsService} from '../../../services/api/api-calendar-events.service';
import {ConcreteCalendarEvent} from '../../../model/rest/ConcreteCalendarEvent';
import {PreliminaryEvent} from '../../../model/rest/PreliminaryEvent';
import {MatchingBoardController} from './matchingBoard/matchingBoard.controller';

export interface MbBgLayoutData {
    concreteEvents: ConcreteEvent[];
    concreteCalendarEvents: ConcreteCalendarEvent[];
    therapistId2dayRecords: Collection<AvailabilityTherapistDayRecord[]>;
}

export abstract class MbBaseController {

    public abstract initForm(): void;

    public abstract applySession(session: Session): void;

    public abstract generateMbTable(matchingEvents: PreliminaryEvent[],
                                    confirmationEvents: PreliminaryEvent[],
                                    rowType): void;

    protected _rowType;

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
                public JbDialogService) {

        const MatchingBoardController: MatchingBoardController = $scope.$parent.MatchingBoardController;

        this.initForm();
        this.applySession(MatchingBoardController.session);

        $scope.$watch('MatchingBoardController.session', (session) => {
            this.applySession(session);
        });

        $scope.$watch('MatchingBoardController.matchingEvents', (matchingEvents: PreliminaryEvent[]) => {
            this.applyMatchingData();
        });

        $scope.rowType = LocalStorageService.getItem('moduleMatchingBoard.rowType');
        $scope.$watch('rowType', (rowType) => {
            this.applyRowType(rowType);
        });

    }

    public applyMatchingData(): void {
        const MatchingBoardController: MatchingBoardController = this.$scope.MatchingBoardController;
        this.generateMbTable(MatchingBoardController.matchingEvents, MatchingBoardController.confirmationEvents, this._rowType);
    }

    public applyRowType(rowType): void {
        this._rowType = rowType;
        const MatchingBoardController: MatchingBoardController = this.$scope.MatchingBoardController;
        this.generateMbTable(MatchingBoardController.matchingEvents, MatchingBoardController.confirmationEvents, this._rowType);

        this.LocalStorageService.setItem('moduleMatchingBoard.rowType', rowType);
    }

    protected loadBgLayoutData(dateFrom: string, dateTo: string): Promise<MbBgLayoutData> {
        const concreteEventsPromise: Promise<ConcreteEvent[]> = this.ApiBookingService.getEvents(undefined, dateFrom, dateTo);
        const concreteCalendarEventsPromise: Promise<ConcreteCalendarEvent[]> = this.ApiCalendarEventsService.getConcreteForAllCalendarEvents(dateFrom, dateTo);
        const therapistAvailabilityPromise: Promise<Collection<AvailabilityTherapistDayRecord[]>> = this.loadTherapistAvailability(dateFrom, dateTo);

        return this.$q.all({
            concreteEvents: concreteEventsPromise,
            concreteCalendarEvents: concreteCalendarEventsPromise,
            therapistId2dayRecords: therapistAvailabilityPromise,
        });
    }

    protected loadTherapistAvailability(dateFrom: string, dateTo: string): Promise<Collection<AvailabilityTherapistDayRecord[]>> {
        const MatchingBoardController: MatchingBoardController = this.$scope.$parent.MatchingBoardController;
        const session: Session = MatchingBoardController.session;
        const id2promise: Collection<Promise<AvailabilityTherapistDayRecord[]>> = session.therapists.reduce((id2promise: Collection<Promise<AvailabilityTherapistDayRecord[]>>, therapist: Therapist): Collection<Promise<AvailabilityTherapistDayRecord[]>> => {
            const therapistId = therapist.id;
            id2promise[therapistId] = this.ApiAvailabilityTherapistService.getAvailabilityTherapist(therapistId, dateFrom, dateTo);
            return id2promise;
        }, {});
        return this.$q.all(id2promise);
    }
}
