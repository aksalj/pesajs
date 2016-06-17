(function(){

    $("#reference").val("PREMIUM_ELECTRONICS_" + Math.floor((Math.random() * 78346) + 1));

    $("#cart").on("click", function() {
        $("#payment-cart").hide();
        $("#shopping-cart").fadeToggle( "fast");
    });

    $("#btnCheckout").click(function(){
        $("#shopping-cart").slideToggle( "fast", function(){
            $("#payment-cart").slideToggle("fast");
        });
    });

    $("#btnPay").click(function(e) {
        if($(this).hasClass("disabled")) {
            return;
        }

        if($(this).html() === "OK"){
            location.reload();
            return;
        }

        $(this).addClass("disabled");
        $(this).html("Please wait...");
        $("#payment-form").submit();

        e.preventDefault();
    });

    $('#payment-form').submit(function(event) {

        var formData = {};

        var txn = $("#transaction").val();
        var mpesa_txn = $("#mpesa_txn").val();

        var action = (txn !== "" && mpesa_txn !== "") ? "confirm" : "request";
        if(action === "confirm") {
            formData = {
                'transaction' : txn,
                'mpesa_transaction': mpesa_txn
            };

        } else { // is request
            formData = {
                'phone' : '254' + $("#phone").val(),
                'amount': $("#amount").val(),
                'reference': $("#reference").val()
            };
        }

        $.ajax({
            type: 'POST',
            url: '/checkout/' + action,
            data : formData
        }).done(function(data) {

            $("#btnPay").removeClass("disabled");

            if(action === "request") {
                // If no error
                $("#btnPay").html("Confirm");

                $("#transaction").val(data.transaction);
                $("#mpesa_txn").val(data.mpesa_txn);

                $("#phoneNumberInput").fadeToggle("fast", function() {
                    $("#mpesaMsg").html(data.message); // HUH
                });


            } else {
                // If no error, thank you
                $("#mpesaMsg").html(data.message);
                $("#btnPay").html("OK");
            }

        }).error(function(err) {

            var data = err.responseJSON;

            $("#phoneNumberInput").fadeToggle("fast", function() {
                $("#btnPay").removeClass("disabled");
                $("#mpesaMsg").html(data.description || "Oops :(");
                $("#btnPay").html("OK");
            });


        });

        // stop the form from submitting the normal way and refreshing the page
        event.preventDefault();
    });



})();