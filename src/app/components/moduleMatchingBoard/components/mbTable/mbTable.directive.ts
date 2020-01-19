import {IRowCalColumn, IRowCalItem, IRowCalModel} from '../../../../directives/calendarRow/calendarRow.controller';
import {
    DialogService, IDialogConcreteEventConf, IDialogCrossingDataConf,
    IDialogPreliminaryEventRes,
} from '../../../../services/dialog/dialog.service';
import {Moment} from '../../../../../../bower_components/moment/moment';
import {dateFormat} from '../../../../services/app.constant';
import {Room} from '../../../../model/rest/Room';
import {PreliminaryEvent} from '../../../../model/rest/PreliminaryEvent';
import {CrossingData} from '../../../../model/rest/CrossingData';
import {Service} from '../../../../model/rest/Service';
import {SlotSize_Ns} from '../../../../model/SlotSize';
import {JbRowType} from '../../../../model/JbRowType';
import {CompositeTime} from '../../../../model/rest/CompositeTime';
import {EntityDependencyService} from '../../../../services/entity-dependency.service';
import {ApiMatchingBoardService} from '../../../../services/api/api-matching-board.service';
import {ServiceCategory} from '../../../../model/rest/ServiceCategory';
import {Restriction} from '../../../../model/rest/Restriction';
import {Utils} from '../../../../services/utils.service';
import {Collection} from '../../../../model/Collection';
import {CrossingDataType} from '../../../../model/rest/CrossingDataType';
import {ValidationService} from '../../../../services/validation.service';
import SlotSize = SlotSize_Ns.SlotSize;
import {CalendarService} from '../../../../services/calendar.service';
import {MatchingBoardController} from '../matchingBoard/matchingBoard.controller';
import {IToastrService}from 'angular-toastr';

declare let angular: any;

export interface MbTable {
    columns: IRowCalColumn[];
    rows: IMbRow[];
}

export interface IMbRow {
    rowTitle: string;
    rowMeta?: any;
    rowModel: IRowCalModel;
}


/** @ngInject */
export function mbTable(_, CalendarService: CalendarService, $state: ng.ui.IStateService, $q: any, toastr: IToastrService, EntityDependencyService: EntityDependencyService,
                        DialogService: DialogService, Utils: Utils, moment, ApiMatchingBoardService: ApiMatchingBoardService,
                        ValidationService: ValidationService) {
    return {
        templateUrl: 'app/components/moduleMatchingBoard/components/mbTable/mbTable.html',
        restrict: 'A',
        scope: {
            mbTableConf: '=mbTable', // MbTable
            rowType: '=mbTableRowType', // number : JbRowType
        },
        link: function postLink(scope, iElement, iAttrs, controller) {
            const $parent = scope.$parent;
            const MatchingBoardController: MatchingBoardController = $parent.MatchingBoardController;

            const allRooms: Room[] = MatchingBoardController.rooms;
            const allCategories: ServiceCategory[] = MatchingBoardController.categories;
            const allRestrictions: Restriction[] = MatchingBoardController.restrictions;
            const allServices: Service[] = MatchingBoardController.services;

            scope.calendarRowCtrlList = {};

            // Take on a maximal slot,it will reduce later
            scope.slotSize = SlotSize.slot60min;

            scope.setSlotSize = (slotSize, toNotify: boolean = true) => {
                const items: IRowCalItem[] = (scope.calendarRowCtrlList === undefined) ? [] : _.reduce(
                    scope.calendarRowCtrlList,
                    (items, cellCtrl, id) => items.concat(cellCtrl.getItems()),
                    [],
                );
                if (!items.length) { return; }

                if (items) {
                    scope.mbTableItems = items;
                    const adjustedSlotSize = CalendarService.adjustSlotSize(items, slotSize);
                    adjustedSlotSize !== slotSize && toNotify && toastr.warning('Chosen slot size does not fit model', 'Error');
                    scope.slotSize = adjustedSlotSize;
                } else {
                    scope.slotSize = slotSize;
                }

                return scope.slotSize;
            };

            scope.hideItems = [];

            const waitItems = scope.$watch('calendarRowCtrlList[0].$scope.items', (items) => {
                scope.setSlotSize(scope.slotSize, false);
            });

            scope.$watch('mbTableConf', (mbTableConf: MbTable) => {
                const rowLength = mbTableConf && mbTableConf.rows.length || 0;
                const _hideItems = new Array(rowLength);
                for (let i = 0; i < rowLength; ++i) {
                    _hideItems[i] = false;
                }
                scope.hideItems = _hideItems;
            });

            scope.isAllItemsShown = () => {
                return scope.hideItems.every((hideItem) => !hideItem);
            };

            scope.toggleAllItemsHidden = () => {
                if (scope.isAllItemsShown()) {
                    scope.hideItems.forEach((hideItem, id, hideItems) => {
                        hideItems[id] = true;
                    });
                } else {
                    scope.hideItems.forEach((hideItem, id, hideItems) => {
                        hideItems[id] = false;
                    });
                }
            };

            scope.rowTypes = [JbRowType.therapists, JbRowType.rooms];
            scope.displayRowType = (rt: number) => JbRowType[rt];
            scope.isMatchingBoardViewMode = (mode: string) => $state.is('auth.matchingBoard.table.' + mode); // MatchingBoardViewMode

            scope.onEdit = (item: IRowCalItem, $event, force = false): Promise<IRowCalItem> => {
                const preEvent: PreliminaryEvent = angular.copy(item.model);
                const dialogConf: IDialogConcreteEventConf = {
                    targetEvent: $event,
                    canEdit: true,
                    canRemove: false,
                    services: MatchingBoardController.services,
                    categories: MatchingBoardController.categories,
                    rooms: MatchingBoardController._tableRooms,
                    therapists: MatchingBoardController._tableTherapists,
                    clients: MatchingBoardController.clients,
                    sessions: MatchingBoardController.sessions,
                    restrictions: MatchingBoardController.restrictions,
                };
                return DialogService.dialogPreliminaryEvent(preEvent, dialogConf)
                    .then(res => onEditDialog(item, $event, res));
            };

            scope.onDrop = (item: IRowCalItem, bgItems: IRowCalItem[], items: IRowCalItem[], force = false): Promise<IRowCalItem> => {
                return $q(resolve => resolve(item))
                    .then(item => checkItemValid(item))
                    .then((item: IRowCalItem) => putPreliminaryEvent(item, null, force));
            };

            function onEditDialog(item: IRowCalItem, $event, res: IDialogPreliminaryEventRes): Promise<IRowCalItem> {
                const preEvent: PreliminaryEvent = res.baseConcreteEvent;

                if (preEvent) {// edited
                    updateItemFromModel(item, preEvent);

                    return $q(resolve => resolve(item))
                        .then(item => checkItemValid(item))
                        .then(
                            (item: IRowCalItem) => putPreliminaryEvent(item, $event, false),
                            () => scope.onEdit(item, $event),
                        );

                } else { // removed
                    toastr.info('You can\'t remove item on Matching Board');
                    return $q.reject();
                }

            }

            function handleEditCrossing(item: IRowCalItem, $event, err) {
                return handleErrorCrossing(err.data as CrossingData, item, $event)
                    .then((force: boolean) => {
                        if (force) {
                            return putPreliminaryEvent(item, $event, true);
                        } else {
                            return scope.onEdit(item, $event, false);
                        }
                    });
            }

            function handleErrorCrossing(crossingData: CrossingData, item: IRowCalItem, $event): Promise<boolean> {
                const dataArr: CrossingData[] = [crossingData];
                const useForce = shouldUseForce(dataArr);
                const dialogConf: IDialogCrossingDataConf = {
                    targetEvent: $event,
                    useConfirmBtn: useForce,
                    useEditBtn: true,
                };
                return DialogService.dialogCrossingData(dataArr, dialogConf);
            }

            function updateAndReturn(returnedItem: IRowCalItem, toastrMessage: string): Promise<IRowCalItem> {
                return updateEvents()
                    .then(() => {
                        toastr.info(toastrMessage);
                        return returnedItem;
                    });
            }

            function handleResponseCrossing(crossingData: CrossingData, item: IRowCalItem, $event): Promise<IRowCalItem> | IRowCalItem {
                return item;
            }

            function updateEvents(): Promise<any> {
                return MatchingBoardController.updateMatchingData();
            }

            function updateItemFromModel(item: IRowCalItem, preEvent: PreliminaryEvent) {
                item.model = preEvent;

                item.timeStart = Utils.strTimeToMinutes(preEvent.time);

                const d: CompositeTime = preEvent.duration;
                const duration: number = d.prep + d.processing + d.clean;
                item.timeEnd = item.timeStart + duration;

                const mbTableConf: MbTable = scope.mbTableConf;

                if (scope.isMatchingBoardViewMode('daily')) {
                    const columnKey = scope.rowType === JbRowType.rooms /*columnType = therapist*/
                        ? (preEvent.therapist && preEvent.therapist.id)
                        : (preEvent.room && preEvent.room.id);
                    item.column = _.find(mbTableConf.columns, (c: IRowCalColumn) => c.columnKey === columnKey);
                } else {
                    const date = preEvent.date;
                    item.column = _.find(mbTableConf.columns, (c: IRowCalColumn) => c.columnKey === date);
                }
            }

            function isItemOnBoard(dataItem: PreliminaryEvent): boolean {
                const eventMoment: Moment = moment(dataItem.date, dateFormat);

                if (scope.isMatchingBoardViewMode('daily')) {
                    const date: Moment = moment($parent.date);
                    return eventMoment.isSame(date);
                } else if (scope.isMatchingBoardViewMode('weekly')) {
                    const week: Moment = moment($parent.week);
                    const from: Moment = moment(week).day(0);
                    const to: Moment = moment(week).day(6);
                    return eventMoment.isSameOrBefore(to) && eventMoment.isSameOrAfter(from);
                } else if (scope.isMatchingBoardViewMode('interval')) {
                    const from: Moment = moment($parent.fromDate);
                    const to: Moment = moment($parent.toDate);
                    return eventMoment.isSameOrBefore(to) && eventMoment.isSameOrAfter(from);
                } else {
                    throw new Error('Unhandled state');
                }
            }

            function checkItemValid(item: IRowCalItem): Promise<any> | IRowCalItem {
                return ValidationService.checkItemValid(item, allServices, allRestrictions, allCategories, allRooms);
            }

            function putPreliminaryEvent(item: IRowCalItem, $event, force: boolean) {
                const model: PreliminaryEvent = item.model;
                return ApiMatchingBoardService.putService(model.session.id, model.client.id, model.service.id, model, force)
                    .then(
                        (crossingData: CrossingData) => handleResponseCrossing(crossingData, item, null),
                        (err) => handleEditCrossing(item, $event, err),
                    )
                    .then(
                        (item: IRowCalItem) => updateAndReturn(item, 'Preliminary event updated successfully'),
                    )
                    .then(
                        (item: IRowCalItem) => {
                            const event: PreliminaryEvent = item.model;
                            return isItemOnBoard(event)
                                ? item
                                : null; // to remove view
                        },
                    );
            }

            function shouldUseForce(crossingDataArr: CrossingData[]): boolean {
                const hist: Collection<number> = Utils.calculateCrossingHistogram(crossingDataArr);
                if (hist[CrossingDataType.calendar] || hist[CrossingDataType.concrete]) {
                    return false;
                } else {
                    return !!hist[CrossingDataType.unavailable];
                }
            }

        },
    };
}


