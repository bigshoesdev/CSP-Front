import {
    checkModuleAccess,
    getCategory,
    getEquipment,
    getPlain,
    getRestriction,
    getRoom,
    getEvent,
    getEventTypes,
    getTax,
    getTherapist,
    getService,
    getClient,
} from '../../services/route.generators';
import {Room} from '../../model/rest/Room';
import {Equipment} from '../../model/rest/Equipment';
import {ServiceCategory} from '../../model/rest/ServiceCategory';
import {Restriction} from '../../model/rest/Restriction';
import {DataCacheService} from '../../services/storage/data-cache.service';
import {Therapist} from '../../model/rest/Therapist';
import {Client} from '../../model/rest/Client';
import {TherapistInfo} from '../../model/rest/TherapistInfo';
import {Taxes} from '../../model/rest/Taxes';
import {EventTypes} from '../../model/rest/EventTypes';
import {Event} from '../../model/rest/Event';
import {Service} from "../../model/rest/Service";

/** @ngInject */
export function settingsRouterConfig($stateProvider: ng.ui.IStateProvider) {

    // Setup module
    $stateProvider
        .state('auth.settings', {
            url: '/settings',
            views: {
                'sidebar@': {
                    templateUrl: 'app/directives/sidebar/sidebar.html',
                    controller: 'SidebarController',
                    resolve: {
                        items: (Sidebars) => Sidebars.settings
                    }
                },
                'main@auth': {
                    template: '<menu-button></menu-button><h1>Settings module</h1>'
                }
            },
            resolve: {
                checkModuleAccess: checkModuleAccess('SETTINGS')
            }
        });

    // Remote Server
    $stateProvider
        .state('auth.settings.remoteServer', {
            url: '/remoteServer',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/remoteServer/remoteServer.html',
                    controller: 'RemoteServerController',
                    resolve: {
                        settings: (Restangular) => {
                            return Restangular
                                .all('remoteServer')
                                .get('settings')
                                .then(getPlain);
                        }
                    }
                }
            }
        });

    // Categories
    $stateProvider
        .state('auth.settings.categoryList', {
            url: '/categories',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/categoryList/categoryList.html',
                    controller: 'CategoryListController'
                }
            }
        })
        .state('auth.settings.categoryNew', {
            url: '/categories/new',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/category/category.html',
                    controller: 'CategoryController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isEdit: () => false,
                        category: ($rootScope): ServiceCategory => {
                            return $rootScope.blankServiceCategory || {
                                id: null,
                                name: '',
                                services: []
                            };
                        },
                        services: (DataCacheService: DataCacheService) => DataCacheService.getServices(),
                    }
                }
            }
        })
        .state('auth.settings.categoryShow', {
            url: '/categories/show/{categoryId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/category/category.html',
                    controller: 'CategoryController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isEdit: () => false,
                        category: getCategory,
                        services: (DataCacheService: DataCacheService) => DataCacheService.getServices(),
                    }
                }
            }
        })
        .state('auth.settings.categoryEdit', {
            url: '/categories/edit/{categoryId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/category/category.html',
                    controller: 'CategoryController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isEdit: () => true,
                        category: getCategory,
                        services: (DataCacheService: DataCacheService) => DataCacheService.getServices(),
                    }
                }
            }
        });

    // Services
    $stateProvider
        .state('auth.settings.uncategorizedServiceList', {
            url: '/services/uncategorized',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/uncategorizedServiceList/uncategorizedServiceList.html',
                    controller: 'UncategorizedServiceListController'
                }
            }
        })
        .state('auth.settings.serviceList', {
            url: '/services',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/serviceList/serviceList.html',
                    controller: 'ServiceListController'
                }
            }
        })
        .state('auth.settings.serviceNew', {
            url: '/services/new',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/service/service.html',
                    controller: 'ServiceController',
                    resolve: {
                        isEdit: () => false,
                        taxes: (DataCacheService: DataCacheService) => DataCacheService.getTaxes(),
                        service: () => {
                            return {
                                id: null
                            } as Service
                        }
                    }
                }
            }
        })
        .state('auth.settings.serviceShow', {
            url: '/services/show/{serviceId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/service/service.html',
                    controller: 'ServiceController',
                    resolve: {
                        isEdit: () => false,
                        taxes: (DataCacheService: DataCacheService) => DataCacheService.getTaxes(),
                        service: getService
                    }
                }
            }
        })
        .state('auth.settings.serviceEdit', {
            url: '/services/{serviceId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/service/service.html',
                    controller: 'ServiceController',
                    resolve: {
                        isEdit: () => true,
                        taxes: (DataCacheService: DataCacheService) => DataCacheService.getTaxes(),
                        service: getService
                    }
                }
            }
        });

    // Clients
    $stateProvider
        .state('auth.settings.clientList', {
            url: '/clients',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/clientList/clientList.html',
                    controller: 'ClientListController',
                    resolve: {
                        isEdit: () => true,
                        client: (DataCacheService: DataCacheService) => DataCacheService.getClients()
                    }
                }
            }
        })
        .state('auth.settings.clientNew', {
            url: '/client/new',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/client/client.html',
                    controller: 'ClientController',
                    resolve: {
                        isEdit: () => false,
                        client: () => ({
                            id: null,
                        }as Client)
                    }
                }
            }
        })
        .state('auth.settings.clientShow', {
            url: '/client/show/{clientId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/client/client.html',
                    controller: 'ClientController',
                    resolve: {
                        isEdit: () => false,
                        client: getClient,
                    }
                }
            }
        })
        .state('auth.settings.clientEdit', {
            url: '/client/edit/{clientId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/client/client.html',
                    controller: 'ClientController',
                    resolve: {
                        isEdit: () => true,
                        client: getClient,
                    }
                }
            }
        });

    // Events
    $stateProvider
        .state('auth.settings.eventList', {
            url: '/events',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/eventList/eventList.html',
                    controller: 'EventListController'
                }
            }
        })
        .state('auth.settings.eventNew', {
            url: '/events/new',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/event/event.html',
                    controller: 'EventController',
                    resolve: {
                        isEdit: () => false,
                        taxes: (DataCacheService: DataCacheService) => DataCacheService.getTaxes(),
                        eventTypes: (DataCacheService: DataCacheService) => DataCacheService.getEventTypes(),
                        event: function (): Event {
                            return {
                                id: null,
                            } as Event;
                        }
                    }
                }
            }
        })
        .state('auth.settings.eventShow', {
            url: '/events/show/{eventId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/event/event.html',
                    controller: 'EventController',
                    resolve: {
                        isEdit: () => false,
                        taxes: (DataCacheService: DataCacheService) => DataCacheService.getTaxes(),
                        eventTypes: (DataCacheService: DataCacheService) => DataCacheService.getEventTypes(),
                        event: getEvent
                    }
                }
            }
        })
        .state('auth.settings.eventEdit', {
            url: '/events/edit/{eventId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/event/event.html',
                    controller: 'EventController',
                    resolve: {
                        isEdit: () => true,
                        taxes: (DataCacheService: DataCacheService) => DataCacheService.getTaxes(),
                        eventTypes: (DataCacheService: DataCacheService) => DataCacheService.getEventTypes(),
                        event: getEvent
                    }
                }
            }
        });

    // Event Types
    $stateProvider
        .state('auth.settings.eventTypesList', {
            url: '/eventTypes',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/eventTypesList/eventTypesList.html',
                    controller: 'EventTypesListController'
                }
            }
        })
        .state('auth.settings.eventTypeNew', {
            url: '/eventTypes/new',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/eventTypes/eventTypes.html',
                    controller: 'EventTypesController',
                    resolve: {
                        isEdit: () => false,
                        eventType: function (): EventTypes {
                            return {
                                id: null,
                            } as EventTypes;
                        }
                    }
                }
            }
        })
        .state('auth.settings.eventTypesShow', {
            url: '/eventTypes/show/{eventTypeId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/eventTypes/eventTypes.html',
                    controller: 'EventTypesController',
                    resolve: {
                        eventType: getEventTypes,
                        isEdit: () => false,

                    }
                }
            }
        })
        .state('auth.settings.eventTypesEdit', {
            url: '/eventTypes/edit/{eventTypeId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/eventTypes/eventTypes.html',
                    controller: 'EventTypesController',
                    resolve: {
                        isEdit: () => true,
                        eventType: getEventTypes
                    }
                }
            }
        });

    // Taxes
    $stateProvider
        .state('auth.settings.taxesList', {
            url: '/taxes',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/taxesList/taxesList.html',
                    controller: 'TaxesListController'
                }
            }
        })
        .state('auth.settings.taxNew', {
            url: '/taxes/new',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/taxes/taxes.html',
                    controller: 'TaxesController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isEdit: () => false,
                        tax: function (): Taxes {
                            return {
                                id: null,
                            } as Taxes;
                        }
                    }
                }
            }
        })
        .state('auth.settings.taxShow', {
            url: '/taxes/show/{taxId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/taxes/taxes.html',
                    controller: 'TaxesController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isEdit: () => false,
                        tax: getTax
                    }
                }
            }
        })
        .state('auth.settings.taxEdit', {
            url: '/taxes/edit/{taxId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/taxes/taxes.html',
                    controller: 'TaxesController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isEdit: () => true,
                        tax: getTax
                    }
                }
            }
        });

    // Therapists
    $stateProvider
        .state('auth.settings.therapistList', {
            url: '/therapists',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/therapistList/therapistList.html',
                    controller: 'TherapistListController'
                }
            }
        })
        .state('auth.settings.unassignedTherapistList', {
            url: '/therapists/unassigned',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/therapistList/therapistList.html',
                    controller: 'UnassignedTherapistListController'
                }
            }
        })
        .state('auth.settings.noaccountTherapistList', {
            url: '/therapists/noaccount',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/noaccountTherapistList/noaccountTherapistList.html',
                    controller: 'NoaccountTherapistListController'
                }
            }
        })
        .state('auth.settings.therapistShow', {
            url: '/therapists/show/{therapistId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/therapist/therapist.html',
                    controller: 'TherapistController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isEdit: () => false,
                        therapist: getTherapist,
                        categories: (DataCacheService: DataCacheService) => DataCacheService.getCategories(),
                        services: (DataCacheService: DataCacheService) => DataCacheService.getServices(),
                        events: (DataCacheService: DataCacheService) => DataCacheService.getEvents(),
                        rooms: (DataCacheService: DataCacheService) => DataCacheService.getRooms(),
                    }
                }
            }
        })
        .state('auth.settings.therapistEdit', {
            url: '/therapists/edit/{therapistId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/therapist/therapist.html',
                    controller: 'TherapistController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isEdit: () => true,
                        therapist: getTherapist,
                        categories: (DataCacheService: DataCacheService) => DataCacheService.getCategories(),
                        services: (DataCacheService: DataCacheService) => DataCacheService.getServices(),
                        events: (DataCacheService: DataCacheService) => DataCacheService.getEvents(),
                        rooms: (DataCacheService: DataCacheService) => DataCacheService.getRooms(),
                    }
                }
            }
        })
        .state('auth.settings.therapistNew', {
            url: '/therapists/new',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/therapist/therapist.html',
                    controller: 'TherapistController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isEdit: () => false,
                        therapist: function (): Therapist {
                            return {
                                id: null,
                                name: '',
                                email: '',
                                therapistInfo: {
                                    firstName: ''
                                } as TherapistInfo
                            };
                        },
                        categories: (DataCacheService: DataCacheService) => DataCacheService.getCategories(),
                        services: (DataCacheService: DataCacheService) => DataCacheService.getServices(),
                        events: (DataCacheService: DataCacheService) => DataCacheService.getEvents(),
                        rooms: (DataCacheService: DataCacheService) => DataCacheService.getRooms()
                    }
                }
            }
        });

    // Rooms
    $stateProvider
        .state('auth.settings.roomList', {
            url: '/rooms',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/roomList/roomList.html',
                    controller: 'RoomListController'
                }
            }
        })
        .state('auth.settings.roomNew', {
            url: '/rooms/new',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/room/room.html',
                    controller: 'RoomController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isEdit: () => false,
                        room: function (): Room {
                            return {
                                id: null,
                                name: '',
                                capacity: 1
                            };
                        }
                    }
                }
            }
        })
        .state('auth.settings.roomShow', {
            url: '/rooms/show/{roomId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/room/room.html',
                    controller: 'RoomController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isEdit: () => false,
                        room: getRoom,
                    }
                }
            }
        })
        .state('auth.settings.roomEdit', {
            url: '/rooms/edit/{roomId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/room/room.html',
                    controller: 'RoomController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isEdit: () => true,
                        room: getRoom,
                    }
                }
            }
        });

    // Equipment
    $stateProvider
        .state('auth.settings.equipmentList', {
            url: '/equipments',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/equipmentList/equipmentList.html',
                    controller: 'EquipmentListController'
                }
            }
        })
        .state('auth.settings.equipmentNew', {
            url: '/equipments/new',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/equipment/equipment.html',
                    controller: 'EquipmentController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isEdit: () => false,
                        equipment: function (): Equipment {
                            return {
                                id: null,
                                name: '',
                                capacity: 1
                            };
                        }
                    }
                }
            }
        })
        .state('auth.settings.equipmentShow', {
            url: '/equipments/show/{equipmentId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/equipment/equipment.html',
                    controller: 'EquipmentController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isEdit: () => false,
                        equipment: getEquipment,
                    }
                }
            }
        })
        .state('auth.settings.equipmentEdit', {
            url: '/equipments/edit/{equipmentId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/equipment/equipment.html',
                    controller: 'EquipmentController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isEdit: () => true,
                        equipment: getEquipment,
                    }
                }
            }
        });

    // Restrictions
    $stateProvider
        .state('auth.settings.restrictionList', {
            url: '/restrictions',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/restrictionList/restrictionList.html',
                    controller: 'RestrictionListController'
                }
            }
        })
        .state('auth.settings.restrictionNew', {
            url: '/restrictions/new',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/restriction/restriction.html',
                    controller: 'RestrictionController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isEdit: () => false,
                        restriction: (): Restriction => {
                            return {
                                id: null,
                                name: '',
                                type: null,
                                linkedId: null,
                                rooms: [],
                                equipments: []
                            };
                        },
                        equipments: (DataCacheService: DataCacheService) => DataCacheService.getEquipments(),
                        rooms: (DataCacheService: DataCacheService) => DataCacheService.getRooms(),
                        services: (DataCacheService: DataCacheService) => DataCacheService.getServices(),
                        serviceCategories: (DataCacheService: DataCacheService) => DataCacheService.getCategories()
                    }
                }
            }
        })
        .state('auth.settings.restrictionShow', {
            url: '/restrictions/show/{restrictionId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/restriction/restriction.html',
                    controller: 'RestrictionController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isEdit: () => false,
                        restriction: getRestriction,
                        equipments: (DataCacheService: DataCacheService) => DataCacheService.getEquipments(),
                        rooms: (DataCacheService: DataCacheService) => DataCacheService.getRooms(),
                        services: (DataCacheService: DataCacheService) => DataCacheService.getServices(),
                        serviceCategories: (DataCacheService: DataCacheService) => DataCacheService.getCategories()
                    }
                }
            }
        })
        .state('auth.settings.restrictionEdit', {
            url: '/restrictions/edit/{restrictionId}',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/restriction/restriction.html',
                    controller: 'RestrictionController',
                    controllerAs: 'ctrl',
                    resolve: {
                        isEdit: () => true,
                        restriction: getRestriction,
                        equipments: (DataCacheService: DataCacheService) => DataCacheService.getEquipments(),
                        rooms: (DataCacheService: DataCacheService) => DataCacheService.getRooms(),
                        services: (DataCacheService: DataCacheService) => DataCacheService.getServices(),
                        serviceCategories: (DataCacheService: DataCacheService) => DataCacheService.getCategories()
                    }
                }
            }
        });

    // Remote Server
    $stateProvider
        .state('auth.settings.mailList', {
            url: '/mailTemplates',
            views: {
                'main@auth': {
                    templateUrl: 'app/components/moduleSettings/components/mailList/mailList.html',
                    controller: 'MailListController',
                    controllerAs: 'ctrl',
                    resolve: {
                        mails: (DataCacheService: DataCacheService) => DataCacheService.getMails()
                    }
                }
            }
        });

}
