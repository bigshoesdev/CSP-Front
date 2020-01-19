import {ReportTableItem} from '../../../../model/rest/ReportTableItem';
import {IScope} from 'angular';
import {LoDashStatic} from 'lodash';
import {DialogService} from '../../../../services/dialog/dialog.service';
import {IToastrService} from 'angular-toastr';
import {Report} from '../../../../model/rest/Report';

export interface IReportGroups {
    [key: string]: ReportTableItem[];
}

export interface IReportTableScope extends IScope {
    reportTable: ReportTableItem[];
    reportGroups: IReportGroups;
    title: string;
    thList: Array<any>;
}

export class ReportTableController {
    /** @ngInject */
    constructor(reportTable: ReportTableItem[],
                report: Report,
                public $scope: IReportTableScope,
                $state: ng.ui.IStateService,
                Restangular: Restangular.IService,
                private _: LoDashStatic,
                DialogService: DialogService,
                toastr: IToastrService) {

        $scope.reportTable = reportTable;

        $scope.thList = [
            {key: 'date', title: 'Date', width: 10},
            {key: 'serviceName', title: 'Service/Event name', width: 40},
            {key: 'price', title: 'Price', width: 10},
            {key: 'time', title: 'Time', width: 10, order: 1},
            {key: 'duration', title: 'Duration', width: 10},
            {key: 'room', title: 'Room', value: 'name', width: 10},
            {key: 'therapist', title: 'Therapist', value: 'name'},
            {key: 'client', title: 'Client', value: 'name'},
        ];

        switch (report.type) {
            case 'clients':
                $scope.title = 'Report by client: ' + report.client.name;
                this.removeFromModel('client');
                break;
            case 'rooms':
                $scope.title = 'Report by room: ' + report.room.name;
                this.removeFromModel('room');
                break;
            case 'therapists':
                $scope.title = 'Report by therapist: ' + report.therapist.name;
                this.removeFromModel('therapist');
                break;
        }
        $scope.reportGroups = this._.groupBy($scope.reportTable, (item: ReportTableItem) => {
            return item.date;
        });
        let sortKeys = [];
        let reports = {};
        sortKeys = sortKeys.concat(Object.keys($scope.reportGroups)).sort();
        sortKeys.forEach((key) => {
            reports[key] = $scope.reportGroups[key];
        });
        $scope.reportGroups = reports;

        // we got groups with date
        this.removeFromModel('date');
    }

    public removeFromModel(keyItem: string): void {
        const thList = this.$scope.thList;
        const table = this.$scope.reportTable;
        this.$scope.reportTable = table.map((item) => {
            delete (item[keyItem]);
            return item;
        });

        this._.remove(thList, (item) => item.key === keyItem);
    }

    public getModelValue(keyItem: string, item: ReportTableItem): string {
        const thList = this.$scope.thList;
        let value = item[keyItem];

        thList.forEach((th) => {
            if (th.key === keyItem) {
                value = th.value !== undefined
                    ? item[keyItem][th.value]
                    : item[keyItem];
            }
        });
        return value;
    }

    public getOrderedItem(item: ReportTableItem): ReportTableItem {
        const output = {} as ReportTableItem;
        const thList = this.$scope.thList;

        const sorteredThList = thList.sort((a: any, b: any) => {
            const orderA = a.order ? a.order : 0;
            const orderB = b.order ? b.order : 0;
            return orderB - orderA;
        });

        sorteredThList.forEach(thItem => {
            output[thItem.key] = item[thItem.key];
        });
        return output;
    }
}
