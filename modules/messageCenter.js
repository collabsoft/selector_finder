//This module receives the result from compileDataModule and transmits it to the iframe
const messageCenter = (() => {
    let start;
    let actual_node;
    let selector;
    let check;
    let location;
    let location_checker;
    let iframe_origin = chrome_extension;

    const send_message = message => {
        window.frames['finderUIWrapper'].postMessage(message, '*');
    };

    const close_modal = () => {
        document.getElementById('finderUIWrapper').style.display = 'none';
        sessionStorage.removeItem('start_node');
        sessionStorage.setItem('navigation_counter', 0);
        window.focus();
        $('*').removeClass('hova_recreate_border');
        $('*').removeClass('hova_recreate_color');
        // reset_ui_content();
        // reset_ui_position();
    };

    const get_investigated_element_html = structure => {
        const element = structure[structure.length - 1];
        const first_child =
            element.first_child && document.querySelector('#finder_nthchild')
                ? document.querySelector('#finder_nthchild').innerText +
                  ', ' +
                  element.first_child
                : '';
        const last_child =
            element.last_child && document.querySelector('#finder_nthchild')
                ? document.querySelector('#finder_nthchild').innerText +
                  ', ' +
                  element.last_child
                : '';
        const message = {
            action: 'new_html',
            html: {
                tag: element.tag,
                id: element.id,
                class: element.class,
                alt: element.alt,
                name: element.name,
                nth_child: element.nth_child,
                first_child: first_child,
                last_child: last_child,
                nth_of_type: element.nth_of_type,
                same_tag_siblings: element.same_tag_siblings,
                same_tag_and_class_siblings: element.same_tag_and_class_siblings
            }
        };
        send_message(message);
    };

    const get_selector_checks = check_array => {
        let check_str;
        switch (check_array[0]) {
            case 'pass':
                check_str =
                    '<pass>&#x2713;  this query points to the selected node.</pass><br>';
                break;
            case 'err':
                check_str = '<err>&#x2717;  this query is broken </err><br>';
                break;
            default:
                check_str =
                    '<warn>&#x26a0;  this query has returned ' + check_array[0]
                        ? check_array[0].split('_')[1]
                        : 'no' + ' elements </warn><br>';
                break;
        }
        switch (check_array[1]) {
            case 'pass':
                dynamic_str =
                    "<pass>&#x2713;  this query doesn't seem to be dynamic.</pass><br>";
                break;
            case 'warn':
                dynamic_str =
                    '<warn>&#x26a0;  this query is probably dynamic, pay attention</warn><br>';
                break;
            case 'err':
                dynamic_str = '<err>&#x2717;  this query is broken </err><br>';
                break;
        }
        if (check_array[2] && check_array[2] === 'warn2')
            check_str +=
                '<warn>&#x26a0;  this query contains the escape character \\ .</warn><br>';
        check = check_str + dynamic_str + '<br><hr>';
    };

    const get_location_path_check = checker => {
        checker
            ? (location_checker =
                  '<pass>&#x2713;  this path has passed the query check<pass><br>')
            : '<err>&#x2717;  this query is broken</err><br>';
    };

    const detect_surroundings = actual_node => {
        const types = [1, 9, 10, 11];
        let parent;
        let prev;
        let next;
        let child;
        if (
            actual_node.parentElement &&
            actual_node.parentElement.nodeType in types
        ) {
            parent = { add: 'positive_node', remove: 'negative_node' };
        } else {
            parent = { add: 'negative_node', remove: 'positive_node' };
        }
        if (
            actual_node.previousElementSibling &&
            actual_node.previousElementSibling.nodeType in types
        ) {
            prev = { add: 'positive_node', remove: 'negative_node' };
        } else {
            prev = { add: 'negative_node', remove: 'positive_node' };
        }
        if (
            actual_node.nextElementSibling &&
            actual_node.nextElementSibling.nodeType in types
        ) {
            next = { add: 'positive_node', remove: 'negative_node' };
        } else {
            next = { add: 'negative_node', remove: 'positive_node' };
        }
        if (
            actual_node.firstElementChild &&
            actual_node.firstElementChild.nodeType in types
        ) {
            child = { add: 'positive_node', remove: 'negative_node' };
        } else {
            child = { add: 'negative_node', remove: 'positive_node' };
        }
        //send message with classes
        const message = {
            action: 'set_button_classes',
            button_classes: {
                parent,
                prev,
                next,
                child
            }
        };
        send_message(message);
    };

    const get_selectors = () => {
        $(document).ready(() => {
            const message = {
                action: 'selectors',
                selectors: {
                    investigated_tag:
                        '<' + document.querySelector(selector).localName + '>',
                    selector: '<h6>' + selector + '</h6>',
                    selector_check: check.toLowerCase(),
                    location_path: '<h7>' + location.toLowerCase() + '<h7>',
                    location_check: location_checker.toLowerCase()
                }
            };
            send_message(message);
        });
    };

    window.addEventListener(
        'message',
        event => {
            if (event.origin === iframe_origin) {
                switch (event.data.action) {
                    case 'innertext':
                        get_element_innerText();
                        break;
                    case 'nav_prev':
                        handle_new_node(actual_node.previousElementSibling);
                        break;
                    case 'nav_parent':
                        handle_new_node(actual_node.parentElement);
                        break;
                    case 'nav_next':
                        handle_new_node(actual_node.nextElementSibling);
                        break;
                    case 'nav_child':
                        handle_new_node(actual_node.firstElementChild);
                        break;
                    case 'close_modal':
                        close_modal();
                        break;
                    case 'nav_reset':
                        handle_reset();
                        break;
                    case 'check_btn':
                        check_custom_selector(event.data.custom_selector);
                        break;
                    case 'find_btn':
                        find_custom_selector(event.data.custom_selector);
                        break;
                    default:
                        send_message({ action: 'error' });
                        break;
                }
            }
        },
        false
    );

    const find_custom_selector = custom_selector => {
        try {
            if (custom_selector && custom_selector !== '') {
                const is_matched = tester(custom_selector);
                send_message({
                    action: 'check_custom_selector',
                    matched: is_matched
                });
                actual_node = document.querySelector(custom_selector);
                compileDataModule.initialize(actual_node);
            }
        } catch (err) {
            send_message({ action: 'check_custom_selector', matched: false });
        }
    };

    const check_custom_selector = custom_selector => {
        try {
            if (custom_selector && custom_selector !== '') {
                const is_matched = tester(custom_selector);
                send_message({
                    action: 'check_custom_selector',
                    matched: is_matched
                });
            }
        } catch (err) {
            send_message({ action: 'check_custom_selector', matched: false });
        }
    };

    const tester = string => {
        const element = document.querySelector(string);
        return actual_node === element;
    };

    const handle_reset = () => {
        const selector = sessionStorage.getItem('start_node');
        const start = document.querySelector(selector);
        compileDataModule.initialize(start);
    };

    const update_actual_node = node => {
        actual_node = node;
        compileDataModule.initialize(actual_node);
    };

    const handle_new_node = node => {
        if (actual_node && node) {
            update_actual_node(node);
        } else {
            send_message({ action: 'no_init' });
        }
    };

    const get_element_innerText = () => {
        if (actual_node) {
            const payload = actual_node.innerText;
            send_message({ action: 'innertext', payload });
        } else {
            send_message({ action: 'no_init' });
        }
    };

    $(document).click(e => {
        if (
            !$(e.target).closest('#finderUIdiv').length ||
            $(e.target).is('#finderUIdiv')
        ) {
            close_modal();
        }
    });

    const display_ui = () => {
        document.getElementById('finderUIWrapper').style.display = 'block';
    };

    const initialize = (
        r_start,
        r_structure,
        r_selector,
        r_check_array,
        r_location,
        r_checker
    ) => {
        (selector = r_selector),
            (location = r_location),
            (start = r_start),
            (actual_node = start);
        get_investigated_element_html(r_structure);
        get_selector_checks(r_check_array);
        get_location_path_check(r_checker);
        detect_surroundings(r_start);
        get_selectors();
        display_ui();
    };

    return {
        initialize
    };
})();
