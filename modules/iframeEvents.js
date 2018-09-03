
var iframeEvents = (function () {
    var display_text = false;


    $('.modal-dialog').draggable({
        cursor: 'move',
        handle: '.drag_handle'
    });

    $('.modal-dialog>.modal-content>.drag_handle').css('cursor', 'move');

    $("#test_selector").on("mousedown", function (e) {
        e.stopPropagation();
        e.stopImmediatePropagation();
    });

    var attach_UI_listeners = function () {

        $("#innertext_btn").on("click", function (e) {
            // console.log('click');
            stop_event_propagation(e);
            send_message({ action: 'innertext' });
        });

        $("#close_x").on("click", function (e) {
            stop_event_propagation(e);
            close_modal();
        });

        $(document).click(function (e) {
            if (!$(e.target).closest('.modal-dialog').length) {
                close_modal();
            }
        });

        var close_modal = function () {
            reset_ui_content();
            // reset_ui_position();
            send_message({ action: 'close_modal' });
        };

        var reset_ui_content = function () {
            $("#test_selector").val('');
            $("#innertext_field").html('');
            $('#test_selector').removeClass("test_not_passed");
            $('#test_selector').removeClass("test_passed");
            reset_innertext();
        };

        var reset_innertext = function () {
            document.getElementById('innertext_field').innerText = '';
            $('#innertext_btn').html('InnerText');
            display_text = false;
        };



        $(".nav_button").on("click", function (e) {
            stop_event_propagation(e);
            if (!$(this).hasClass("negative_node")) {
                send_message({ action: $(this).attr('id') });
            }
        });


        $("#test_selector").on("keydown", function (e) {
            //	stop_event_propagation(e);
            send_message({ action: 'test_selector' });
            $('#test_selector').removeClass("test_passed");
            $('#test_selector').removeClass("test_not_passed");
        });


        $("#check_btn").on("click", function (e) {
            stop_event_propagation(e);
            send_message({
                action: 'check_btn',
                custom_selector: $("#test_selector").val(),
            });
        });

        $("#find_btn").on("click", function (e) {
            stop_event_propagation(e);
            send_message({
                action: 'find_btn',
                custom_selector: $("#test_selector").val(),
            });
        });

        $("#copy_btn").on("click", function (e) {
            stop_event_propagation(e);
            var selector = document.querySelector("#selector");
            var range = document.createRange();
            range.selectNode(selector);
            window.getSelection().addRange(range);
            document.execCommand("copy");
            window.getSelection().removeAllRanges();
            console.log("..copied to clipboard!");
            var test_string = range.startContainer.innerText.replace(/^[\n\s]*/, '');
            send_message({
                action: 'check_btn',
                custom_selector: test_string,
            });
        });

    };

    var stop_event_propagation = function (e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
    };


    var send_message = function (message) {
        parent.postMessage(message, '*');
    };

    window.addEventListener("message", function (event) {
        // console.log(event.data);
        switch (event.data.action) {
            case 'innertext':
                handle_innertext(event.data);
                break;
            case 'new_html':
                investigated_element_HTML(event.data.html);
                break;
            case 'selectors':
                populate_ui(event.data.selectors);
                break;
            case 'check_custom_selector':
                set_check_custom_classes(event.data.matched);
                break;
            case 'set_button_classes':
                set_button_classes(event.data.button_classes);
                break;
            case 'set_custom_selector':
                set_custom_selector(event.data.custom_selector);
                break;
            default:
                break;
        }
    }, false);

    var set_custom_selector = function (selector) {
        $("#test_selector").val(selector);
    };

    var set_check_custom_classes = function (is_matched) {
        $('#test_selector').removeClass("test_not_passed");
        $('#test_selector').removeClass("test_passed");
        if (is_matched === true) {
            $('#test_selector').addClass("test_passed");
            $('#test_selector').removeClass("test_not_passed");
        } else {
            $('#test_selector').removeClass("test_passed");
            $('#test_selector').addClass("test_not_passed");
        }
    };

    var set_button_classes = function ({ parent, prev, next, child, }) {
        $("#nav_parent").addClass(parent.add).removeClass(parent.remove);
        $("#nav_prev").addClass(prev.add).removeClass(prev.remove);
        $("#nav_next").addClass(next.add).removeClass(next.remove);
        $("#nav_child").addClass(child.add).removeClass(child.remove);
    };

    var handle_innertext = function (response) {
        display_text = !display_text;
        if (display_text) {
            var text = response.payload;
            if (text === '')
                $('#innertext_btn').html('NO TEXT AVAILABLE');
            else {
                document.getElementById('innertext_field').innerText = text;
                $('#innertext_btn').html('HIDE');
            }
        } else {
            $('#innertext_btn').html('InnerTExt');
            $("#innertext_field").html('');
        }
    };

    var investigated_element_HTML = function (html) {
        var className = 'undefined';
        document.querySelector('#finder_tag').innerText = html.tag;
        document.querySelector('#finder_id').innerText = html.id ? html.id.replace(/\\*/g,'') : html.id;
        if (html.class && !/^[\s+]+$/.test(html.class)) className = html.class;
        document.querySelector('#finder_class').innerText = className;
        document.querySelector('#finder_alt').innerText = html.alt;
        document.querySelector('#finder_name').innerText = html.name ? html.name.replace(/\\*/g,'') : html.name;
        document.querySelector('#finder_nthchild').innerText = html.nth_child;
        if (html.first_child) document.querySelector('#finder_nthchild').innerText = document.querySelector('#finder_nthchild').innerText + ", " + html.first_child;
        if (html.last_child) document.querySelector('#finder_nthchild').innerText = document.querySelector('#finder_nthchild').innerText + ", " + html.last_child;
        document.querySelector('#finder_nthoftype').innerText = html.nth_of_type;
        document.querySelector('#finder_tsiblings').innerText = html.same_tag_siblings;
        document.querySelector('#finder_tcsiblings').innerText = html.same_tag_and_class_siblings;
        //send message with elements
        fade_undefined_fields();
    };

    var fade_undefined_fields = function () {
        var fields = document.querySelectorAll('#investigated_element li h5');
        for (var field of fields) {
            if (/undefined/.test(field.innerText)) {
                $(field).addClass('undefined_field');
            } else {
                $(field).removeClass('undefined_field');
            }
        }
    };

    var populate_ui = function (selectors) {
        var body_row = document.querySelector('#body_row_body');
        if (body_row) {
            document.querySelector('#investigated_tag h3').innerText = selectors.investigated_tag;
            document.querySelector('#selector').innerHTML = selectors.selector;
            document.querySelector('#selector_check').innerHTML = selectors.selector_check;
            document.querySelector('#location_path').innerHTML = selectors.location_path;
            document.querySelector('#location_check').innerHTML = selectors.location_check;
        } else {
            body_row.innerHTML = "<err2>&#x2717; Something went wrong. This doesn't seem to be a reachable element. Please try again</err2>";
        }
    };

    return {
        initialize: attach_UI_listeners
    };
   

}());

$(document).ready(iframeEvents.initialize());
