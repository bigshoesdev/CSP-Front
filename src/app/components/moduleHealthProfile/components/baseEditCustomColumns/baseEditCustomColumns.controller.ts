import {BaseCustomColumn} from '../../../../model/rest/BaseCustomColumn';

declare let angular: any;

export abstract class BaseEditCustomColumnsController {

    constructor(protected customColumns: BaseCustomColumn[],
                protected $scope, protected StateStack) {

        const __this = this;

        __this.initForm(customColumns);

        $scope.types = __this.getTypes();

        $scope.backOrDone = () => {
            StateStack.goBack();
        };

        $scope.addNew = () => {
            const newCustomColumn: BaseCustomColumn = {
                id: null,
                title: '',
                type: null,
                values: []
            };
            $scope.newCustomColumn = newCustomColumn;
        };

        $scope.onCustomColumnChange = __this.putCustomColumn.bind(__this);

        $scope.onNewCustomColumnChange = add;
        $scope.onNewCustomColumnAdd = add;

        function add(newCustomColumn: BaseCustomColumn) {
            if (!(newCustomColumn.title && newCustomColumn.type)) {
                return;
            }
            __this.postCustomColumn(newCustomColumn)
                .then(__this.update.bind(__this))
                .then(() => {
                    $scope.newCustomColumn = null;
                });
        }

        $scope.isSelectType = __this.isSelectType.bind(__this);

        $scope.editSelectValues = __this.editSelectValues.bind(__this);

        $scope.remove = (customColumn: BaseCustomColumn) => {
            __this.removeCustomColumn(customColumn)
                .then(__this.update.bind(__this));
        };

    }

    protected update() {
        const __this = this;
        __this.getCustomColumns().then(__this.initForm.bind(__this));
    }

    protected initForm(customColumns: BaseCustomColumn[]) {
        const __this = this;
        __this.$scope.customColumns = customColumns;
    }


    abstract getTypes(): string[];

    abstract putCustomColumn(customColumn: BaseCustomColumn): any;

    abstract postCustomColumn(customColumn: BaseCustomColumn): any;

    abstract removeCustomColumn(customColumn: BaseCustomColumn): any;

    abstract isSelectType(customColumn: BaseCustomColumn): boolean;

    abstract editSelectValues(customColumn: BaseCustomColumn, $event): void;

    abstract getCustomColumns(): any;

}
