/**
 *  Copyright (c) 2015 Salama AB
 *  All rights reserved
 *  Contact: aksalj@aksalj.me
 *  Website: http://www.aksalj.me
 *
 *  Project : pesajs
 *  File : soapHelper
 *  Date : 9/5/15 5:56 PM
 *  Description :
 *
 */
'use strict';
var request = require('request');
var soap = require('soap');

var packageJson = require('../../package.json');

var _baseRequest = request.defaults({
    headers: {
        // TODO: Override user-agent as well
        'X-Powered-By': packageJson.name + "/" + packageJson.version
    }
});

exports.createSoapClient = function (service, options, callback, debug) {

    options = options || {};

    // Override soap module's request
    options.request = _baseRequest;
    if(debug){  require('request-debug')(options.request);  }

    soap.createClient(service.url, options, function (err, client) {
        if (err) {
            console.error(err);
        }
        callback(err, client);
    });
};