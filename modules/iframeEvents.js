const iframeEvents = (() => {
    let display_text = false;

    const stop_event_propagation = e => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
    };

    const send_message = message => {
        parent.postMessage(message, '*');
    };

    const set_custom_selector = selector => {
        $('#test_selector').val(selector);
    };

    const set_check_custom_classes = is_matched => {
        $('#test_selector').removeClass('test_not_passed');
        $('#test_selector').removeClass('test_passed');
        if (is_matched === true) {
            $('#test_selector').addClass('test_passed');
            $('#test_selector').removeClass('test_not_passed');
        } else {
            $('#test_selector').removeClass('test_passed');
            $('#test_selector').addClass('test_not_passed');
        }
    };

    const set_button_classes = ({ parent, prev, next, child }) => {
        $('#nav_parent').addClass(parent.add).removeClass(parent.remove);
        $('#nav_prev').addClass(prev.add).removeClass(prev.remove);
        $('#nav_next').addClass(next.add).removeClass(next.remove);
        $('#nav_child').addClass(child.add).removeClass(child.remove);
    };

    const handle_innertext = response => {
        display_text = !display_text;
        if (display_text) {
            const text = response.payload;
            if (text === '') {
                $('#innertext_btn').html('NO TEXT AVAILABLE');
            } else {
                document.getElementById('innertext_field').innerText = text;
                $('#innertext_btn').html('HIDE');
            }
        } else {
            $('#innertext_btn').html('InnerTExt');
            $('#innertext_field').html('');
        }
    };

    const fade_undefined_fields = () => {
        const fields = document.querySelectorAll('#investigated_element li h5');
        for (const field of fields) {
            if (/undefined/.test(field.innerText)) {
                $(field).addClass('undefined_field');
            } else {
                $(field).removeClass('undefined_field');
            }
        }
    };

    $('.modal-dialog').draggable({
        cursor: 'move',
        handle: '.drag_handle'
    });

    $('.modal-dialog>.modal-content>.drag_handle').css('cursor', 'move');

    $('#test_selector').on('mousedown', e => {
        e.stopPropagation();
        e.stopImmediatePropagation();
    });

    const populate_ui = selectors => {
        const body_row = document.querySelector('#body');
        if (body_row) {
            document.querySelector('#investigated_tag h3').innerText =
                selectors.investigated_tag;
            document.querySelector('#selector').innerHTML = selectors.selector;
            document.querySelector('#selector_check').innerHTML =
                selectors.selector_check;
            document.querySelector('#location_path').innerHTML =
                selectors.location_path;
            document.querySelector('#location_check').innerHTML =
                selectors.location_check;
        } else {
            body_row.innerHTML =
                "<err2>&#x2717; Something went wrong. This doesn't seem to be a reachable element. Please try again</err2>";
        }
    };

    window.addEventListener(
        'message',
        event => {
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
        },
        false
    );

    const investigated_element_HTML = html => {
        let className = 'undefined';
        document.querySelector('#finder_tag').innerText = html.tag;
        document.querySelector('#finder_id').innerText = html.id
            ? html.id.replace(/\\*/g, '')
            : html.id;
        if (html.class && !/^[\s+]+$/.test(html.class)) {
            className = html.class;
        }
        document.querySelector('#finder_class').innerText = className;
        document.querySelector('#finder_alt').innerText = html.alt;
        document.querySelector('#finder_name').innerText = html.name
            ? html.name.replace(/\\*/g, '')
            : html.name;
        document.querySelector('#finder_nthchild').innerText = html.nth_child;
        if (html.first_child) {
            document.querySelector('#finder_nthchild').innerText =
                document.querySelector('#finder_nthchild').innerText +
                ', ' +
                html.first_child;
        }

        if (html.last_child) {
            document.querySelector('#finder_nthchild').innerText =
                document.querySelector('#finder_nthchild').innerText +
                ', ' +
                html.last_child;
        }
        document.querySelector('#finder_nthoftype').innerText =
            html.nth_of_type;
        document.querySelector('#finder_tsiblings').innerText =
            html.same_tag_siblings;
        document.querySelector('#finder_tcsiblings').innerText =
            html.same_tag_and_class_siblings;
        //send message with elements
        fade_undefined_fields();
    };

    const attach_UI_listeners = () => {
        $('#innertext_btn').on('click', e => {
            stop_event_propagation(e);
            send_message({ action: 'innertext' });
        });

        $('#close_x').on('click', e => {
            stop_event_propagation(e);
            close_modal();
        });

        $(document).click(e => {
            if (!$(e.target).closest('.modal-dialog').length) {
                close_modal();
            }
        });

        const reset_ui_content = () => {
            $('#test_selector').val('');
            $('#innertext_field').html('');
            $('#test_selector').removeClass('test_not_passed');
            $('#test_selector').removeClass('test_passed');
            reset_innertext();
        };

        const close_modal = () => {
            reset_ui_content();
            send_message({ action: 'close_modal' });
        };

        const reset_innertext = () => {
            document.getElementById('innertext_field').innerText = '';
            $('#innertext_btn').html('InnerText');
            display_text = false;
        };

        $('#icon').on('click', () => {
            window.open(
                'https://chrome.google.com/webstore/detail/selector-finder/aleacfocnimnddplebbpbfedfagnckcc'
            );
        });

        $('#recreate_bottom_wrapper').on('click', () => {
            window.open('https://github.com/recreateideas');
        });

        $('.nav_button').on('click', e => {
            stop_event_propagation(e);
            const currentTarget = $(e.currentTarget);
            if (!currentTarget.hasClass('negative_node')) {
                send_message({ action: currentTarget.attr('id') });
            }
        });

        $('#test_selector').on('keydown', e => {
            send_message({ action: 'test_selector' });
            $('#test_selector').removeClass('test_passed');
            $('#test_selector').removeClass('test_not_passed');
        });

        $('#check_btn').on('click', e => {
            stop_event_propagation(e);
            send_message({
                action: 'check_btn',
                custom_selector: $('#test_selector').val()
            });
        });

        $('#find_btn').on('click', e => {
            stop_event_propagation(e);
            send_message({
                action: 'find_btn',
                custom_selector: $('#test_selector').val()
            });
        });

        $('#copy_btn').on('click', e => {
            stop_event_propagation(e);
            const selector = document.querySelector('#selector');
            const range = document.createRange();
            range.selectNode(selector);
            window.getSelection().addRange(range);
            document.execCommand('copy');
            document.execCommand('copy');
            window.getSelection().removeAllRanges();
            console.log('..copied to clipboard!');
            const test_string = range.startContainer.innerText.replace(
                /^[\n\s]*/,
                ''
            );
            send_message({
                action: 'check_btn',
                custom_selector: test_string
            });
        });
    };

    return {
        initialize: attach_UI_listeners
    };
})();

$(document).ready(iframeEvents.initialize());
