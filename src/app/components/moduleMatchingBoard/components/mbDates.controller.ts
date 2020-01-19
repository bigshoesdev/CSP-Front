import {IRowCalColumn, IRowCalItem, IRowCalModel} from '../../../directives/calendarRow/calendarRow.controller';
import {LocalStorageService} from '../../../services/storage/local-storage.service';
import {Room} from '../../../model/rest/Room';
import {MbBaseController, MbBgLayoutData} from './mbBase.controller';
import {IMbRow} from './mbTable/mbTable.directive';
import {ConcreteEvent} from '../../../model/rest/ConcreteEvent';
import {PreliminaryEvent} from '../../../model/rest/PreliminaryEvent';
import {Therapist} from '../../../model/rest/Therapist';
import {AvailabilityTherapistDayRecord} from '../../../model/rest/AvailabilityTherapistDayRecord';
import {JbRowType} from '../../../model/JbRowType';
import {ApiBookingService} from '../../../services/api/api-booking.service';
import {Utils} from '../../../services/utils.service';
import {ApiAvailabilityTherapistService} from '../../../services/api/api-availability-therapist.service';
import {ApiCalendarEventsService} from '../../../services/api/api-calendar-events.service';
import {MatchingBoardService} from '../services/matchingBoard.service';
import {ConcreteCalendarEvent} from '../../../model/rest/ConcreteCalendarEvent';
import {MatchingBoardController} from './matchingBoard/matchingBoard.controller';
import {ClientServiceMatchingData} from '../../../model/rest/ClientServiceMatchingData';

declare let angular: any;

export abstract class MbDatesController extends MbBaseController {

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
            JbDialogService);

    }

    protected generateMbTableRows(matchingEvents: PreliminaryEvent[],
                                  confirmationEvents: PreliminaryEvent[],
                                  rowType,
                                  columns: IRowCalColumn[],
                                  res: MbBgLayoutData): IMbRow[] {
        let rows: IMbRow[];

        const $scope = this.$scope;
        const MatchingBoardService: MatchingBoardService = this.MatchingBoardService;
        const MatchingBoardController: MatchingBoardController = this.$scope.MatchingBoardController;

        const tableRooms = MatchingBoardController._tableRooms;
        const tableTherapists = MatchingBoardController._tableTherapists;
        const matchingDataArr: ClientServiceMatchingData[] = MatchingBoardController._matchingDataArr;

        const allMatchingDataItems: PreliminaryEvent[] = matchingEvents;
        const therapistId2dayRecords = res.therapistId2dayRecords;
        const concreteEvents: ConcreteEvent[] = res.concreteEvents;
        const concreteCalendarEvents: ConcreteCalendarEvent[] = res.concreteCalendarEvents;
        const confirmationEventsOfTheClient: PreliminaryEvent[] = confirmationEvents;
        const confirmationEventsOfOtherClients: PreliminaryEvent[] = MatchingBoardService.getConfirmationEventsOfOtherClients(matchingDataArr, MatchingBoardController.clientId);

        const columnKey2Column = MatchingBoardService.collectColumns(columns);

        if (rowType === JbRowType.rooms) {
            rows = tableRooms.map((r: Room): IMbRow => {
                const roomId = r.id;

                const availabilityBgItems: IRowCalItem[] = this.getBgItemsForRoom();

                const concreteBgItems: IRowCalItem[] = MatchingBoardService.createDatesBgItemsForRoom(concreteEvents, 'booked', roomId, columns, columnKey2Column);
                const concreteCalendarBgItems: IRowCalItem[] = MatchingBoardService.createDatesBgItemsForRoom(concreteCalendarEvents, 'calendar', roomId, columns, columnKey2Column);
                const confirmationBgItems: IRowCalItem[] = MatchingBoardService.createDatesBgItemsForRoom(confirmationEventsOfTheClient, 'confirmation', roomId, columns, columnKey2Column);
                const confirmationOtherClientsBgItems: IRowCalItem[] = MatchingBoardService.createDatesBgItemsForRoom(confirmationEventsOfOtherClients, 'confirmation-other', roomId, columns, columnKey2Column);

                const allItems = availabilityBgItems.concat(concreteBgItems, concreteCalendarBgItems, confirmationBgItems, confirmationOtherClientsBgItems);
                $scope.rowItems = $scope.rowItems ? $scope.rowItems.concat(allItems) : allItems;

                return {
                    rowTitle: r.name,
                    rowMeta: r,
                    rowModel: {
                        items: MatchingBoardService.filterDatesItemsForRoom(allMatchingDataItems, roomId, columns),
                        itemsBackground: allItems,
                        isReadOnly: false
                    } as IRowCalModel
                } as IMbRow;
            });
        } else {
            rows = tableTherapists.map((t: Therapist): IMbRow => {
                const therapistId = t.id;

                const availabilityBgItems: IRowCalItem[] = this.getBgItemsForTherapist(therapistId2dayRecords[therapistId], columns);

                const concreteBgItems: IRowCalItem[] = MatchingBoardService.createDatesBgItemsForTherapist(concreteEvents, 'booked', therapistId, columns, columnKey2Column);
                const concreteCalendarBgItems: IRowCalItem[] = MatchingBoardService.createDatesBgItemsForTherapist(concreteCalendarEvents, 'calendar', therapistId, columns, columnKey2Column);
                const confirmationBgItems: IRowCalItem[] = MatchingBoardService.createDatesBgItemsForTherapist(confirmationEventsOfTheClient, 'confirmation', therapistId, columns, columnKey2Column);
                const confirmationOtherClientsBgItems: IRowCalItem[] = MatchingBoardService.createDatesBgItemsForTherapist(confirmationEventsOfOtherClients, 'confirmation-other', therapistId, columns, columnKey2Column);

                const allItems = availabilityBgItems.concat(concreteBgItems, concreteCalendarBgItems, confirmationBgItems, confirmationOtherClientsBgItems);
                $scope.rowItems = $scope.rowItems ? $scope.rowItems.concat(allItems) : allItems;

                return {
                    rowTitle: t.name,
                    rowMeta: t,
                    rowModel: {
                        items: MatchingBoardService.filterDatesItemsForTherapist(allMatchingDataItems, therapistId, columns),
                        itemsBackground: allItems,
                        isReadOnly: false
                    } as IRowCalModel
                } as IMbRow;
            });
        }

        return rows;
    }

    private getBgItemsForRoom(): IRowCalItem[] {
        return []; // It makes no sense to use bg availability for the mode
    }

    private getBgItemsForTherapist(therapistDayRecords: AvailabilityTherapistDayRecord[], columns: IRowCalColumn[]): IRowCalItem[] {
        let itemsBackground: IRowCalItem[];
        if (therapistDayRecords) {
            itemsBackground = columns.reduce((itemsBackground: IRowCalItem[], column: IRowCalColumn) => {
                const date = column.columnKey;
                const dayRecords: AvailabilityTherapistDayRecord[] = therapistDayRecords.filter((dayRecord: AvailabilityTherapistDayRecord) => dayRecord.date === date);

                const bgItems: IRowCalItem[] = this.MatchingBoardService.createUnavailabilityItemsForTherapist(dayRecords);
                bgItems.forEach((bgItem: IRowCalItem) => {
                    bgItem.column = column;
                });
                return itemsBackground.concat(bgItems);
            }, []);
        } else {
            itemsBackground = [];
        }
        return itemsBackground;
    }


}

