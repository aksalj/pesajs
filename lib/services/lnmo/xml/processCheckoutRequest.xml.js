"use strict";

module.exports = function (data) {
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="tns:ns">
    <soapenv:Header>
        <tns:CheckOutHeader>
            <MERCHANT_ID>${data.merchant}</MERCHANT_ID>
            <REFERENCE_ID>${data.ref}</REFERENCE_ID>
            <PASSWORD>${data.password}</PASSWORD>
            <TIMESTAMP>${data.timestamp}</TIMESTAMP>
        </tns:CheckOutHeader>
    </soapenv:Header>
    <soapenv:Body>
        <tns:processCheckOutRequest>
            <MERCHANT_TRANSACTION_ID>${data.transaction}</MERCHANT_TRANSACTION_ID>
            <REFERENCE_ID>${data.ref}</REFERENCE_ID>
            <AMOUNT>${data.amount}</AMOUNT>
            <MSISDN>${data.account}</MSISDN>
            <!--Optional:-->
            <ENC_PARAMS>${data.details}</ENC_PARAMS>
            <CALL_BACK_URL>${data.callbackUrl}</CALL_BACK_URL>
            <CALL_BACK_METHOD>${data.callbackMethod}</CALL_BACK_METHOD>
            <TIMESTAMP>${data.timestamp}</TIMESTAMP>
        </tns:processCheckOutRequest>
    </soapenv:Body>
</soapenv:Envelope>`;
    
};
        