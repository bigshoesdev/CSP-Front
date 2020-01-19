import {defaultPageSize} from '../services/app.constant';
import {TableConf} from '../model/TableConf';
import {DialogService} from '../services/dialog/dialog.service';
import {Count} from '../model/rest/Count';
import {IToastrService} from 'angular-toastr';
import {LoDashStatic} from '@types/lodash';

declare let angular: any;

export abstract class AbstractListController {

    abstract getTableConf(dataList): TableConf;

    abstract canLoadData(): boolean;

    /**
     * @param $scope - must have:
     *      collectionUrl : srting;
     *      elementUrl : srting;
     *      filterParams : { fromDate, toDate };
     *      sort : srting; // '+id' or '+name'
     *      hideOflineFilter: boolean;
     *
     * @param $state
     * @param Restangular
     * @param _
     * @param DialogService
     * @param toastr
     */
    constructor(public $scope,
                public $state: ng.ui.IStateService,
                public Restangular: any,
                public _: LoDashStatic,
                public DialogService: DialogService,
                public toastr: IToastrService) {
        const __this = this;

        // todo use filterParams

        // initialise paging
        $scope.paging = {
            currentPage: 1,
            totalItems: 0, // will be updated in loadData()
            maxSize: 5,
            itemsPerPage: defaultPageSize,
            pageChanged: __this.loadData.bind(__this)
        };

        $scope.sortBy = (sort: string) => {
            $scope.sort = sort;
            $scope.paging.currentPage = 1; // reset paging
            __this.loadPage();
        };

        __this.loadData();
    }

    public deleteItemConfirm(item, $event) {
        const __this = this;
        const question = this.getDeleteConfirmQuestion(item);

        __this.DialogService
            .dialogConfirm({
                title: 'Delete',
                textContent: question,
                targetEvent: $event,
                cancel: 'Cancel',
                ok: 'Delete'
            })
            .then(() => {
                __this.deleteItem(item);
            });
    }

    public  getDeleteConfirmQuestion(item): string {
        return 'Are you sure to delete the item?';
    }

    public deleteItem(item) {
        const __this = this;

        __this.Restangular
            .one(__this.$scope.elementUrl, item.id)
            .remove()
            .then(() => {
                __this.toastr.info(__this.$scope.elementUrl + ' deleted successfully');
                __this.loadData();
            }, (err) => {
                __this.loadData();
            });
    }


    protected loadData() {
        const __this = this;
        const _$scope: any = __this.$scope;
        const _paging = _$scope.paging;
        const collectionURL = _$scope.collectionUrl;
        if (!__this.canLoadData()) {
            return;
        }

        let params = {
            pageId: _paging.currentPage,
            pageSize: _paging.itemsPerPage,
            sort: _$scope.sort
        };
        // update user count then update user data
        __this.Restangular
            .all(collectionURL)
            .get('count', params)
            .then((countObj: Count) => {
                __this.$scope.paging.totalItems = countObj.count;
                __this.$scope.numpages = Math.ceil(countObj.count / params.pageSize);
            })
            .then(__this.loadPage.bind(__this));
    }


    protected loadPage() {
        const __this = this;
        const _$scope = __this.$scope;
        const _paging = _$scope.paging;

        let params = {
            pageId: _paging.currentPage,
            pageSize: _paging.itemsPerPage,
            sort: _$scope.sort
        };

        params = __this._.assign(params, _$scope.filterParams);

        __this.Restangular
            .all(_$scope.collectionUrl)
            .getList(params)
            .then(this.getPlain)
            .then(__this.updateTable.bind(__this));
    }

    private updateTable(dataList) {
        this.$scope.listConf = this.getTableConf(dataList);
    }

    protected getPlain(o) {
        return o && o.plain() || o;
    }

}

