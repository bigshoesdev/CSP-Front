// export {StateStack}

interface IState {
    state: any;
    params: any;
}

/** @ngInject */
export function StateStack($state) {

    const stack: IState[] = [];

    return {
        putState: putState,
        canGoBack: canGoBack,
        goBack: goBack
    };

    function putState(toState, toParams, fromState, fromParams) {

        if (stack.length > 1 && toState.name === stack[stack.length - 2].state.name) {
            stack.splice(stack.length - 1);
        } else {
            const s: IState = {
                state: toState,
                params: toParams
            };
            stack.push(s);
        }
    }

    function canGoBack() {
        return stack.length > 1;
    }

    function goBack() {
        if (stack.length > 1) {
            const s: IState = stack[stack.length - 2];
            stack.splice(stack.length - 2);
            $state.go(s.state.name, s.params);
        }
    }

}
