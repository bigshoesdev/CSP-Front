
/** @ngInject */
export function SidebarService() {

    let _isLeftPageslideOpen: boolean = true;

    return {
        isLeftPageslideOpen: isLeftPageslideOpen,
        setLeftPageslideOpen: setLeftPageslideOpen
    };

    function isLeftPageslideOpen() {
        return _isLeftPageslideOpen;
    }

    function setLeftPageslideOpen(val: boolean) {
        _isLeftPageslideOpen = val;
    }

}
