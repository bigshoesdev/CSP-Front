# Deployment  csp_front #

1. Get app
* `git clone https://ilinyhs@bitbucket.org/csp2team/csp_front.git`
* `cd /csp_fornt`

2. Get dependencies
* `npm install`
* `bower install`

3. Build
* `gulp clean`
* `gulp build` - Build production version into `/dist` directory.

4. Start
* `gulp clean`
* `gulp serve:dist` - Build and run production version.

The application will be available on `http://localhost:3000/` or by IP. For example: `http://192.168.0.40:3000/`.

5. You can configure the application by editing file `configs.json` also 
   you can change some configs when you run `gulp serve` or `gulp build` command in terminal:
   
      Command    |    Configs    |    Default  
   ------------- | ------------- | ----------- 
   -p            | port          |     8080    
   -h            | hostName      |  localhost 
   -b            | buildVersion  |  "0.7.3"   