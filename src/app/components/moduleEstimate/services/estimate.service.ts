import {ConcreteEvent} from '../../../model/rest/ConcreteEvent';
import {Client} from '../../../model/rest/Client';
import {ConcreteEventReconcileRow} from '../directives/concreteEventReconcileList.directive';
import {CompositeTime} from '../../../model/rest/CompositeTime';
import {ConcreteEventReconcile} from '../../../model/rest/ConcreteEventReconcile';
import {Service} from '../../../model/rest/Service';
import {Utils} from '../../../services/utils.service';
import {Entity} from '../../../model/Entity';

export class EstimateService {
    /** @ngInject */
    constructor(private Utils: Utils,
                private _,
                protected $interpolate,
                protected $window: ng.IWindowService) {
    }

    makeEventRows(reconcileEvents: ConcreteEventReconcile[],
                  services: Service[],
                  clients: Client[]): ConcreteEventReconcileRow[] {
        return reconcileEvents.map((reconcileEvent: ConcreteEventReconcile): ConcreteEventReconcileRow => {
            const concreteEvent: ConcreteEvent = reconcileEvent.concreteEvent;

            const duration: CompositeTime = concreteEvent.duration;
            const durationTotal = this.Utils.minutesToStrTime(duration.clean + duration.prep + duration.processing);

            const service: Service = concreteEvent.service;
            const client: Client = concreteEvent.client;

            const estimateLink: string = reconcileEvent.estimateExternalId
                ? this.$interpolate(this.$window.__env.estimationUrlTemplate)({estimateId: reconcileEvent.estimateExternalId})
                : null;

            return {
                selected: false,
                disabled: false,
                reconcileEvent: reconcileEvent,

                serviceName: service && service.name,
                therapistName: concreteEvent.therapist && concreteEvent.therapist.name,
                _client: client,
                clientName: client && client.name,
                roomName: concreteEvent.room && concreteEvent.room.name,
                date: concreteEvent.date,
                time: concreteEvent.time,
                durationTotal: durationTotal,
                status: (concreteEvent.subStatus || concreteEvent.state) as string,
                estimateLink: estimateLink,
                price: service.price,
            };
        });

    }

    private findEntityById(entities: Entity[], id: number): Entity {
        return this._.find(entities, e => e.id === id);
    }

}
