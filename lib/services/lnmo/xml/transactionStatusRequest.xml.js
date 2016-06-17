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
        <tns:transactionStatusRequest>
            <!--Optional:-->
            <TRX_ID>${data.mpesa_txn}</TRX_ID>
            <!--Optional:-->
            <MERCHANT_TRANSACTION_ID>${data.transaction}</MERCHANT_TRANSACTION_ID>
        </tns:transactionStatusRequest>
    </soapenv:Body>
</soapenv:Envelope>`;

};