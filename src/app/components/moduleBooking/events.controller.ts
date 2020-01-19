import {defaultSlotSizeMin, timeFormat, workingDayEnd, workingDayStart} from '../../services/app.constant';
import {IRowCalColumn, IRowCalItem, IRowCalModel} from '../../directives/calendarRow/calendarRow.controller';
import {
    DialogService, IDialogConcreteCalendarEventConf, IDialogConcreteEventConf, IDialogConcreteEventRes,
    IDialogCrossingDataConf,
} from '../../services/dialog/dialog.service';
import {LocalStorageService} from '../../services/storage/local-storage.service';
import {Room} from '../../model/rest/Room';
import {Client} from '../../model/rest/Client';
import {Entity} from '../../model/Entity';
import {ConcreteEvent} from '../../model/rest/ConcreteEvent';
import {ConcreteEventSubStatus} from '../../model/rest/ConcreteEventSubStatus';
import {Therapist} from '../../model/rest/Therapist';
import {AvailabilityTherapistDayRecord} from '../../model/rest/AvailabilityTherapistDayRecord';
import {ServiceCategory} from '../../model/rest/ServiceCategory';
import {Session} from '../../model/rest/Session';
import {Restriction} from '../../model/rest/Restriction';
import {Service} from '../../model/rest/Service';
import {RestrictionType_Ns} from '../../model/rest/RestrictionType';
import {ConcreteEventState_Ns} from '../../model/rest/ConcreteEventState';
import {Event} from '../../model/rest/Event';
import {CrossingData} from '../../model/rest/CrossingData';
import {JbRowType} from '../../model/JbRowType';
import {SlotSize_Ns} from '../../model/SlotSize';
import {BookingEventNotification} from '../../model/BookingEventNotification';
import {CrudAction_Ns} from '../../model/CrudAction';
import {EntityDependencyService} from '../../services/entity-dependency.service';
import {Collection} from '../../model/Collection';
import {ConcreteCalendarEvent} from '../../model/rest/ConcreteCalendarEvent';
import {BaseCrossEvent} from '../../model/rest/BaseCrossEvent';
import {ApiBookingService} from '../../services/api/api-booking.service';
import {Utils} from '../../services/utils.service';
import {ApiCalendarEventsService} from '../../services/api/api-calendar-events.service';
import {CrossingDataType} from '../../model/rest/CrossingDataType';
import {ValidationService} from '../../services/validation.service';
import {MatchingBoardService} from '../moduleMatchingBoard/services/matchingBoard.service';
import ConcreteEventState = ConcreteEventState_Ns.ConcreteEventState;
import CrudAction = CrudAction_Ns.CrudAction;
import RestrictionType = RestrictionType_Ns.RestrictionType;
import SlotSize = SlotSize_Ns.SlotSize;
import {CalendarService} from '../../services/calendar.service';
import {IToastrService} from 'angular-toastr';
import {TherapistWeek} from '../../model/rest/TherapistWeek';

declare let angular: any;

export interface TherapistAndAvailability {
    therapist: Therapist;
    availability: AvailabilityTherapistDayRecord[];
}

export class EventsController {

    workingDayStartMin: number;
    workingDayEndMin: number;

    concreteEventSubStatusesNames: string[];

    therapists: Therapist[];

    concreteEvents: ConcreteEvent[];
    concreteCalendarEvents: ConcreteCalendarEvent[];
    categoryRestrictions: Restriction[];
    selectedCategories: ServiceCategory[];
    // weeks: TherapistWeek[];


    /** @ngInject */
    constructor(private date: string, // resolved
                concreteEvents: ConcreteEvent[],
                concreteCalendarEvents: ConcreteCalendarEvent[],
                private concreteEventSubStatuses: ConcreteEventSubStatus[],
                private rooms: Room[],
                private id2therapistAndAvailability: Collection<TherapistAndAvailability>,
                private categories: ServiceCategory[],
                private sessions: Session[],
                private restrictions: Restriction[],
                private events: Event[],
                private services: Service[],
                private clients: Client[],
                private week: TherapistWeek[],
                // injected
                private $scope,
                private moment,
                private WebSocketService,
                private LocalStorageService: LocalStorageService,
                private $state: ng.ui.IStateService,
                private Utils: Utils,
                private CalendarService: CalendarService,
                private _,
                private ApiBookingService: ApiBookingService,
                private ApiCalendarEventsService: ApiCalendarEventsService,
                private $q: any,
                private toastr: IToastrService,
                private DialogService: DialogService,
                private EntityDependencyService: EntityDependencyService,
                private MatchingBoardService: MatchingBoardService,
                private ValidationService: ValidationService,
                private env: any) {

        this.subscribeOnBookingEventNotification(env.bookingNotificationSubscriptionPath);

        this.workingDayStartMin = CalendarService.time2dayMinutes(workingDayStart);
        this.workingDayEndMin = CalendarService.time2dayMinutes(workingDayEnd);

        this.concreteEventSubStatusesNames = concreteEventSubStatuses.map(ss => ss.name);

        this.therapists = [];
        this.concreteEvents = concreteEvents;
        this.concreteCalendarEvents = concreteCalendarEvents;
        this.categoryRestrictions = restrictions.filter(
            (r: Restriction) => r.type === RestrictionType.category);
        this.selectedCategories = [];

        this.initForm();
        this.initScope();
    }

    private initForm() {
        const $scope = this.$scope;

        $scope.date = this.Utils.initDateFromStr(this.date);
        $scope.minDate = null;
        $scope.maxDate = null;

        $scope.rowType = this.LocalStorageService.getItem('moduleBooking.rowType') || JbRowType.rooms;
        $scope.rowTypes = [JbRowType.therapists, JbRowType.rooms];

        const _allCategory: ServiceCategory = {
            id: -1, // -1 means 'all'
            name: 'All categories',
            services: [],
        };
        $scope.categories = [_allCategory].concat(this.categories);
        $scope.selectedCategory = this.LocalStorageService.getItem('BookingModule:selectedCategory');
        this.selectedCategories = [];
        $scope.weeks = angular.copy(this.week);
        $scope.sessions = angular.copy(this.sessions);

        // select all therapist having a session
        if (this.sessions) {
            this.sessions.forEach((session: Session) => {
                session.therapists.forEach((therapist: Therapist) => {
                    if (this.therapists.indexOf(therapist) === -1) {
                        this.therapists.push(therapist);
                    }
                });
            });
        }
        $scope._session = this.LocalStorageService.getItem('BookingModule:selectedSession');
        $scope.session = this.LocalStorageService.getItem('BookingModule:selectedSession');
        this.generateTable();
    }

    private initScope() {
        const $scope = this.$scope;

        $scope.displayItem = (item) => item && item.name;
        $scope.applyCategoriesFilter = (selectedCategory) => {
            if (!selectedCategory || selectedCategory.id < 0) {
                this.selectedCategories = undefined;
                // this.selectedCategories = this.categories.slice();
            } else {
                this.selectedCategories = [selectedCategory];
            }
            this.LocalStorageService.setItem('BookingModule:selectedCategory', selectedCategory);
            this.generateTable();
        };

        $scope.applyTherapistWeekFilter = (week) => {
            if (!week || week.id < 0) {
                this.week = undefined;
                // this.selectedCategories = this.categories.slice();
            } else {
                this.week = [week];
            }
            $scope.week = week;
            this.generateTable();
        };
        $scope.clearTherapistWeekFilter = () => {
            $scope.week = undefined;
            this.week = [];
            this.generateTable();
        };

        $scope.clearCategoriesFilter = () => {
            $scope.selectedCategory = null;
            this.LocalStorageService.setItem('BookingModule:selectedCategory', null);
            this.selectedCategories = [];

            this.generateTable();
        };

        $scope.applySessionFilter = (_session: Session) => {
            if (_session) {
                const minDate: Date = this.Utils.initDateFromStr(_session.startDate);
                $scope.minDate = minDate;
                const maxDate: Date = this.Utils.initDateFromStr(_session.endDate);
                $scope.maxDate = maxDate;

                const date: Date = $scope.date;
                if (date.getTime() < minDate.getTime()) {
                    $scope.date = new Date(minDate.getTime());
                } else if (date.getTime() > maxDate.getTime()) {
                    $scope.date = new Date(maxDate.getTime());
                }

                $scope.session = _session;
                this.LocalStorageService.setItem('BookingModule:selectedSession', _session);
            }
            this.generateTable();
        };

        $scope.clearSessionFilter = () => {
            $scope.minDate = null;
            $scope.maxDate = null;
            $scope._session = null;
            $scope.session = null;
            this.LocalStorageService.setItem('BookingModule:selectedSession', null);
            this.generateTable();
        };

        $scope.$watch('rowType', (rowType: string) => {
            this.LocalStorageService.setItem('moduleBooking.rowType', rowType);

            this.generateTable();
        });

        $scope.displayRowType = (rt: number) => JbRowType[rt];

        $scope.displayColumnType = (rt: number) => {
            return rt === JbRowType.therapists
                ? JbRowType[JbRowType.rooms]
                : JbRowType[JbRowType.therapists];
        };

        $scope.slotSize = this.LocalStorageService
            .getItem('BookingModule:selectedSlotSize') || SlotSize.slot15min; // defaultSlotSizeMin

        $scope.setSlotSize = (slotSize: number) => {
            const items: IRowCalItem[] = $scope.calendarRowCtrl.getItems();
            const adjustedSlotSize = this.CalendarService.adjustSlotSize(items, slotSize);
            if (adjustedSlotSize !== slotSize) {
                this.toastr.warning('Chosen slot size does not fit model', 'Error');
            }
            $scope.slotSize = adjustedSlotSize;
            this.LocalStorageService.setItem('BookingModule:selectedSlotSize', adjustedSlotSize);
        };

        $scope.onDateChange = (date) => {
            this.$state.go('auth.booking.events', {
                date: this.Utils.dateToFormat(date),
            });
        };

        $scope.onAdd = (item: IRowCalItem, $event, force = false): Promise<IRowCalItem> => {
            let concreteEvent: ConcreteEvent;
            if (item.model) {
                concreteEvent = item.model;
            } else {
                const timeStr = this.moment('00:00', timeFormat)
                    .add(item.timeStart + this.workingDayStartMin, 'm')
                    .format(timeFormat);
                const dateStr = this.Utils.dateToFormat($scope.date);
                const session: Session = $scope.session;
                let therapist, room;
                if ($scope.rowType === JbRowType.rooms/*columnType = therapist*/) {
                    const therapistId = item.column.columnKey;
                    therapist = this._.find(this.therapists, t => t.id === therapistId);
                } else {
                    const roomId = item.column.columnKey;
                    room = this._.find(this.rooms, r => r.id === roomId);
                }
                concreteEvent = {
                    id: null,
                    event: null,
                    service: null,
                    room: room,
                    therapist: therapist,
                    client: null,
                    session,
                    note: '',
                    time: timeStr,
                    date: dateStr,
                    state: ConcreteEventState.tentative,
                    subStatus: '',
                    duration: {
                        prep: 0,
                        processing: 0, // item.timeEnd - item.timeStart,// initial duration. Real duration will be get from event in dialog
                        clean: 0,
                    },
                } as ConcreteEvent;
            }
            const dialogConf: IDialogConcreteEventConf = this._.assign(this.createDialogConcreteEventConf(), {
                targetEvent: $event,
                canEdit: true,
                canRemove: false,
            });
            return this.DialogService.dialogConcreteEvent(concreteEvent, dialogConf)
                .then(res => this.onAddDialogConcreteEvent(item, $event, res));

        };

        $scope.onEdit = (item: IRowCalItem, $event, force = false): Promise<IRowCalItem> => {

            if (item.model.service) {
                const concreteEvent: ConcreteEvent = angular.copy(item.model);
                const dialogConf: IDialogConcreteEventConf = this._.assign(this.createDialogConcreteEventConf(), {
                    targetEvent: $event,
                    canEdit: true,
                    canRemove: true,
                });
                return this.DialogService.dialogConcreteEvent(concreteEvent, dialogConf)
                    .then(res => this.onEditDialogConcreteEvent(item, $event, res));
            } else {
                const concreteCalendarEvent: ConcreteCalendarEvent = angular.copy(item.model);
                const dialogConf: IDialogConcreteCalendarEventConf = {
                    targetEvent: $event,
                    isReadOnly: false,
                    canRemove: true,
                };

                return this.DialogService.dialogConcreteCalendarEvent(concreteCalendarEvent, dialogConf)
                    .then(res => this.onEditDialogCalendarEvent(item, $event, res));
            }

        };

        $scope.onDrop = (item: IRowCalItem, bgItems: IRowCalItem[], items: IRowCalItem[], force = false): Promise<IRowCalItem> => {
            if (item.model.service) {
                return this.onDropConcreteEvent(item, force);
            } else {
                return this.onDropCalendarEvent(item, force);
            }
        };

    }

    private createDialogConcreteEventConf(): IDialogConcreteEventConf {
        return {
            targetEvent: undefined,
            canEdit: false,
            canRemove: false,

            events: this.events,
            services: this.services,
            categories: this.categories,
            rooms: this.rooms,
            therapists: this.therapists,
            clients: this.clients,
            sessions: this.sessions,
            restrictions: this.restrictions,
            subStatuses: this.concreteEventSubStatusesNames,
        };
    }

    private onAddDialogConcreteEvent(item: IRowCalItem, $event, res: IDialogConcreteEventRes): IRowCalItem {
        const concreteEvent: ConcreteEvent = res.baseConcreteEvent;
        const noEmails: boolean = res.noEmails;
        this.updateItemFromModel(item, concreteEvent);

        return this.$q(resolve => resolve(item))
            .then(item => this.checkItemValid(item))
            .then(
                (item: IRowCalItem) => this.postEvent(item, $event, noEmails),
                () => this.$scope.onAdd(item, $event)
                       ,
            );
    }

    private onEditDialogConcreteEvent(item: IRowCalItem, $event, res: IDialogConcreteEventRes): Promise<IRowCalItem> {
        const concreteEvent: ConcreteEvent = res.baseConcreteEvent;
        const noEmails: boolean = res.noEmails;
        if (concreteEvent) {// edited
            this.updateItemFromModel(item, concreteEvent);

            return this.$q(resolve => resolve(item))
                .then((item) => this.checkItemValid(item))
                .then(
                    (item: IRowCalItem) => this.putEvent(item, $event, noEmails, false),
                    () => this.$scope.onEdit(item, $event),
                );
        } else { // removed
            return this.ApiBookingService.removeEvent(item.model, noEmails)
                .then(
                    () => this.updateAndReturn(null/* remove from view */, 'Concrete event removed successfully'),
                );
        }
    }

    private onEditDialogCalendarEvent(item: IRowCalItem, $event, concreteCalendarEvent: ConcreteCalendarEvent): Promise<IRowCalItem> {
        if (!concreteCalendarEvent) { //remove ConcreteCalendarEvent
            return this.ApiBookingService.removeCalendarEvent(item.model, true)
                .then(
                    () => this.updateAndReturn(null/* remove from view */, 'Concrete event removed successfully'),
                );
        } else {
            this.updateItemFromModel(item, concreteCalendarEvent);

            return this.$q(resolve => resolve(item))
            // .then((item) => this.checkItemValid(item)) // room and therapist not changed
                .then(
                    (item: IRowCalItem) => this.putConcreteCalendarEvent(item, $event, false),
                    // () => this.$scope.onEdit(item, $event),
                );
        }
    }

    private onDropConcreteEvent(item: IRowCalItem, force: boolean): Promise<IRowCalItem> {
        return this.$q(resolve => resolve(item))
            .then(item => this.checkItemValid(item))
            .then((item: IRowCalItem) => this.putEvent(item, null, false, force));
    }

    private onDropCalendarEvent(item: IRowCalItem, force: boolean): Promise<IRowCalItem> {
        return this.$q(resolve => resolve(item))
            .then((item: IRowCalItem) => this.putConcreteCalendarEvent(item, null, force));
    }

    private handleAddConcreteCrossing(item: IRowCalItem, $event, err, noEmails: boolean) {
        return this.handleErrorCrossing(err.data as CrossingData, item, $event)
            .then((force: boolean) => {
                if (force) {
                    return this.postEvent(item, $event, noEmails, force);
                } else {
                    return this.$scope.onAdd(item, $event, force);
                }
            });
    }

    private handleEditCalendarCrossing(item: IRowCalItem, $event, err) {
        return this.handleErrorCrossing(err.data as CrossingData, item, $event)
            .then((force: boolean) => {
                if (force) {
                    return this.putConcreteCalendarEvent(item, $event, true);
                } else {
                    return this.$scope.onEdit(item, $event, false);
                }
            });
    }

    private handleEditConcreteCrossing(item: IRowCalItem, $event, err, noEmails: boolean) {
        return this.handleErrorCrossing(err.data as CrossingData, item, $event)
            .then((force: boolean) => {
                if (force) {
                    return this.putEvent(item, $event, noEmails, true);
                } else {
                    return this.$scope.onEdit(item, $event, false);
                }
            });
    }

    private updateRoomColor(concreteEvents: ConcreteEvent [], columns: IRowCalColumn []) {
        columns.forEach((column: IRowCalColumn) => {
            const {preferredRooms = []} = column.columnMeta;
            preferredRooms.forEach((room: Room) => room.color = false);
            concreteEvents.forEach((event) => {
                const matchRoom = preferredRooms.find(x => x.id === event.room.id);
                if (event.therapist.id === column.columnKey && !matchRoom) {
                    preferredRooms.forEach((room: Room) => {
                        room.color = room.id !== event.room.id;
                    });
                }
            });
            column.columnMeta.preferredRooms = preferredRooms;
        });
        this.$scope.columns = columns;
    }
    private updateAndReturn(returnedItem: IRowCalItem, toastrMessage: string): Promise<IRowCalItem> {
        return this.getEvents()
            .then((concreteEvents: ConcreteEvent[]) => {
                this.concreteEvents = concreteEvents;
                this.updateRoomColor(concreteEvents, this.$scope.columns);
                this.toastr.info(toastrMessage);
                return returnedItem;
            });
    }

    private updateCalendarAndReturn(returnedItem: IRowCalItem, toastrMessage: string): Promise<IRowCalItem> {
        return this.getCalendarEvents()
            .then((concreteCalendarEvents: ConcreteCalendarEvent[]) => {
                this.concreteCalendarEvents = concreteCalendarEvents;
                this.toastr.info(toastrMessage);
                return returnedItem;
            });
    }

    private handleResponseCrossing(crossingData: CrossingData, item: IRowCalItem, $event): Promise<IRowCalItem> | IRowCalItem {
        return item;
    }

    private handleErrorCrossing(crossingData: CrossingData, item: IRowCalItem, $event): Promise<boolean> {
        const dataArr: CrossingData[] = [crossingData];
        const useForce: boolean = this.shouldUseForce(dataArr);
        const dialogConf: IDialogCrossingDataConf = {
            targetEvent: $event,
            useConfirmBtn: useForce,
            useEditBtn: true,
        };
        return this.DialogService.dialogCrossingData(dataArr, dialogConf);
    }

    private shouldUseForce(crossingDataArr: CrossingData[]): boolean {
        const hist: Collection<number> = this.Utils.calculateCrossingHistogram(crossingDataArr);
        if (hist[CrossingDataType.calendar] || hist[CrossingDataType.concrete]) {
            return false;
        } else if (hist[CrossingDataType.unavailable]) {
            return true;
        } else {// hist[CrossingDataType.confirmation]
            return false;
        }
    }

    private postEvent(item: IRowCalItem, $event, noEmails: boolean, force: boolean = false) {
        return this.ApiBookingService.postEvent(item.model, noEmails, force)
            .then(
                (concreteEvent: ConcreteEvent) => {
                    item.model = concreteEvent;
                    return item;
                },
                (err) => this.handleAddConcreteCrossing(item, $event, err, noEmails),
            )
            .then(
                (item: IRowCalItem) => this.updateAndReturn(item, 'Concrete event saved successfully'),
            )
            .then(
                (item: IRowCalItem) => {
                    const event: ConcreteEvent = item.model;
                    return event.date === this.Utils.dateToFormat(this.$scope.date)
                        ? item
                        : null; // to remove view
                },
            );
    }

    private putEvent(item: IRowCalItem, $event, noEmails: boolean, force: boolean) {
        return this.ApiBookingService.putEvent(item.model, noEmails, force)
            .then(
                (crossingData: CrossingData) => this.handleResponseCrossing(crossingData, item, null),
                (err) => this.handleEditConcreteCrossing(item, $event, err, noEmails),
            )
            .then(
                (item: IRowCalItem) => this.updateAndReturn(item, 'Concrete event saved successfully'),
            )
            .then(
                (item: IRowCalItem) => {
                    const event: ConcreteEvent = item.model;
                    return event.date === this.Utils.dateToFormat(this.$scope.date)
                        ? item
                        : null; // to remove view
                },
            );
    }

    /**
     * Only for ConcreteCalendarEvents
     * @param {IRowCalItem} item
     * @param $event
     * @param {boolean} force
     * @returns {Promise<IRowCalItem>}
     */
    private putConcreteCalendarEvent(item: IRowCalItem, $event, force: boolean): Promise<IRowCalItem> {
        const concreteCalendarEvent: ConcreteCalendarEvent = item.model;
        return this.ApiCalendarEventsService.putConcreteCalendarEvent(concreteCalendarEvent.calendarEvent.id, concreteCalendarEvent.id, concreteCalendarEvent, force)
            .then(
                (crossingData: CrossingData) => this.handleResponseCrossing(crossingData, item, null),
                (err) => this.handleEditCalendarCrossing(item, $event, err),
            )
            .then(
                (item: IRowCalItem) => this.updateCalendarAndReturn(item, 'Concrete calendar event saved successfully'),
            )
            .then(
                (item: IRowCalItem) => {
                    const event: ConcreteCalendarEvent = item.model;
                    return event.date === this.Utils.dateToFormat(this.$scope.date)
                        ? item
                        : null; // to remove view
                },
            );
    }

    private uniqueObjects<T extends Array<M>, M extends { id: number }>(arr: T): T {
        const newArr: T = [] as T;
        arr.forEach((item: M) => {
            if (!newArr.some((existItem: M) => existItem.id === item.id)) {
                newArr.push(item);
            }
        });
        return newArr;
    }

    private generateTable() {
        const $scope = this.$scope;
        const currentDate = new Date();
        const dateLS = new Date(this.LocalStorageService.getItem('BookingModule: date'));

        if (!this._.isEmpty(dateLS)) {
            if (currentDate.getMonth() > dateLS.getMonth() || currentDate.getDate() > dateLS.getDate()) {
                this.LocalStorageService.setItem('ConcreteEvent: default-room', {});
                this.LocalStorageService.setItem('ConcreteEvent: default-service', {});
            }
        }
        const concreteEvents: BaseCrossEvent[] = (<BaseCrossEvent[]>this.concreteEvents).concat(this.concreteCalendarEvents);
        $scope.concreteEvents = concreteEvents;
        const rowType: JbRowType = $scope.rowType;

        let columns: IRowCalColumn[];
        let itemsBackground: IRowCalItem[];
        let filteredEvents: BaseCrossEvent[];
        if (rowType === JbRowType.rooms/*columnType = therapist*/) {
            let filteredTherapists: Therapist[] = this.EntityDependencyService.filteredTherapistsByCategories(this.therapists, this.selectedCategories);

            const session: Session = $scope.session;

            // filtered by Session
            if (session) {
                filteredTherapists = filteredTherapists.filter((t: Therapist) => {
                    const therapistId = t.id;
                    return session.therapists.some((st: Therapist) => st.id === therapistId);
                });
            }
            if (this.$scope.week) {
                if (this.$scope.week.therapists) {
                console.log('IF GEN TABLE ', this.$scope.week);
                filteredTherapists = filteredTherapists.filter((t: Therapist) => {
                    const therapistId = t.id;
                    return this.$scope.week.therapists.some((st: Therapist) => st.id === therapistId);
                })}
            }
            // filtered by unique id
            filteredTherapists = this.uniqueObjects(filteredTherapists);

            columns = filteredTherapists
                .map(e => this.entityToColumnMapper(e))
                .sort((a: IRowCalColumn, b: IRowCalColumn) => a.columnKey - b.columnKey);
            itemsBackground = this.getAvailabilityBgItemsForTherapists(filteredTherapists, columns, this.id2therapistAndAvailability);
            filteredEvents = concreteEvents.filter((concreteEvent: ConcreteEvent) => {
                const eventTherapistId = concreteEvent.therapist && concreteEvent.therapist.id;
                return this._.find(filteredTherapists, (t) => t.id === eventTherapistId);
            });
        } else {
            const filteredRooms: Room[] = this.EntityDependencyService.filteredRoomsByCategoriesRestrictions(this.rooms, this.selectedCategories, this.categoryRestrictions);

            columns = filteredRooms
                .map(e => this.entityToColumnMapper(e))
                .sort((a: IRowCalColumn, b: IRowCalColumn) => a.columnKey - b.columnKey);
            itemsBackground = [];

            filteredEvents = concreteEvents.filter((concreteEvent: ConcreteEvent) => {
                const eventRoomId = concreteEvent.room && concreteEvent.room.id;
                return this._.find(filteredRooms, (r) => r.id === eventRoomId);
            });
        }

        $scope.columns = columns;
        this.updateRoomColor(this.concreteEvents, $scope.columns);
        $scope.calendarRowModel = {
            items: filteredEvents,
            itemsBackground: itemsBackground,
            isReadOnly: false,
        } as IRowCalModel;
    }

    private getAvailabilityBgItemsForTherapists(tableTherapists: Therapist[],
                                                columns: IRowCalColumn[],
                                                id2therapistAndAvailability): IRowCalItem[] {
        return tableTherapists.reduce((itemsBackground: IRowCalItem[], therapist: Therapist) => {
            let bgItems: IRowCalItem[];
            const therapistId = therapist.id;
            const column: IRowCalColumn = this._.find(columns, (column: IRowCalColumn) => column.columnKey === therapistId);
            const dayRecords: AvailabilityTherapistDayRecord[] = id2therapistAndAvailability[therapistId].availability;

            if (dayRecords) {
                bgItems = this.MatchingBoardService.createUnavailabilityItemsForTherapist(dayRecords);
                bgItems.forEach((bgItem: IRowCalItem) => {
                    bgItem.column = column;
                });
            } else {
                bgItems = [];
            }
            return itemsBackground.concat(bgItems);
        }, []);
    }

    private entityToColumnMapper(e: Entity): IRowCalColumn {// todo use service
        return {
            columnKey: e.id,
            columnTitle: e.name,
            columnMeta: e,
        } as IRowCalColumn;
    }

    private updateItemFromModel(item: IRowCalItem, itemEvent: BaseCrossEvent) {
        item.model = itemEvent;
        item.model.clientsIds = [itemEvent.client.id];

        item.timeStart = this.Utils.strTimeToMinutes(itemEvent.time);
        const dur = itemEvent.duration;
        item.timeEnd = item.timeStart + (dur.prep + dur.processing + dur.clean);

        const columnKey = this.$scope.rowType === JbRowType.rooms /*columnType = therapist*/
            ? (itemEvent.therapist && itemEvent.therapist.id)
            : (itemEvent.room && itemEvent.room.id);
        item.column = this._.find(this.$scope.columns, (c: IRowCalColumn) => c.columnKey === columnKey);

    }

    private checkItemValid(item: IRowCalItem): Promise<IRowCalItem> | IRowCalItem {
        return this.ValidationService.checkItemValid(item, this.services, this.restrictions, this.categories, this.rooms);
    }

    private getEvents(): Promise<ConcreteEvent[]> {
        return this.ApiBookingService.getEvents(this.Utils.dateToFormat(this.$scope.date));
    }

    private getCalendarEvents(): Promise<ConcreteCalendarEvent[]> {
        const date = this.Utils.dateToFormat(this.$scope.date);
        return this.ApiCalendarEventsService.getConcreteForAllCalendarEvents(date, date);
    }

    private subscribeOnBookingEventNotification(bookingNotificationSubscriptionPath: string) {
        this.WebSocketService.connect().then(() => {
            console.log('WebSocketService connected'); // todo

            this.WebSocketService.subscribe(bookingNotificationSubscriptionPath, (bookingNotification) => {
                this.bookingNotificationHandler(JSON.parse(bookingNotification.body) as BookingEventNotification);
            });
        });

        this.$scope.$on('$destroy', () => {
            this.WebSocketService.disconnect().then(() => {
                console.log('WebSocketService disconnected');
            });

        });
    }

    private bookingNotificationHandler(notification: BookingEventNotification): void {

        if (this.Utils.dateToFormat(this.$scope.date) !== notification.concreteEventDate) {
            return; // ignore the notification
        }

        switch (notification.action) {
            case CrudAction_Ns[CrudAction.CREATE]:
                this.ApiBookingService.getEvent(notification.concreteEventId).then((event: ConcreteEvent) => {
                    this.concreteEvents = this.concreteEvents.concat([event]);
                    this.generateTable();
                });
                break;
            case CrudAction_Ns[CrudAction.UPDATE]:
                this.ApiBookingService.getEvent(notification.concreteEventId).then((updatedEvent: ConcreteEvent) => {
                    const eventId = notification.concreteEventId;
                    this.concreteEvents = this.concreteEvents.map((event: ConcreteEvent): ConcreteEvent => {
                        return (event.id === eventId) ? updatedEvent : event;
                    });
                    this.generateTable();
                });
                break;
            case CrudAction_Ns[CrudAction.DELETE]:
                const eventId = notification.concreteEventId;
                this.concreteEvents = this.concreteEvents.filter((concreteEvent: ConcreteEvent) => concreteEvent.id !== eventId);
                this.generateTable();
                break;
        }

    }


}
