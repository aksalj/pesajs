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

    var xmlTemplate = null;
    var opMethod = null;

    switch (op) {
        case OPERATIONS[1]:
            xmlTemplate = "checkoutRequest.xml";
            opMethod = "tns:processCheckOutRequest";
            break;
        case OPERATIONS[2]:
            xmlTemplate = "statusRequest.xml";
            opMethod = "tns:transactionStatusRequest";
            break;
        case OPERATIONS[3]:
            xmlTemplate = "confirmationRequest.xml";
            opMethod = "tns:transactionConfirmRequest";
            break;
    }

    if(xmlTemplate && opMethod) {
        xmlContent = fs.readFileSync(xmlDir + xmlTemplate);
        json = xml2json.toJson(xmlContent, parseOpts);
        json['soapenv:Envelope']['soapenv:Body'][opMethod] = {"BK": {}}; // FIXME: Find a better way
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
        var response = null;

        if(body.hasOwnProperty("SOAP-ENV:Fault")){
            var fault = body["SOAP-ENV:Fault"];
            data = {
                error: new Const.Error(fault.faultcode, fault.faultstring)
            };
            return data;
        }


        switch (op) {
            case OPERATIONS[0]:
                response = body["ns1:ResultMsg"];

                data = { // FIXME: Seems to be same as OPERATIONS[2]
                    Code: parseInt(response['RETURN_CODE']),
                    Description: response['DESCRIPTION'],

                    Account: response['MSISDN'],
                    Amount: response['AMOUNT'],
                    Date: response['M-PESA_TRX_DATE'],
                    Status: response['TRX_STATUS'],
                    TXN_MPESA: response['TRX_ID'],
                    InternalId: response['M-PESA_TRX_ID'],
                    Transaction: response['MERCHANT_TRANSACTION_ID'],
                    Details: response['ENC_PARAMS']
                };

                break;
            case OPERATIONS[1]:
                response = body["ns1:processCheckOutResponse"];
                data = {
                    Code: parseInt(response['RETURN_CODE']),
                    Description: response['DESCRIPTION'],
                    TXN_MPESA: response['TRX_ID'],
                    Message: response['CUST_MSG'],
                    Details: response['ENC_PARAMS']
                };

                break;
            case OPERATIONS[2]:
                response = body["ns1:transactionStatusResponse"];

                data = {
                    Code: parseInt(response['RETURN_CODE']),
                    Description: response['DESCRIPTION'],

                    Account: response['MSISDN'],
                    Amount: response['AMOUNT'],
                    Date: response['M-PESA_TRX_DATE'],
                    Status: response['TRX_STATUS'],
                    TXN_MPESA: response['TRX_ID'],
                    InternalId: response['M-PESA_TRX_ID'],
                    Transaction: response['MERCHANT_TRANSACTION_ID'],
                    Details: response['ENC_PARAMS']
                };


                break;
            case OPERATIONS[3]:
                response = body["ns1:transactionConfirmResponse"];
                data = {
                    Code: parseInt(response['RETURN_CODE']),
                    Description: response['DESCRIPTION'],
                    TXN_MPESA: response['TRX_ID'],
                    Transaction: response['MERCHANT_TRANSACTION_ID']
                };


                break;
        }

        if(data.Code && data.Code != 0){
            data.error = new Const.Error(data.Code, data.Description);
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