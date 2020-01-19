declare let angular: any;
declare let Object: any;

/** @ngInject */
export function editorConfig($provide) {
    $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function (taRegisterTool, taOptions) {
        // $delegate is the taOptions we are decorating
        // register the tool with textAngular
        taRegisterTool('colourRed', {
            iconclass: 'fa fa-square red',
            action: function () {
                this.$editor().wrapSelection('forecolor', 'red');
            },
            display: `<color-picker
                        class="color-picker"
                        ng-model="color"
                        options="options"
                        api="api"
                        event-api="eventApi"
                    ></color-picker>`
        });
        /** HR */
        taRegisterTool('hr', {
            iconclass: 'fa fa-square red',
            action: function () {
                this.$editor().wrapSelection('insertHorizontalRule', '<hr/>');
            },
            display: `<button class="btn btn-default">HR</button>`
        });
        // add the button to the default toolbar definition
        taOptions.toolbar[1].push('colourRed');
        return taOptions;
    }]);

    $provide.decorator('ColorPickerOptions', function($delegate) {
        const options = angular.copy($delegate);
        Object.assign(options, {
            allowEmpty: false,
            alpha: false,
            case: 'upper',
            hide: {
                'blur': true,
                'escape': true,
                'click': true
            },
            hue: true,
            lightness: true,
            round: true,
            format: 'rgb',
            restrictToFormat: false,

            swatch: true,
            swatchOnly: true,
            swatchBootstrap: true
        });

        return options;
    });
}
