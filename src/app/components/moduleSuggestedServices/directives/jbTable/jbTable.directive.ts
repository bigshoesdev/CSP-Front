import {LocalStorageService} from '../../../../services/storage/local-storage.service';
import {PreliminaryEvent} from '../../../../model/rest/PreliminaryEvent';
import {JbRowType} from '../../../../model/JbRowType';
import {EntityDependencyService} from '../../../../services/entity-dependency.service';
import {JuggleBoardService} from '../../services/juggleBoard.service';

export interface JtTable {
    columns: string[];
    rows: JtRow[];
}

export interface JtRow {
    rowName: string;
    cells: JtCell[];
}

export interface JtCell {
    subHeader: JtSubHeader;
    listItems: PreliminaryEvent[];
}

export interface JtSubHeader {
    freeTime: number;
    busyTime: number;
    preEventsDuration: number; // preliminary events duration
    preFreeTime: number;
}


/** @ngInject */
export function jbTable(LocalStorageService: LocalStorageService, $timeout: ng.ITimeoutService, _, $state: ng.ui.IStateService, JuggleBoardService: JuggleBoardService, EntityDependencyService: EntityDependencyService) {

    return {
        restrict: 'A',
        templateUrl: 'app/components/moduleSuggestedServices/directives/jbTable/jbTable.html',
        scope: {
            table: '=jbTable', // JtTable
            rowType: '=jbRowType',
            showItem: '=jbShowItem', // (item: PreliminaryEvent) => string[]
            onDropPre: '=?jbOnDropPre', // Return false here to cancel drop. Return true if you insert the item yourself.
            onDropPost: '=jbOnDropPost',
            session: '=jbSession',
            client: '=jbClient',
        },
        link: (scope, iElement, iAttrs) => {
            if (!scope.onDropPre) {
                scope.onDropPre = (item) => item;
            }

            scope.hideItems = [];

            scope.$watch('table', (table: JtTable) => {
                scope.hideItems = table.rows.map(() => false);
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
            scope.rowType = LocalStorageService.getItem('moduleSuggestedServices.rowType');
            scope.displayRowType = (rt) => JbRowType[rt];
            scope.isRowTherapist = () => scope.rowType === JbRowType.therapists;
            scope.applyRowType = applyRowType;

            function applyRowType(rowType: JbRowType) {
                LocalStorageService.setItem('moduleSuggestedServices.rowType', rowType);
            }


            scope.hideHeaderInfo = LocalStorageService.getItem('moduleSuggestedServices.hideHeaderInfo');
            scope.onChangeHideHeaderInfo = () => {
                LocalStorageService.setItem('moduleSuggestedServices.hideHeaderInfo', scope.hideHeaderInfo);
            };


            scope.onDrop = (listItems: PreliminaryEvent[], item: PreliminaryEvent) => {

                if (EntityDependencyService.findClientServiceDataItem(listItems, item)) {
                    return false;
                }

                $timeout(() => {
                    // Use $timeout to process the function in next digest, when table will have been updated.
                    scope.onDropPost(item);
                }, 600);
                return scope.onDropPre(item); // Return false here to cancel drop. Return true if you insert the item yourself.
            };
            scope.onMoved = (listItems: PreliminaryEvent[], item: PreliminaryEvent, $index) => {
                listItems.splice($index, 1);
            };


            scope.editItem = (item: PreliminaryEvent) => {
                $state.go('auth.suggestedServices.edit', {
                    session: item.session,
                    client: item.client,
                    service: item.service,
                });
            };

        },
    };

}
