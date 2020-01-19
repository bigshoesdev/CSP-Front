import {SessionClientDataItem} from './SessionClientDataItem';
import {PreliminaryEvent} from './PreliminaryEvent';
import {Client} from "./Client";

export interface SessionSsClientData {
    // information about clients and there services
    client: Client;
    values: SessionClientDataItem[];
    services: PreliminaryEvent[];
}
