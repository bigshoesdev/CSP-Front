
/** @ngInject */
export function SourceDropmodelStorage() {

    let _$dropmodel = null;

    return {
        putSourceDropmodel: putSourceDropmodel,
        getSourceDropmodel: getSourceDropmodel,
        clearSourceDropmodel: clearSourceDropmodel,
    };

    function putSourceDropmodel($dropmodel) {
        _$dropmodel = $dropmodel;
    }

    function getSourceDropmodel() {
        return _$dropmodel;
    }

    function clearSourceDropmodel() {
        _$dropmodel = null;
    }

}
