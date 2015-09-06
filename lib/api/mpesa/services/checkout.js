/**
 *  Copyright (c) 2015 Salama AB
 *  All rights reserved
 *  Contact: aksalj@aksalj.me
 *  Website: http://www.aksalj.me
 *
 *  Project : pesajs
 *  File : checkout
 *  Date : 9/5/15 2:34 PM
 *  Description : M-PESA G2 API; DEVELOPERS GUIDE - LIPA NA M-PESA ONLINE CHECKOUT v 2.0
 *
 *  1.	The Merchant captures the payment details and prepares call to the SAG’s endpoint.
 *  2.	The Merchant invokes SAG’s processCheckOut interface.
 *          The SAG validates the request sent and returns a response.
 *  3.	Merchant receives the processCheckoutResponse parameters namely TRX_ID, ENC_PARAMS, RETURN_CODE, DESCRIPTION and
 *          CUST_MSG (Customer message).
 *  4.	The merchant is supposed to display the CUST_MSG to the customer after which the merchant should invoke SAG’s
 *          confirmPaymentRequest interface to confirm the transaction
 *  5.	The system will push a USSD menu to the customer and prompt the customer to enter their BONGA PIN and any other
 *          validation information.
 *  6.	The transaction is processed on M-PESA and a callback is executed after completion of the transaction.

 *
 */
'use strict';
var fs = require("fs");
var _ = require("lodash");
var xml2json = require("xml2json");
var json2xml = require("jsontoxml");
var UTF8 = require("crypto-js/enc-utf8");
var SHA256 = require("crypto-js/sha256");
var BASE64 = require("crypto-js/enc-base64");
var Const = require("../constants");

var WSDL = "https://www.safaricom.co.ke/mpesa_online/lnmo_checkout_server.php?wsdl";
var ENDPOINT = "https://www.safaricom.co.ke/mpesa_online/lnmo_checkout_server.php";

var OPERATIONS = [ "LNMOResult", "processCheckOut", "transactionStatusQuery", "confirmTransaction"];



var request = Const.BaseRequest;

var _makeRequestXML = function(op, params) {

    var xmlDir = __dirname + "/xml/checkout/";
    var xmlContent = null;
    var json = null;
    var parseOpts = {
        object: true,
        reversible: true
    };


    // SOAP Header
    var header = {
        MERCHANT_ID: Const.MERCHANT.ID,
        TIMESTAMP: params.TIMESTAMP,
        REFERENCE_ID: params.REFERENCE_ID || null,
        PASSWORD: BASE64.stringify(
            UTF8.parse(
                SHA256(
                    Const.MERCHANT.ID + Const.MERCHANT.PassKey + params.TIMESTAMP
                ).toString().toUpperCase()
            )
        )
    };


    switch (op) {
        case OPERATIONS[1]:

            xmlContent = fs.readFileSync(xmlDir + "checkoutRequest.xml");
            json = xml2json.toJson(xmlContent, parseOpts);
            json['soapenv:Envelope']['soapenv:Body']['tns:processCheckOutRequest'] = {"BK":{}}; // FIXME: Find a better way

            break;
        case OPERATIONS[2]:

            xmlContent = fs.readFileSync(xmlDir + "statusRequest.xml");
            json = xml2json.toJson(xmlContent, parseOpts);
            json['soapenv:Envelope']['soapenv:Body']['tns:transactionStatusRequest'] = {"BK":{}}; // FIXME: Find a better way

            break;
        case OPERATIONS[3]:

            xmlContent = fs.readFileSync(xmlDir + "confirmationRequest.xml");
            json = xml2json.toJson(xmlContent, parseOpts);
            json['soapenv:Envelope']['soapenv:Body']['tns:transactionConfirmRequest'] = {"BK":{}}; // FIXME: Find a better way

            break;
    }

    if(json) {
        // Clear header
        json['soapenv:Envelope']['soapenv:Header']['tns:CheckOutHeader'] = {"HK":{}};

        return xml2json.toXml(json)
            .replace("<HK></HK>", json2xml(header))
            .replace("<BK></BK>", json2xml(params));
    }

    return null;
};

var _parseResponseXML = function(op, xml) {

    var data = null;
    try {
        var json = xml2json.toJson(xml,{object: true});
        var body = json["SOAP-ENV:Envelope"]["SOAP-ENV:Body"];

        switch (op) {
            case OPERATIONS[0]:

                break;
            case OPERATIONS[1]:
                var response = body["ns1:processCheckOutResponse"];
                data = {
                    code: parseInt(response['RETURN_CODE']),
                    description: response['DESCRIPTION'],
                    transaction: response['TRX_ID'],
                    message: response['CUST_MSG']
                };

                break;
            case OPERATIONS[2]:


                break;
            case OPERATIONS[3]:


                break;
        }

        if(data.code != 0){
            data.error = new Const.Error(data.code, data.description);
        }

    } catch(er) {
        data = {
            error: er
        };
    }

    return data;
};


exports = module.exports = {
    name: "Lipa Na M-PESA Online Checkout",

    /**
     * Send a request to SAG
     * @param operation
     * @param params
     * @param callback
     */
    trigger: function (operation, params, callback) {

        if(!_.includes(OPERATIONS, operation)){
            throw new Error("Unsupported operation: " + operation + ". Only " + OPERATIONS + " are supported");
        }

        if (operation === OPERATIONS[0]) {
            var data = _parseResponseXML(operation, params);
            var err = (data == null) ? new Error("Failed to parse xml") : null;
            return callback(err, data);
        }



        var xml = _makeRequestXML(operation, params);
        if (xml === null) {
            return callback(new Error("Failed to construct xml"), null);
        }

        if(Const.DEBUG) {
            require('request-debug')(request);
        }
        var opts = {
            url: ENDPOINT,
            body: xml,
            headers: {
                "Content-Type": "text/xml"
            }
        };
        request.post(opts, function(err, resp, body) {
            var data = _parseResponseXML(operation, body);
            if(data) {
                if(data.error) {
                    err = data.error;
                    delete data.error;
                } else {
                    err = err || null;
                }
            } else {
                err = err || new Error("Oops! Something went wrong while parsing SAG response!");
            }
            callback(err, data);
        });
    }



};