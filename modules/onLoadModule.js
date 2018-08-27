/* Copyright by Claudio De Angelis, ReCreateIdeas 2018
The use of this code is free and open to any third party.
It is not nevertheless not authorized the reproduction in any case whatsoev..

JUST KIDDING!! do whatever you want with it I hope it's useful.
*/


// This module injects the css and scripts tags as well as attaching all thge event listeners
var onLoadModule = (function () {
    var keyDown = false;
    var container = document.createElement("div");
    container.id = "finderUIdiv";
    var modal = document.createElement("iframe");
    modal.id = "finderUIWrapper";
    modal.name = "finderUIWrapper";
    modal.role = "dialog";
    modal.style = "display:none;";
    modal.src = chrome_extension+"/html/iframe.html";
    var my_css = document.createElement("link");
    my_css.id = "smallstyle";
    my_css.rel = "stylesheet";
    my_css.type = "text/css";
    my_css.href = chrome_extension+"/css/recreate_smallstyle.css";
    var load_tags = function () {
        document.getElementsByTagName("head")[0].appendChild(my_css);
        document.getElementsByTagName("body")[0].appendChild(modal);

        $(document).ready(function (e) {
            $("*").keydown(function (e) {
                if (e.which == 18) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    // console.log(keyDown);
                    keyDown = true;
                    return false;
                }
            });
            $("*").keyup(function (e) {
                if (e.which == 18) {
                    // console.log('keyup');
                    keyDown = false;
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    $('*').removeClass("hova_recreate_border");
                    $('*').removeClass("hova_recreate_color");
                    return false;
                }
            });

            $("*").not("#finderUIWrapper").on("mouseover", function (e) {
                if (keyDown == true) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    $(this).addClass("hova_recreate_border");
                    return false;
                }
            }).on("mouseout", function (e) {
                $(this).removeClass("hova_recreate_border");
            });

            $("*").on("click", function (e) {
                if (keyDown == true) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    // console.log('clicked');
                    // keyDown = false;
                    compileDataModule.initialize(this, e);
                    return false;
                }
            });


            console.log("...Selector Finder is running...");
        });
        // console.log("Selector Finder: onloadModule initialsed!");
    };

    sessionStorage.setItem("navigation_counter", 0);
    return {
        initialize: load_tags
    };
}());

onLoadModule.initialize();
