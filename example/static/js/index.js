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

})();