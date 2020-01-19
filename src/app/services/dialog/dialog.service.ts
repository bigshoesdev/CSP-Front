import {dateFormat} from '../app.constant';
import {DialogConcreteEventController} from './dialogConcreteEvent/dialogConcreteEvent.controller';
import {DialogConcreteCalendarEventController} from './dialogConcreteCalendarEvent/dialogConcreteCalendarEvent.controller';
import {DialogAvailabilityTimeRecordController} from './dialogAvailabilityTimeRecord/dialogAvailabilityTimeRecord.controller';
import {DialogTherapistWeekController} from './dialogTherapistWeek/dialogTherapistWeek.controller';
import {Room} from '../../model/rest/Room';
import {Client} from '../../model/rest/Client';
import {Therapist} from '../../model/rest/Therapist';
import {Service} from '../../model/rest/Service';
import {Session} from '../../model/rest/Session';
import {Restriction} from '../../model/rest/Restriction';
import {CrossingData} from '../../model/rest/CrossingData';
import {AvailabilityTherapistDayRecord} from '../../model/rest/AvailabilityTherapistDayRecord';
import {ConcreteCalendarEvent} from '../../model/rest/ConcreteCalendarEvent';
import {Event} from '../../model/rest/Event';
import {BaseConcreteEvent} from '../../model/rest/BaseConcreteEvent';
import {CalendarMode_Ns} from '../../model/CalendarMode';
import {ConcreteEvent} from '../../model/rest/ConcreteEvent';
import {ServiceCategory} from '../../model/rest/ServiceCategory';
import {PreliminaryEvent} from '../../model/rest/PreliminaryEvent';
import CalendarModeEnum = CalendarMode_Ns.CalendarMode;
import {EstimateEventsSelectController} from './dialogEstimateEventsSelect/estimateEventsSelect.controller';

declare let angular: any;

export interface IMdDialogPreset {
    title?: string; // - Sets the alert title.
    textContent?: string; // - Sets the alert message.
    htmlContent?: string; // - Sets the alert message as HTML. Requires ngSanitize module to be loaded. HTML is not run through Angular's compiler.
    placeholder?: string; // - Sets the placeholder text for the input.
    ok?: string; // - Sets the alert "Okay" button text.
    cancel?: string; // - Sets the confirm "Cancel" button text.
    theme?: string; // - Sets the theme of the alert dialog.
    targetEvent?: any; // DOMClickEvent - A click's event object. When passed in as an option, the location of the click will be used as the starting point for the opening animation of the the dialog.
}

export interface IDialogInputConf {
    title: string;
    textContent: string;
    inputLabel: string;
    inputText: string;
    btnCancel: string;
    btnHide: string;
    targetEvent: any;
}

export interface IDialogCheckboxConf {
    title: string;
    textContent: string;
    checkboxLabel: string;
    checkboxValue: boolean;
    btnCancel: string;
    btnHide: string;
    targetEvent?: any;
}

export interface IDialogCheckboxListConf {
    title: string;
    textContent: string;
    checkboxLabels: string[];
    checkboxValues: boolean[];
    btnCancel: string;
    btnHide: string;
    targetEvent?: any;
}

export interface IDialogConcreteCalendarEventConf {
    isReadOnly?: boolean;
    targetEvent?: any;
    canRemove: boolean;
}

export interface IDialogConcreteEventConf {
    targetEvent: any;
    canEdit: boolean;
    canRemove: boolean;
    canCancel?: boolean;
    events?: Event[];
    services: Service[];
    categories: ServiceCategory[];
    rooms: Room[];
    therapists: Therapist[];
    clients: Client[];
    sessions: Session[];
    restrictions: Restriction[];
    subStatuses?: string[];
}

export interface IDialogEstimateEventsSelectConf extends IDialogEstimateEventsSelectRes {
    targetEvent?: any;
    sessions: Session[];
    clients: Client[];
}

export interface IDialogEstimateEventsSelectRes {
    session: Session;
    client: Client;
    fromDate: Date;
    toDate: Date;
    selectedStates: string[];
}

export interface IDialogConcreteEventRes {
    baseConcreteEvent: ConcreteEvent;
    noEmails: boolean;
}

export interface IDialogPreliminaryEventRes {
    baseConcreteEvent: PreliminaryEvent;
}

export interface IDialogCrossingDataConf {
    targetEvent: any;
    useConfirmBtn?: boolean;
    useEditBtn?: boolean;
}

export class DialogService {

    /** @ngInject */
    constructor(private $mdDialog,
                private moment) {
    }

    dialogAlert(preset: IMdDialogPreset) {
        return this.$mdDialog.show(this.$mdDialog.alert(preset));
    }

    dialogConfirm(preset: IMdDialogPreset) {
        return this.$mdDialog.show(this.$mdDialog.confirm(preset));
    }

    dialogCrossingData(crossingDataArr: CrossingData[], dialogConf: IDialogCrossingDataConf): Promise<boolean> {

        return this.$mdDialog.show({
            clickOutsideToClose: true,
            controller: ['$mdDialog', '$scope', ($mdDialog, $scope) => {
                $scope.crossingDataArr = crossingDataArr;
                $scope.dialogConf = dialogConf;

                $scope.showDate = (date: string) => {
                    return this.moment(date, dateFormat).format('MMM D');
                };

                $scope.showClients = (clients: Client[]) => {
                    return clients && clients.map((client: Client) => client.name).join(', ');
                };

                $scope.cancel = () => {
                    $mdDialog.cancel();
                };

                $scope.backToEdit = () => {
                    $mdDialog.hide(false);
                };

                $scope.doAnyway = () => {
                    $mdDialog.hide(true);
                };
            }],
            controllerAs: 'ctrl',
            templateUrl: 'app/services/dialog/templates/dialogCrossingData.html',
            targetEvent: dialogConf.targetEvent,
        });
    }

    dialogInput(conf: IDialogInputConf) {
        return this.$mdDialog.show({
            clickOutsideToClose: true,
            controller: ['$mdDialog', '$scope', ($mdDialog, $scope) => {
                $scope.conf = conf;
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };
                $scope.hide = function () {
                    $mdDialog.hide($scope.conf);
                };
            }],
            controllerAs: 'ctrl',
            templateUrl: 'app/services/dialog/templates/dialogInput.html',
            targetEvent: conf.targetEvent,
        });
    }

    dialogCheckbox(conf: IDialogCheckboxConf) {
        return this.$mdDialog.show({
            clickOutsideToClose: true,
            controller: ['$mdDialog', '$scope', ($mdDialog, $scope) => {
                $scope.conf = conf;
                $scope.cancel = () => {
                    $mdDialog.cancel();
                };
                $scope.hide = () => {
                    $mdDialog.hide($scope.conf);
                };
            }],
            controllerAs: 'ctrl',
            templateUrl: 'app/services/dialog/templates/dialogCheckbox.html',
            targetEvent: conf.targetEvent,
        });
    }

    dialogCheckboxList(conf: IDialogCheckboxListConf) {
        return this.$mdDialog.show({
            clickOutsideToClose: true,
            controller: ['$mdDialog', '$scope', ($mdDialog, $scope) => {
                $scope.conf = conf;
                $scope.cancel = () => {
                    $mdDialog.cancel();
                };
                $scope.hide = () => {
                    $mdDialog.hide($scope.conf);
                };
            }],
            controllerAs: 'ctrl',
            templateUrl: 'app/services/dialog/templates/dialogCheckboxList.html',
            targetEvent: conf.targetEvent,
        });
    }

    dialogAvailabilityTimeRecord(dayRecord: AvailabilityTherapistDayRecord,
                                 targetEvent,
                                 isEdit = true,
                                 calendarMode: CalendarModeEnum = CalendarModeEnum.dates): Promise<AvailabilityTherapistDayRecord> {

        return this.$mdDialog.show({
            clickOutsideToClose: true,
            locals: {
                dayRecord: dayRecord,
                isEdit: isEdit,
                calendarMode: calendarMode,
            },
            controller: DialogAvailabilityTimeRecordController,
            controllerAs: 'ctrl',
            templateUrl: 'app/services/dialog/dialogAvailabilityTimeRecord/dialogAvailabilityTimeRecord.html',
            targetEvent: targetEvent,
        });
    }

    dialogConcreteCalendarEvent(concreteCalendarEvent: ConcreteCalendarEvent,
                                dialogConf: IDialogConcreteCalendarEventConf): Promise<ConcreteCalendarEvent> {


        return this.$mdDialog.show({
            clickOutsideToClose: true,
            locals: {
                concreteCalendarEvent: concreteCalendarEvent,
                dialogConf: dialogConf,
            },
            controller: DialogConcreteCalendarEventController,
            controllerAs: 'ctrl',
            templateUrl: 'app/services/dialog/dialogConcreteCalendarEvent/dialogConcreteCalendarEvent.html',
            targetEvent: dialogConf.targetEvent,
        });
    }

    /**
     * @param customColumn instance of HtCustomColumn or HsCustomColumn or SsCustomColumn
     * @param targetEvent
     */
    customizeSelectorValues(customColumn, targetEvent) {

        return this.$mdDialog.show({
            clickOutsideToClose: true,
            controller: ['$mdDialog', '$scope', ($mdDialog, $scope) => {
                $scope.values = angular.copy(customColumn.values).sort((a, b) => a.position - b.position);

                $scope.sortableOptions = {
                    stop: (e, ui) => {
                        $scope.values.forEach((value, columnPosition) => {
                            value.position = columnPosition;
                        });
                    },
                };

                $scope.remove = (value, position) => {
                    $scope.values = $scope.values.filter((val, pos) => val !== value);
                };

                $scope.newValue = null;
                $scope.addNew = () => {
                    $scope.newValue = {
                        title: '',
                        value: 0,
                        position: $scope.values.length,
                    };
                };

                $scope.onNewValueAdd = (newValue) => {
                    if (newValue.title && newValue.value) {
                        $scope.values.push(newValue);
                        $scope.newValue = null;
                    }
                };

                $scope.cancel = () => {
                    $mdDialog.cancel();
                };

                $scope.hide = () => {
                    $mdDialog.hide($scope.values);
                };
            }],
            controllerAs: 'ctrl',
            templateUrl: 'app/services/dialog/templates/customizeSelectorValues.html',
            targetEvent: targetEvent,
        });
    }

    dialogConcreteEvent(baseConcreteEvent: BaseConcreteEvent, dialogConf: IDialogConcreteEventConf): Promise<IDialogConcreteEventRes> {
        return this.$mdDialog.show({
            clickOutsideToClose: true,
            locals: {
                baseConcreteEvent: baseConcreteEvent,
                dialogConf: dialogConf,
            },
            controller: DialogConcreteEventController,
            controllerAs: 'ctrl',
            templateUrl: 'app/services/dialog/dialogConcreteEvent/dialogConcreteEvent.html',
            targetEvent: dialogConf.targetEvent,
        });
    }

    dialogTherapistWeek(): Promise<IDialogConcreteEventRes> {
        return this.$mdDialog.show({
            clickOutsideToClose: true,
            locals: {
            },
            controller: DialogTherapistWeekController,
            controllerAs: 'ctrl',
            templateUrl: 'app/services/dialog/dialogTherapistWeek/dialogTherapistWeek.html',
        });
    }

    dialogPreliminaryEvent(baseConcreteEvent: BaseConcreteEvent, dialogConf: IDialogConcreteEventConf): Promise<IDialogPreliminaryEventRes> {
        return this.$mdDialog.show({
            clickOutsideToClose: true,
            locals: {
                baseConcreteEvent: baseConcreteEvent,
                dialogConf: dialogConf,
            },
            controller: DialogConcreteEventController,
            controllerAs: 'ctrl',
            templateUrl: 'app/services/dialog/dialogConcreteEvent/dialogPreliminaryEvent.html',
            targetEvent: dialogConf.targetEvent,
        });
    }


    dialogEstimateEventsSelect(dialogConf: IDialogEstimateEventsSelectConf): Promise<any> {
        return this.$mdDialog.show({
            clickOutsideToClose: true,
            locals: {
                dialogConf: dialogConf,
            },
            controller: EstimateEventsSelectController,
            controllerAs: 'ctrl',
            templateUrl: 'app/services/dialog/dialogEstimateEventsSelect/estimateEventsSelect.html',
            targetEvent: dialogConf.targetEvent,
        });
    }
}
