import {Collection} from '../model/Collection';

export class WelcomeController {
    /** @ngInject */
    constructor(private $scope,
                private $window: ng.IWindowService,
                private Restangular) {
        $scope.buildVersion = $window.__env.buildVersion;

        this.getServerVersion().then((map: { version: string }) => {
            $scope.serverBuildVersion = map.version;
        });
    }

    private getServerVersion(): Promise<{ [key: string]: string }> {
        return this.Restangular
            .one('version')
            .get()
            .then(o => o.plain());
    }
}
