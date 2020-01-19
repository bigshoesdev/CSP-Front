'use strict';
import * as _ from 'lodash';
import * as $ from 'jquery';

import {config} from './index.config';
import {routerConfig} from './index.route';
import {runBlock} from './index.run';
import {AuthInterceptor} from './services/auth.interceptor';
import {RestangularMockup} from './services/restangular-mock.factory';
import {AuthService} from './services/auth.service';
import {Utils} from './services/utils.service';
import {DialogService} from './services/dialog/dialog.service';
import {ModulesSelectorConf, RightSidebarConfig, Sidebars} from './services/app.constant';
import {UnsavedChanges} from './services/unsaved-changes.factory';
import {StateStack} from './services/state-stack.service';
import {DashboardInfoController} from './components/dashboardInfo/dashboardInfo.controller';
import {DashboardController} from './components/dashboard/dashboard.controller';
import {LoginController} from './components/moduleAnonymous/login/login.controller';
import {SidebarController} from './directives/sidebar/sidebar.controller';
import {UserListController} from './components/moduleAuth/user/userList.controller';
import {UserController} from './components/moduleAuth/user/user.controller';
import {ForgotPasswordController} from './components/moduleAnonymous/password/forgotPassword.controller';
import {ChangePasswordController} from './components/moduleCommon/password/changePassword.controller';
import {CategoryListController} from './components/moduleSettings/components/categoryList/categoryList.controller';
import {CategoryController} from './components/moduleSettings/components/category/category.controller';
import {RestorePasswordController} from './components/moduleAnonymous/password/restorePassword.controller';
import {ServiceListController} from './components/moduleSettings/components/serviceList/serviceList.controller';
import {ServiceController} from './components/moduleSettings/components/service/service.controller';
import {UncategorizedServiceListController} from './components/moduleSettings/components/uncategorizedServiceList/uncategorizedServiceList.controller';
import {TherapistListController} from './components/moduleSettings/components/therapistList/therapistList.controller';
import {UnassignedTherapistListController} from './components/moduleSettings/components/therapistList/unassignedTherapistList.controller';
import {TherapistController} from './components/moduleSettings/components/therapist/therapist.controller';
import {TherapistWeekListController} from './components/moduleBooking/therapistWeekList/therapistWeekList.controller';
import {TherapistWeekController} from './components/moduleBooking/therapistWeek/therapistWeek.controller';
import {ClientListController} from './components/moduleSettings/components/clientList/clientList.controller';
import {ClientController} from './components/moduleSettings/components/client/client.controller';
import {TaxesListController} from './components/moduleSettings/components/taxesList/taxesList.controller';
import {TaxesController} from './components/moduleSettings/components/taxes/taxes.controller';
import {RoomListController} from './components/moduleSettings/components/roomList/roomList.controller';
import {RoomController} from './components/moduleSettings/components/room/room.controller';
import {EquipmentListController} from './components/moduleSettings/components/equipmentList/equipmentList.controller';
import {EquipmentController} from './components/moduleSettings/components/equipment/equipment.controller';
import {RestrictionListController} from './components/moduleSettings/components/restrictionList/restrictionList.controller';
import {RestrictionController} from './components/moduleSettings/components/restriction/restriction.controller';
import {RemoteServerController} from './components/moduleSettings/components/remoteServer/remoteServer.controller';
import {SessionListController} from './components/moduleSessions/components/sessionList/sessionList.controller';
import {ArchiveSessionListController} from './components/moduleSessions/components/sessionList/archiveSessionList.controller';
import {SessionController} from './components/moduleSessions/components/session/session.controller';
import {SessionViewController} from './components/moduleSessions/components/sessionView/sessionView.controller';
import {RequestListController} from './components/moduleAvailability/components/requestList/requestList.controller';
import {RequestController} from './components/moduleAvailability/components/request/request.controller';
import {ReportController} from './components/moduleReports/components/report/report.controller';
import {ReportTableController} from './components/moduleReports/components/reportTable/reportTable.controller';
import {reportExpandList} from './components/moduleReports/directives/reportExpandList/reportExpandList.directive';
import {ReportListController} from './components/moduleReports/components/reportList.controller';
import {AvailabilityTherapistController} from './components/moduleAvailability/components/availabilityTherapist/availabilityTherapist.controller';
import {FindAvailabilityTherapistHistoryController} from './components/moduleAvailability/components/findAvailabilityTherapistHistory/findAvailabilityTherapistHistory.controller';
import {AvailabilityTherapistHistoryController} from './components/moduleAvailability/components/availabilityTherapistHistory/availabilityTherapistHistory.controller';
import {CalendarEventListController} from './components/moduleEvents/components/calendarEventList/calendarEventList.controller';
import {CalendarEventController} from './components/moduleEvents/components/calendarEvent/calendarEvent.controller';
import {EventController} from './components/moduleSettings/components/event/event.controller';
import {EventListController} from './components/moduleSettings/components/eventList/eventList.controller';
import {EventTypesController} from './components/moduleSettings/components/eventTypes/eventTypes.controller';
import {EventTypesListController} from './components/moduleSettings/components/eventTypesList/eventTypesList.controller';
import {WeekSelectorController} from './directives/weekSelector/weekSelector.controller';
import {MyAvailabilityController} from './components/moduleTherapist/components/myAvailability/myAvailability.controller';
import {AvailabilityTherapistCalendarController} from './components/moduleAvailability/components/availabilityTherapistCalendar/availabilityTherapistCalendar.controller';
import {NoaccountTherapistListController} from './components/moduleSettings/components/noaccountTherapistList/noaccountTherapistList.controller';
import {MailListController} from './components/moduleSettings/components/mailList/mailList.controller';
import {mailTable} from './components/moduleSettings/components/mailList/directives/mailTable/mailTable.directive';
import {MyRequestListController} from './components/moduleTherapist/components/myRequestList/myRequestList.controller';
import {MyRequestController} from './components/moduleTherapist/components/myRequest/myRequest.controller';
import {AvailabilityCalendarController} from './directives/calendar/availabilityCalendar.controller';
import {EventCalendarController} from './directives/calendar/eventCalendar.controller';
import {ConcreteCalendarEventCalendarController} from './components/moduleEvents/components/concreteCalendarEventCalendar/concreteCalendarEventCalendar.controller';
import {SessionClientsController} from './components/moduleHealthProfile/components/sessionClients/sessionClients.controller';
import {cspModuleSelector} from './directives/cspModuleSelector/cspModuleSelector.directive';
import {repeatPassword} from './directives/repeatPassword.directive';
import {renderAs} from './directives/renderAs.directive';
import {renderStatus} from './directives/render/renderStatus.directive';
import {renderBody} from './directives/render/renderBody.directive';
import {list} from './directives/list/list.directive';
import {renderNames} from './directives/render/renderNames.directive';
import {rightSidebar} from './directives/sidebar/rightSidebar.directive';
import {renderCheckService} from './directives/render/renderCheckService.directive';
import {selector} from './directives/selectors/selector/selector.directive';
import {mdHeader} from './directives/mdHeader/mdHeader.directive';
import {renderRect} from './directives/renderRect/renderRect.directive';
import {listSelector} from './directives/selectors/listSelector/listSelector.directive';
import {animateOnChange} from './directives/animateOnChange/animateOnChange.directive';
import {eventSelector} from './directives/selectors/eventSelector/eventSelector.directive';
import {chipsSelector} from './directives/selectors/chipsSelector/chipsSelector.directive';
import {chipsStringSelector} from './directives/selectors/chipsStringSelector/chipsStringSelector.directive';
import {objectsSelector} from './directives/selectors/objectsSelector/objectsSelector.directive';
import {autocompleteList} from './directives/autocompleteList/autocompleteList.directive';
import {simpleList} from './directives/simpleList.directive';
import {mdSticky} from './directives/mdSticky.directive';
import {renderTherapistsRequests} from './directives/render/renderTherapistsRequests.directive';
import {weekSelector} from './directives/weekSelector/weekSelector.directive';
import {cspUserMenu} from './directives/cspUserMenu/cspUserMenu.directive';
import {cspHeader} from './directives/cspHeader/cspHeader.directive';
import {contentHeader} from './directives/contentHeader/contentHeader.directive';
import {inlineWeekSelector} from './directives/weekSelector/inlineWeekSelector.directive';
import {calendarGridMode} from './directives/calendar/menu/calendarGridMode.directive';
import {calendarSlotSize} from './directives/calendar/menu/calendarSlotSize.directive';
import {renderCheckItem} from './directives/render/renderCheckItem.directive';
import {availabilityCalendar, bimodelEventCalendar, eventCalendar} from './directives/calendar/calendar.directive';
import {healthTable} from './components/moduleHealthProfile/directives/healthTable/healthTable.directive';
import {htCell} from './components/moduleHealthProfile/directives/htCell/htCell.directive';
import {ScEditCustomColumnsController} from './components/moduleHealthProfile/components/baseEditCustomColumns/scEditCustomColumns.controller';
import {ScEditColumnsController} from './components/moduleHealthProfile/components/baseEditColumns/scEditColumns.controller';
import {HealthSectionsController} from './components/moduleHealthProfile/components/healthSections/healthSections.controller';
import {healthSectionTable} from './components/moduleHealthProfile/directives/healthSectionTable/healthSectionTable.directive';
import {hsCell} from './components/moduleHealthProfile/directives/hsCell/hsCell.directive';
import {HsEditColumnsController} from './components/moduleHealthProfile/components/baseEditColumns/hsEditColumns.controller';
import {HsEditCustomColumnsController} from './components/moduleHealthProfile/components/baseEditCustomColumns/hsEditCustomColumns.controller';
import {HsEditCustomValuesController} from './components/moduleHealthProfile/components/hsEditBaseValues/hsEditCustomValues.controller';
import {HsEditConditionController} from './components/moduleHealthProfile/components/hsEditCondition/hsEditCondition.controller';
import {HsEditFlagController} from './components/moduleHealthProfile/components/hsEditFlag/hsEditFlag.controller';
import {HsEditSelectValuesController} from './components/moduleHealthProfile/components/hsEditBaseValues/hsEditSelectValues.controller';
import {SuggestedServicesController} from './components/moduleSuggestedServices/components/suggestedServices/suggestedServices.controller';
import {suggestedServicesTable} from './components/moduleSuggestedServices/directives/suggestedServicesTable/suggestedServicesTable.directive';
import {SsEditColumnsController} from './components/moduleHealthProfile/components/baseEditColumns/ssEditColumns.controller';
import {SsEditCustomColumnsController} from './components/moduleHealthProfile/components/baseEditCustomColumns/ssEditCustomColumns.controller';
import {SuggestedServiceController} from './components/moduleSuggestedServices/components/suggestedService/suggestedService.controller';
import {JuggleBoardController} from './components/moduleSuggestedServices/components/juggleBoard/juggleBoard.controller';
import {JbDateController} from './components/moduleSuggestedServices/components/juggleBoard/tabs/jbDate/jbDate.controller';
import {JbDatesIntervalController} from './components/moduleSuggestedServices/components/juggleBoard/tabs/jbDates/jbDatesInterval.controller';
import {JbDatesWeekController} from './components/moduleSuggestedServices/components/juggleBoard/tabs/jbDates/jbDatesWeek.controller';
import {dndlDraggable, dndlHandle, dndlList, dndlNodrag} from './directives/dndLists/dndLists.directive';
import {jbTable} from './components/moduleSuggestedServices/directives/jbTable/jbTable.directive';
import {JuggleBoardService} from './components/moduleSuggestedServices/services/juggleBoard.service';
import {JbDialogService} from './components/moduleSuggestedServices/services/jbDialog.service';
import {MatchingBoardController} from './components/moduleMatchingBoard/components/matchingBoard/matchingBoard.controller';
import {MbDateController} from './components/moduleMatchingBoard/components/mbDate/mbDate.controller';
import {MbDatesWeekController} from './components/moduleMatchingBoard/components/mbDatesWeek/mbDatesWeek.controller';
import {MbDatesIntervalController} from './components/moduleMatchingBoard/components/mbDatesInterval/mbDatesInterval.controller';
import {MbCellController} from './directives/calendarMatchingBoard/mbCell.controller';
import {mbCell} from './directives/calendarMatchingBoard/mbCell.directive';
import {mbTable} from './components/moduleMatchingBoard/components/mbTable/mbTable.directive';
import {changeSizeHover} from './directives/changeSize/changeSize.directive';
import {SourceDropmodelStorage} from './services/source-dropmodel-storage.service';
import {CalendarService} from './services/calendar.service';
import {
    calendarRowConcreteEvents,
    calendarRowMbDate,
    calendarRowMbDates
} from './directives/calendarRow/calendarRow.directive';
import {MatchingBoardService} from './components/moduleMatchingBoard/services/matchingBoard.service';
import {MatchingBoardViewConfirmationController} from './components/moduleAnonymous/matchingBoard/matchingBoardViewConfirmation.controller';
import {DefaultAvailabilityService} from './components/moduleAvailability/services/defaultAvailability.service';
import {defaultAvailability} from './components/moduleAvailability/components/defaultAvailability/defaultAvailability.directive';
import {MbConfirmationListController} from './components/moduleMatchingBoard/components/mbConfirmationList/mbConfirmationList.controller';
import {MbConfirmationController} from './components/moduleMatchingBoard/components/mbConfirmation/mbConfirmation.controller';
import {WebSocketService} from './services/websocket.service';
import {EventsController} from './components/moduleBooking/events.controller';
import {dateNav} from './directives/dateNav/dateNav.directory';
import {EntityDependencyService} from './services/entity-dependency.service';
import {menuButton} from './directives/menuButton/menuButton.directive';
import {leftMenu} from './directives/leftMenu/leftMenu.directive';
import {SidebarService} from './directives/sidebar/sidebar.service';
import {BookingEventConfirmationController} from './components/moduleAnonymous/booking/bookingEventConfirmation.controller';
import {WelcomeController} from './components/welcome.controller';
import {MyEventsController} from './components/moduleTherapist/components/myEvents/myEvents.controller';
import {BimodelEventCalendarController} from './directives/calendar/bimodelEventCalendar.controller';
import {AvailabilityTherapistHistoryRecordController} from './components/moduleAvailability/components/availabilityTherapistHistoryRecord/availabilityTherapistHistoryRecord.controller';
import {LocalStorageService} from './services/storage/local-storage.service';
import {authRouterConfig} from './components/moduleAuth/auth.route';
import {anonymousRouterConfig} from './components/moduleAnonymous/anonymous.route';
import {settingsRouterConfig} from './components/moduleSettings/settings.route';
import {sessionsRouterConfig} from './components/moduleSessions/session.route';
import {eventsRouterConfig} from './components/moduleEvents/events.route';
import {therapistRouterConfig} from './components/moduleTherapist/therapist.route';
import {healthProfileRouterConfig} from './components/moduleHealthProfile/healthProfile.route';
import {suggestedServicesRouterConfig} from './components/moduleSuggestedServices/suggestedServices.route';
import {matchingBoardRouterConfig} from './components/moduleMatchingBoard/matchingBoard.route';
import {bookingRouterConfig} from './components/moduleBooking/booking.route';
import {availabilityRouterConfig} from './components/moduleAvailability/availability.route';
import {reportsRouterConfig} from './components/moduleReports/reports.route';
import {ReconcileController} from './components/moduleEstimate/components/reconcile/reconcile.controller';
import {StorageService} from './services/storage/storage.service';
import {DataCacheService} from './services/storage/data-cache.service';
import {ApiSettingsService} from './services/api/api-settings.service';
import {ApiInjectableBaseService} from './services/api/api-injectable-base.service';
import {CountriesRegions} from './services/countries-regions.service';
import {ApiHealthTableService} from './services/api/api-health-table.service';
import {ApiSuggestedServicesService} from './services/api/api-suggested-services.service';
import {ApiMatchingBoardService} from './services/api/api-matching-board.service';
import {ApiCalendarEventsService} from './services/api/api-calendar-events.service';
import {ApiBookingService} from './services/api/api-booking.service';
import {ApiReportsService} from './services/api/api-reports.service';
import {ApiAvailabilityTherapistService} from './services/api/api-availability-therapist.service';
import {ValidationService} from './services/validation.service';
import {ApiReconcileService} from './services/api/api-reconcile.service';
import {suggestedForm} from './components/moduleSuggestedServices/directives/suggestedForm/suggestedForm.directive';
import {ApiEstimateService} from './services/api/api-estimate.service';
import {estimateRouterConfig} from './components/moduleEstimate/estimate.route';
import {EstimateListController} from './components/moduleEstimate/components/estimateList/estimateList.controller';
import {EstimateController} from './components/moduleEstimate/components/estimate/estimate.controller';
import {nullableSelector} from './directives/selectors/nullableSelector/nullableSelector.directive';
import {ApiServiceCategoryService} from './services/api/api-service-category.service';
import {concreteEventReconcileList} from './components/moduleEstimate/directives/concreteEventReconcileList.directive';
import {flexibleSticky} from './directives/flexible-sticky/flexible-sticky.directive';
import {flexibleStickyColumn} from './directives/flexible-sticky-column/flexible-sticky-column.directive';
import {EstimateService} from './components/moduleEstimate/services/estimate.service';
import {editorConfig} from './components/moduleSettings/components/mailList/directives/mailTable/mailEditorConfig';

declare const angular: any;
declare const moment: any;
declare const lscache: any;
declare const __env: any;

module cspFront {
    const env = _.cloneDeep(__env);

    angular.module('dndl', [])
        .directive('dndlDraggable', dndlDraggable)
        .directive('dndlList', dndlList)
        .directive('dndlNodrag', dndlNodrag)
        .directive('dndlHandle', dndlHandle);


    angular.module('cspFront', [
        'ngAnimate', 'ngCookies', 'ngSanitize', 'ngMessages', 'ngAria', 'restangular', 'ui.router', 'ng', 'ui.bootstrap',
        'toastr', 'ngMaterial', 'sticky', 'dndl', 'dnd', 'ui.sortable', 'vAccordion', 'mdColorPicker',
        'pageslide-directive', 'textAngular', 'color.picker', 'ngStorage'
    ])
        .constant('env', env)
        .constant('ang', angular)
        .constant('_', _)// allow DI for use lodash in controllers
        .constant('$', $)// allow DI for use lodash in controllers
        .constant('lscache', lscache)
        .constant('moment', moment)
        .constant('ModulesSelectorConf', ModulesSelectorConf)
        .constant('Sidebars', Sidebars)
        .constant('RightSidebarConfig', RightSidebarConfig)
        .config(config)
        .config(routerConfig)
        .config(authRouterConfig)
        .config(anonymousRouterConfig)
        .config(settingsRouterConfig)
        .config(sessionsRouterConfig)
        .config(eventsRouterConfig)
        .config(therapistRouterConfig)
        .config(healthProfileRouterConfig)
        .config(suggestedServicesRouterConfig)
        .config(matchingBoardRouterConfig)
        .config(bookingRouterConfig)
        .config(availabilityRouterConfig)
        .config(estimateRouterConfig)
        .config(reportsRouterConfig)
        .config(editorConfig)
        .run(runBlock)
        .factory('authInterceptor', AuthInterceptor)
        .factory('RestangularMockup', RestangularMockup)
        .factory('UnsavedChanges', UnsavedChanges)
        .factory('AuthService', AuthService)
        .factory('StateStack', StateStack)
        .factory('JbDialogService', JbDialogService)
        .factory('SourceDropmodelStorage', SourceDropmodelStorage)
        .factory('DefaultAvailabilityService', DefaultAvailabilityService)
        .factory('WebSocketService', WebSocketService)
        .factory('SidebarService', SidebarService)
        .service('CalendarService', CalendarService)
        .service('MatchingBoardService', MatchingBoardService)
        .service('Utils', Utils)
        .service('ValidationService', ValidationService)
        .service('DialogService', DialogService)
        .service('JuggleBoardService', JuggleBoardService)
        .service('EntityDependencyService', EntityDependencyService)
        .service('LocalStorageService', LocalStorageService)
        .service('StorageService', StorageService)
        .service('DataCacheService', DataCacheService)
        .service('ApiInjectableBaseService', ApiInjectableBaseService)
        .service('ApiSettingsService', ApiSettingsService)
        .service('ApiHealthTableService', ApiHealthTableService)
        .service('ApiSuggestedServicesService', ApiSuggestedServicesService)
        .service('ApiMatchingBoardService', ApiMatchingBoardService)
        .service('ApiCalendarEventsService', ApiCalendarEventsService)
        .service('ApiBookingService', ApiBookingService)
        .service('ApiReportsService', ApiReportsService)
        .service('ApiAvailabilityTherapistService', ApiAvailabilityTherapistService)
        .service('ApiReconcileService', ApiReconcileService)
        .service('ApiEstimateService', ApiEstimateService)
        .service('ApiServiceCategoryService', ApiServiceCategoryService)
        .service('EstimateService', EstimateService)
        .service('CountriesRegions', CountriesRegions)
        .controller('DashboardController', DashboardController)
        .controller('DashboardInfoController', DashboardInfoController)
        .controller('LoginController', LoginController)
        .controller('SidebarController', SidebarController)
        .controller('UserListController', UserListController)
        .controller('UserController', UserController)
        .controller('ForgotPasswordController', ForgotPasswordController)
        .controller('ChangePasswordController', ChangePasswordController)
        .controller('CategoryListController', CategoryListController)
        .controller('CategoryController', CategoryController)
        .controller('RestorePasswordController', RestorePasswordController)
        .controller('ServiceListController', ServiceListController)
        .controller('ServiceController', ServiceController)
        .controller('UncategorizedServiceListController', UncategorizedServiceListController)
        .controller('TherapistListController', TherapistListController)
        .controller('UnassignedTherapistListController', UnassignedTherapistListController)
        .controller('TherapistController', TherapistController)
        .controller('TherapistWeekListController', TherapistWeekListController)
        .controller('TherapistWeekController', TherapistWeekController)
        .controller('ClientListController', ClientListController)
        .controller('ClientController', ClientController)
        .controller('RoomListController', RoomListController)
        .controller('RoomController', RoomController)
        .controller('TaxesListController', TaxesListController)
        .controller('TaxesController', TaxesController)
        .controller('EquipmentListController', EquipmentListController)
        .controller('EquipmentController', EquipmentController)
        .controller('RestrictionListController', RestrictionListController)
        .controller('RestrictionController', RestrictionController)
        .controller('RemoteServerController', RemoteServerController)
        .controller('MailListController', MailListController)
        .controller('SessionListController', SessionListController)
        .controller('SessionController', SessionController)
        .controller('SessionViewController', SessionViewController)
        .controller('ArchiveSessionListController', ArchiveSessionListController)
        .controller('RequestListController', RequestListController)
        .controller('RequestController', RequestController)
        .controller('AvailabilityTherapistController', AvailabilityTherapistController)
        .controller('FindAvailabilityTherapistHistoryController', FindAvailabilityTherapistHistoryController)
        .controller('AvailabilityTherapistHistoryController', AvailabilityTherapistHistoryController)
        .controller('AvailabilityTherapistHistoryRecordController', AvailabilityTherapistHistoryRecordController)
        .controller('CalendarEventListController', CalendarEventListController)
        .controller('CalendarEventController', CalendarEventController)
        .controller('WeekSelectorController', WeekSelectorController)
        .controller('MyAvailabilityController', MyAvailabilityController)
        .controller('AvailabilityTherapistCalendarController', AvailabilityTherapistCalendarController)
        .controller('NoaccountTherapistListController', NoaccountTherapistListController)
        .controller('MyRequestListController', MyRequestListController)
        .controller('MyRequestController', MyRequestController)
        .controller('AvailabilityCalendarController', AvailabilityCalendarController)
        .controller('EventCalendarController', EventCalendarController)
        .controller('ConcreteCalendarEventCalendarController', ConcreteCalendarEventCalendarController)
        .controller('SessionClientsController', SessionClientsController)
        .controller('ScEditColumnsController', ScEditColumnsController)
        .controller('ScEditCustomColumnsController', ScEditCustomColumnsController)
        .controller('HealthSectionsController', HealthSectionsController)
        .controller('HsEditColumnsController', HsEditColumnsController)
        .controller('HsEditCustomColumnsController', HsEditCustomColumnsController)
        .controller('HsEditCustomValuesController', HsEditCustomValuesController)
        .controller('HsEditConditionController', HsEditConditionController)
        .controller('HsEditFlagController', HsEditFlagController)
        .controller('HsEditSelectValuesController', HsEditSelectValuesController)
        .controller('SuggestedServicesController', SuggestedServicesController)
        .controller('SsEditCustomColumnsController', SsEditCustomColumnsController)
        .controller('SsEditColumnsController', SsEditColumnsController)
        .controller('SuggestedServiceController', SuggestedServiceController)
        .controller('JuggleBoardController', JuggleBoardController)
        .controller('JbDateController', JbDateController)
        .controller('JbDatesIntervalController', JbDatesIntervalController)
        .controller('JbDatesWeekController', JbDatesWeekController)
        .controller('MatchingBoardController', MatchingBoardController)
        .controller('MbDateController', MbDateController)
        .controller('MbDatesWeekController', MbDatesWeekController)
        .controller('MbDatesIntervalController', MbDatesIntervalController)
        .controller('MbCellController', MbCellController)
        .controller('MatchingBoardViewConfirmationController', MatchingBoardViewConfirmationController)
        .controller('MbConfirmationListController', MbConfirmationListController)
        .controller('MbConfirmationController', MbConfirmationController)
        .controller('EventsController', EventsController)
        .controller('EventController', EventController)
        .controller('EventListController', EventListController)
        .controller('EventTypesController', EventTypesController)
        .controller('EventTypesListController', EventTypesListController)
        .controller('BookingEventConfirmationController', BookingEventConfirmationController)
        .controller('WelcomeController', WelcomeController)
        .controller('MyEventsController', MyEventsController)
        .controller('BimodelEventCalendarController', BimodelEventCalendarController)
        .controller('ReconcileController', ReconcileController)
        .controller('EstimateListController', EstimateListController)
        .controller('EstimateController', EstimateController)
        .controller('ReportListController', ReportListController)
        .controller('ReportController', ReportController)
        .controller('ReportTableController', ReportTableController)
        .directive('reportExpandList', reportExpandList)
        .directive('selector', selector)
        .directive('changesize', changeSizeHover)
        .directive('nullableSelector', nullableSelector)
        .directive('cspModuleSelector', cspModuleSelector)
        .directive('repeatPassword', repeatPassword)
        .directive('renderAs', renderAs)
        .directive('renderStatus', renderStatus)
        .directive('renderBody', renderBody)
        .directive('renderRect', renderRect)
        .directive('list', list)
        .directive('mdHeader', mdHeader)
        .directive('renderNames', renderNames)
        .directive('rightSidebar', rightSidebar)
        .directive('renderCheckService', renderCheckService)
        .directive('listSelector', listSelector)
        .directive('animateOnChange', animateOnChange)
        .directive('eventSelector', eventSelector)
        .directive('chipsSelector', chipsSelector)
        .directive('chipsStringSelector', chipsStringSelector)
        .directive('objectsSelector', objectsSelector)
        .directive('autocompleteList', autocompleteList)
        .directive('simpleList', simpleList)
        .directive('mdSticky', mdSticky)
        .directive('renderTherapistsRequests', renderTherapistsRequests)
        .directive('weekSelector', weekSelector)
        .directive('cspUserMenu', cspUserMenu)
        .directive('cspHeader', cspHeader)
        .directive('contentHeader', contentHeader)
        .directive('inlineWeekSelector', inlineWeekSelector)
        .directive('calendarGridMode', calendarGridMode)
        .directive('calendarSlotSize', calendarSlotSize)
        .directive('renderCheckItem', renderCheckItem)
        .directive('availabilityCalendar', availabilityCalendar)
        .directive('eventCalendar', eventCalendar)
        .directive('bimodelEventCalendar', bimodelEventCalendar)
        .directive('healthTable', healthTable)
        .directive('htCell', htCell)
        .directive('healthSectionTable', healthSectionTable)
        .directive('hsCell', hsCell)
        .directive('suggestedServicesTable', suggestedServicesTable)
        .directive('jbTable', jbTable)
        .directive('mbCell', mbCell)
        .directive('mbTable', mbTable)
        .directive('calendarRowMbDates', calendarRowMbDates)
        .directive('calendarRowMbDate', calendarRowMbDate)
        .directive('defaultAvailability', defaultAvailability)
        .directive('calendarRowConcreteEvents', calendarRowConcreteEvents)
        .directive('dateNav', dateNav)
        .directive('menuButton', menuButton)
        .directive('leftMenu', leftMenu)
        .directive('suggestedForm', suggestedForm)
        .directive('concreteEventReconcileList', concreteEventReconcileList)
        .directive('mailTable', mailTable)
        .directive('flexibleSticky', flexibleSticky)
        .directive('flexibleStickyColumn', flexibleStickyColumn);
}
