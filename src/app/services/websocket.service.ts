import {IRowCalItem} from '../directives/calendarRow/calendarRow.controller';

declare let SockJS: any;
declare let Stomp: any;

/** @ngInject */
export function WebSocketService($q: any, $timeout: ng.ITimeoutService, env) {
    const STOMP_ENDPOINT_URL = env.stompEndpointUrl;
    let stompClient = null;

    return {
        connect: connect,
        disconnect: disconnect,
        send: send,
        subscribe: subscribe
    };

    function connect(headers: any = {}): Promise<any> {
        return $q((resolve, reject) => {
            stompClient = Stomp.over(new SockJS(STOMP_ENDPOINT_URL));
            stompClient.connect(headers, (frame) => {
                $timeout(() => {
                    resolve(frame);
                }, 0);
            }, (frame) => {
                $timeout(() => {
                    reject(frame);
                }, 0);
            });
        });
    }


    function disconnect(headers: any): Promise<any> {
        return $q((resolve, reject) => {
            if (stompClient) {
                stompClient.disconnect((frame) => {
                    $timeout(() => {
                        resolve(frame);
                    }, 0);
                }, headers);
            } else {
                reject('Stomp Client not open.');
            }
        });
    }

    function send(destination: string, headers: any, body: string): void {
        stompClient.send(destination, headers, body);
    }


    function subscribe(destination: string, callback: (frame: any) => any, headers: any): void {
        stompClient.subscribe(destination, (frame) => {
            $timeout(() => {
                callback(frame);
            }, 0);
        }, headers);
    }
}
