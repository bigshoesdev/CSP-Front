/**
 *  This file contains the variables used in other gulp files
 *  which defines tasks
 *  By design, we only put there very generic config values
 *  which are used in several places to keep good readability
 *  of the tasks
 */

var gutil = require('gulp-util');
var minimist = require('minimist');
var configs = require('../configs.json');
var fs = require('fs');
/**
 *  The main paths of your project handle these with care
 */
exports.paths = {
    src: 'src',
    dist: 'dist',
    tmp: '.tmp',
    e2e: 'e2e'
};

exports.browserSync = {
    // Override host detection if you know the correct IP to use
    // host: "192.168.0.100",
    port: 3000,
    ui: {
        port: 3001,
        weinre: {
            port: 8080
        }
    }
    // ,https: {
    //   key: "path-to-custom.key",
    //   cert: "path-to-custom.crt"
    // }

};

exports.createEnv = function (cb) {
    var newConf = JSON.stringify(updateEnvConfigs());
    var newWindowObj = 'window.__env = Object.assign(window.__env,' + newConf + ' );';
    var newJs = '(function(){window.__env = window.__env || {}; ' + newWindowObj + '})()';

    fs.writeFile(__dirname + '/../src/env.js', newJs, function (err) {
        if (err) throw err;
        cb && cb();
    });
};

function updateEnvConfigs () {
    var knownOptions = {
        default: {
            'p': process.env.NODE_ENV || configs.port,
            'h': process.env.NODE_ENV || configs.hostName,
            'b': process.env.NODE_ENV || configs.buildVersion,
            'ssl': process.env.NODE_ENV || configs.ssl
        }
    };
    var options = minimist(process.argv.slice(2), knownOptions);

    configs.hostName = options.h;
    configs.port = options.p;
    configs.buildVersion = options.b;
    configs.ssl = (options.ssl === true || options.ssl === 'true' || options.ssl === 1);

    var portUrl = (configs.port) ? ':' + configs.port : '';

    configs.apiUrl = (configs.ssl)
        ? 'https://' + configs.hostName + portUrl + '/api'
        : 'http://' + configs.hostName + portUrl + '/api';

    configs.stompEndpointUrl = configs.apiUrl + '/portal-stomp';
    return configs;
}

/**
 *  Wiredep is the lib which inject bower dependencies in your project
 *  Mainly used to inject script tags in the index.html but also used
 *  to inject css preprocessor deps and js files in karma
 */
exports.wiredep = {
    exclude: [ /\/bootstrap\.js$/, /\/bootstrap-sass\/.*\.js/, /\/bootstrap\.css/ ],
    directory: 'bower_components'
};

/**
 *  Common implementation for an error handler of a Gulp plugin
 */
exports.errorHandler = function (title) {
    'use strict';

    return function (err) {
        gutil.log(gutil.colors.red('[' + title + ']'), err.toString());
        this.emit('end');
    };
};
