import {Utils} from './utils.service';

declare let angular: any;

/** @ngInject */
function UnsavedChanges($rootScope, $window, Utils: Utils) {
    let MESSAGE = 'Are you sure you want to navigate away from this page without saving?',
        isChangedFn,
        listenerDeregistration,
        deregistrationCallback;

    return {
        isChanged: function () {
            return isChangedFn && isChangedFn();
        },
        register: register,
        deregister: deregister
    };


    /**
     * @param $scope           - to listen $destroy
     * @param listenedToObj    - object to check whether it was change.
     * @param deregistrationCb - callback to invoke after deregistration.
     * @param beforeCheckCb    - callback to be invoked on current object before checking on was changed\unchanged
     * @returns {deregister}   - function for deregistration listening.
     */
    function register($scope, listenedToObj, deregistrationCb, beforeCheckCb) {
        deregister();
        deregistrationCallback = deregistrationCb;


        const initialHash = (beforeCheckCb) ? _getHash(beforeCheckCb(listenedToObj)) : _getHash(listenedToObj);

        listenerDeregistration =
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {

                const listened = (beforeCheckCb) ? beforeCheckCb(listenedToObj) : listenedToObj;

                const currentHash = _getHash(listened);

                if (!Utils.equals(initialHash, currentHash) && !confirm(MESSAGE)) {
                    // prevent transition
                    $rootScope.$emit('$stateChangeError');
                    event.preventDefault();
                } else {
                    deregister();
                    // don't prevent transition
                }
            });

        isChangedFn = function () {
            return !Utils.equals(initialHash, _getHash(listenedToObj));
        };

        $window.onbeforeunload = function (evt) {
            const listened = (beforeCheckCb) ? beforeCheckCb(listenedToObj) : listenedToObj;
            const currentHash = _getHash(listened);

            if (!Utils.equals(initialHash, currentHash)) {
                (evt || window.event).returnValue = MESSAGE; // Gecko + IE
                return MESSAGE;                              // Webkit, Safari, Chrome
            }
        };

        $scope.$on('$destroy', function () {
            deregister();
        });

        return deregister;
    }

    function deregister() {
        if (listenerDeregistration) {
            listenerDeregistration();
        }
        if (deregistrationCallback) {
            deregistrationCallback();
        }
        if ($window.onbeforeunload) {
            $window.onbeforeunload = null;
        }
        if (isChangedFn) {
            isChangedFn = undefined;
        }
    }

    function _getHash(o) {
        return Utils.clone(o);
    }
}

export {UnsavedChanges};
