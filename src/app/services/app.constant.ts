declare let window: any;

/**
 * Maps module key to CspModuleSelector items
 */
export const ModulesSelectorConf = {
    modulesConfigs: [
        {
            key: 'AUTH',
            sidebar: 'auth',
            title: 'Authentication',
            sref: 'auth.auth.userList',
            iconName: 'supervisor_account'
        },
        {
            key: 'SETTINGS',
            sidebar: 'settings',
            title: 'Settings',
            sref: 'auth.settings.categoryList',
            iconName: 'settings'
        },
        {
            key: 'SESSIONS',
            sidebar: 'sessions',
            title: 'Sessions',
            sref: 'auth.sessions.sessionList',
            iconName: 'alarm_on'
        },
        {
            key: 'AVAILABILITY',
            sidebar: 'availability',
            title: 'Availability',
            sref: 'auth.availability.requestList',
            iconName: 'event_available'
        },
        {
            key: 'EVENTS',
            sidebar: 'events',
            title: 'Events',
            sref: 'auth.events.calendarEvent.list',
            iconName: 'event'
        },
        {
            key: 'THERAPIST',
            sidebar: 'therapist',
            title: 'Therapist',
            sref: 'auth.therapist',
            iconName: 'healing'
        },
        {
            key: 'HEALTH',
            sidebar: 'healthProfile',
            title: 'Health Profile',
            sref: 'auth.healthProfile.sessionClients',
            iconName: 'book'
        },
        {
            key: 'SUGGESTED_SERVICES',
            sidebar: 'suggestedServices',
            title: 'Suggested Services',
            sref: 'auth.suggestedServices.table',
            // iconName: 'grid_on'
            iconName: 'dashboard'
        },
        {
            key: 'MATCHING_BOARD',
            sidebar: 'matchingBoard',
            title: 'Matching Board',
            sref: 'auth.matchingBoard.table',
            iconName: 'dashboard'
        },
        {
            key: 'BOOKING',
            sidebar: 'booking',
            title: 'Booking',
            sref: 'auth.booking.events',
            iconName: 'book'
        },
        {
            key: 'RECONCILE',
            sidebar: 'reconcile',
            title: 'Reconcile',
            sref: 'auth.reconcile.reconcile',
            iconName: 'swap_horiz'
        },
        {
            key: 'ESTIMATE',
            sidebar: 'estimate',
            title: 'Estimate',
            sref: 'auth.estimate.list',
            iconName: 'equalizer'
        },
        {
            key: 'REPORTS',
            sidebar: 'reports',
            title: 'Reports',
            sref: 'auth.reports.reportList',
            iconName: 'send'
        }
    ],
    selectedKey: null // 'AUTH', 'SETTINGS', 'SESSIONS', etc
};

export const modulesKeys = ModulesSelectorConf.modulesConfigs
    .map((module) => module.key)
    .concat([// modules without default views
        'HEALTH_UI',
        'HEALTH_CONDITIONS',
        'SUGGESTED_SERVICES_UI'
    ])
    .sort((a, b) => (a > b) ? 1 : ((a < b) ? -1 : 0));

/**
 * Maps module key to side bar items
 */
export const Sidebars = {
    blank: [],
    auth: [
        {
            title: 'Users',
            sref: 'auth.auth.userList',
            btns: [{
                title: 'Add User',
                sref: 'auth.auth.userNew',
                iconName: 'add'
            }]
        }
    ],
    settings: [
        {
            title: 'Remote Server',
            sref: 'auth.settings.remoteServer'
        },
        {
            title: 'Categories',
            sref: 'auth.settings.categoryList',
            btns: [{
                title: 'Create Category for Unassigned Services',
                sref: 'auth.settings.uncategorizedServiceList',
                iconName: 'note_add'
            }, {
                title: 'Add Category',
                sref: 'auth.settings.categoryNew',
                iconName: 'add'
            }]
        },
        {
            title: 'Events',
            sref: 'auth.settings.eventList'
        },
        {
            title: 'Event Types',
            sref: 'auth.settings.eventTypesList'
        },
        {
            title: 'Services',
            sref: 'auth.settings.serviceList'
        },
        {
            title: 'Therapists',
            sref: 'auth.settings.therapistList',
            btns: [{
                title: 'Unassigned Therapists',
                sref: 'auth.settings.unassignedTherapistList',
                iconName: 'insert_drive_file'
            }, {
                title: 'Create account for Therapists',
                sref: 'auth.settings.noaccountTherapistList',
                iconName: 'account_box'
            }]
        }, {
            title: 'Clients',
            sref: 'auth.settings.clientList',
        }, {
            title: 'Rooms',
            sref: 'auth.settings.roomList',
            btns: [{
                title: 'Add Room',
                sref: 'auth.settings.roomNew',
                iconName: 'add'
            }]
        }, {
            title: 'Equipments',
            sref: 'auth.settings.equipmentList',
            btns: [{
                title: 'Add Equipment',
                sref: 'auth.settings.equipmentNew',
                iconName: 'add'
            }]
        }, {
            title: 'Restrictions',
            sref: 'auth.settings.restrictionList',
            btns: [{
                title: 'Add Restriction',
                sref: 'auth.settings.restrictionNew',
                iconName: 'add'
            }]
        },
        {
            title: 'Taxes',
            sref: 'auth.settings.taxesList'
        },
        {
            title: 'Mail templates',
            sref: 'auth.settings.mailList'
        }
    ],
    sessions: [
        {
            title: 'Sessions',
            sref: 'auth.sessions.sessionList',
            btns: [{
                title: 'View Archived Sessions',
                sref: 'auth.sessions.archiveSessionList',
                iconName: 'delete',
            }, {
                title: 'Add Session',
                sref: 'auth.sessions.sessionNew',
                iconName: 'add',
            }],
        },
    ],
    availability: [
        {
            title: 'Availability Requests',
            sref: 'auth.availability.requestList',
            btns: [{
                title: 'Add Requests',
                sref: 'auth.availability.requestNew',
                iconName: 'add',
            }],
        },
        {
            title: 'Availability Template',
            sref: 'auth.availability.template',
        },
        {
            title: 'Availability Edit',
            sref: 'auth.availability.edit',
        },
        {
            title: 'Availability View',
            sref: 'auth.availability.view',
        },
        {
            title: 'Find History',
            sref: 'auth.availability.therapistHistoryFind',
        },
    ],
    events: [
        {
            title: 'Calendar Events',
            sref: 'auth.events.calendarEvent.list',
            btns: [{
                title: 'Add Calendar Event',
                sref: 'auth.events.calendarEvent.new',
                iconName: 'add',
            }],
        },
        {
            title: 'Urgent Calendar Events',
            sref: 'auth.events.calendarEvent.urgentList',
        },
    ],
    therapist: [
        {
            title: 'My Availability Requests',
            sref: 'auth.therapist.availability.requestList',
        },
        {
            title: 'My Availability',
            sref: 'auth.therapist.availability',
        },
        {
            title: 'My Events',
            sref: 'auth.therapist.events',
        },
    ],
    healthProfile: [
        {
            title: 'Session Clients',
            sref: 'auth.healthProfile.sessionClients',
        },
        {
            title: 'Edit Clients Columns',
            sref: 'auth.healthProfile.sessionClients.editColumns',
        },
        {
            title: 'Edit Clients Custom Columns',
            sref: 'auth.healthProfile.sessionClients.editCustomColumns',
        },
    ],
    suggestedServices: [
        {
            title: 'Suggested Services Table',
            sref: 'auth.suggestedServices.table',
        },
        {
            title: 'Juggle Board',
            sref: 'auth.suggestedServices.juggleBoard',
        },
    ],
    matchingBoard: [
        {
            title: 'Matching Board',
            sref: 'auth.matchingBoard.table.daily',
        },
        {
            title: 'Confirmation List',
            sref: 'auth.matchingBoard.confirmationList',
        },
    ],
    booking: [
        {
            title: 'Concrete Events',
            sref: 'auth.booking.events',
        },
        {
            title: 'Therapist Week',
            sref: 'auth.booking.weekList',
        }
    ],
    reconcile: [
        {
            title: 'Reconcile',
            sref: 'auth.reconcile.reconcile',
        },
    ],
    estimate: [
        {
            title: 'Estimates',
            sref: 'auth.estimate.list',
            btns: [{
                title: 'Create new Estimate',
                sref: 'auth.estimate.new',
                iconName: 'add'
            }]
        },
    ],
    reports: [
        {
            title: 'Reports',
            sref: 'auth.reports.reportList',
        },
    ],
};

export const RightSidebarConfig = {
    state: ''
};

export const defaultPageSize = 10;

export const weekDaysShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const dateFormat = 'MM-DD-YYYY';
export const longTimeFormat = 'HH:mm:ss';
export const timeFormat = 'HH:mm';
export const ampmTimeFormat = 'hh:mm a';
export const maxCapacity = 10000000000;

export const workingDayStart = window.__env.workingDayStart;
export const workingDayEnd = window.__env.workingDayEnd;

export const defaultSlotSizeMin = window.__env.defaultSlotSizeMin;

export function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}
