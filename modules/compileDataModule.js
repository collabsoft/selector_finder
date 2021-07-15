// This module receives the event target from onLoadModule and sends the result to messageCenter
const compileDataModule = (() => {
    let start = {};
    let node = {};
    let mapnode = {};
    let structure = [];

    const stop_event_propagation = e => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
    };

    const reset = init => {
        keyDown = false;
        node = init;
        start = init;
        structure = [];
        $('*').removeClass('hova_recreate_color');
        $(start).not('#finderUIdiv').addClass('hova_recreate_color');
    };

    const set_reset_element = selector => {
        var counter = sessionStorage.getItem('navigation_counter');
        if (counter == 0) {
            sessionStorage.setItem('start_node', selector);
            sessionStorage.setItem('navigation_counter', 1);
        }
    };

    const verify_string = string => !!string && typeof string === 'string';

    const sanitize_class_names = () => {
        const s = `${node.className
            .replace('hova_recreate_border', '')
            .replace('hova_recreate_color', '')
            .replace(/[\[\]]/g, '')
            .replace(/^\s{2}/, ' ')
            .replace(/  +/g, ' ')
            .replace(/\s/g, '.')
            .replace(/^\.{2}/, '.')
            .replace(/\.$/, '')}`;
        return s ? `.${s}` : undefined;
    };

    const insert_mapnode = () => {
        structure.unshift(mapnode);
        node = node.parentNode;
    };

    const escape_characters = (string = '') =>
        string.replace(/([\[\]\:]+)/g, '\\$1');

    const initialize_mapnode = () => {
        mapnode = {};
    };

    const set_mapnode_tag = () => {
        mapnode.tag = node.localName;
    };

    const set_mapnode_id = () => {
        verify_string(node.id)
            ? (mapnode.id = '#' + escape_characters(node.id))
            : escape_characters(node.id);
    };

    const set_mapnode_class = () => {
        if (verify_string(node.className)) {
            mapnode.class = sanitize_class_names(mapnode);
        } else if (typeof node.className == 'string')
            mapnode.class = node.className;
    };

    const set_mapnode_property = type => {
        verify_string(node[type])
            ? (mapnode[type] =
                  '[' + type + "='" + escape_characters(node[type]) + "']")
            : escape_characters(node[type]);
    };

    const selector_optimizer = (selector, start) => {
        let selector_optimized = selector_trim(selector);
        if (!selector_optimized) selector_optimized = selector;
        return selector_optimized;
    };

    const exclude_and_stringify = (array, x) => {
        //returns a modified array without affecting the global array
        const local_array = array;
        if (x) local_array[x] = '';
        let string = JSON.stringify(local_array);
        string = string
            .replace(/\["|""|"\]|"/g, '')
            .replace(/null/g, '')
            .replace(/\,/g, ' ')
            .replace('\\:', ':')
            .replace('\\[', '[')
            .replace('\\]', ']');
        return string;
    };

    const set_mapnode_nth_child = () => {
        let sibling = node.parentNode.firstElementChild;
        let nth_child_count = 1;
        while (sibling != node) {
            //nth-child
            sibling = sibling.nextElementSibling;
            nth_child_count++;
        }
        mapnode.nth_child = ':nth-child(' + nth_child_count + ')';
        if (nth_child_count === 1) {
            mapnode.first_child = ':first-child';
        } else {
            mapnode.first_child = null;
        }
        if (nth_child_count === node.parentNode.childElementCount) {
            mapnode.last_child = ':last-child';
        } else mapnode.last_child = null;
    };

    const set_mapnode_nth_of_type_variables = () => {
        let count_same_tag_and_class_siblings = 1;
        let count_same_tag_siblings = 1;
        let count_type = 1;
        let sibling = node.parentNode.firstElementChild;
        while (sibling) {
            if (sibling === node) count_type = count_same_tag_siblings;
            else if (sibling.localName == node.localName) {
                count_same_tag_siblings++;
                if (sibling.class == node.class) {
                    count_same_tag_and_class_siblings++;
                }
            }
            sibling = sibling.nextElementSibling;
        }
        mapnode = {
            ...mapnode,
            nth_of_type: ':nth-of-type(' + count_type + ')',
            same_tag_siblings: count_same_tag_siblings - 1,
            same_tag_and_class_siblings: count_same_tag_and_class_siblings - 1
        };
    };

    const location_path_builder = () => {
        let location_path = '';
        for (var index = 0; index < structure.length; index++) {
            if (index == 0) location_path = structure[index].tag;
            else {
                location_path =
                    location_path + ' > ' + structure[index].nth_child;
            }
        }
        return location_path;
    };

    const location_path_checker = (start, location_path) => {
        const test = document.querySelector(location_path);
        const test_all = document.querySelectorAll(location_path);
        return test == start && test_all.length == 1;
    };

    const selector_builder = () => {
        let selector = '';
        for (var i = 0; i < structure.length; i++) {
            // skips [0]-html- and [1]-body-
            if (structure[i].id) {
                selector = selector + ' ' + structure[i].id;
            } else if (structure[i].name) {
                selector = selector + ' ' + structure[i].name;
            } else {
                if (!structure[i].class) {
                    //no class checks :nth_child
                    if (
                        structure[i].same_tag_siblings === 0 &&
                        structure[i].same_tag_and_class_siblings === 0
                    )
                        selector = selector + ' ' + structure[i].tag;
                    else {
                        if (structure[i].first_child)
                            selector =
                                selector +
                                ' ' +
                                structure[i].tag +
                                structure[i].first_child;
                        else if (structure[i].last_child)
                            selector =
                                selector +
                                ' ' +
                                structure[i].tag +
                                structure[i].last_child;
                        else
                            selector =
                                selector +
                                ' ' +
                                structure[i].tag +
                                structure[i].nth_child;
                    }
                } else {
                    const classes = document.querySelectorAll(
                        structure[i].class
                    );
                    if (classes.length > 1) {
                        if (
                            structure[i].same_tag_siblings === 0 &&
                            structure[i].same_tag_and_class_siblings === 0
                        )
                            selector = selector + ' ' + structure[i].class;
                        else {
                            if (structure[i].first_child)
                                selector =
                                    selector +
                                    ' ' +
                                    structure[i].class +
                                    structure[i].first_child;
                            else if (structure[i].last_child)
                                selector =
                                    selector +
                                    ' ' +
                                    structure[i].class +
                                    structure[i].last_child;
                            else
                                selector =
                                    selector +
                                    ' ' +
                                    structure[i].class +
                                    structure[i].nth_child;
                        }
                    } else if (classes.length === 1)
                        selector = selector + ' ' + structure[i].class;
                }
            }
        }
        const optimized_selector = selector_optimizer(selector, start);
        return optimized_selector;
    };

    const is_dynamic = string => {
        const regexp = /\d{2}/gm;
        return regexp.test(string);
    };

    const selector_check = selector => {
        const check_array = [];
        let selector_returns;
        try {
            selector_returns = document.querySelectorAll(selector);
        } catch (err) {
            return false;
        }
        if (selector_returns) {
            if (selector_returns.length > 1) {
                check_array[0] = 'warn_' + selector_returns.length;
            } else if (selector_returns.length === 1) {
                if (start === selector_returns[0]) {
                    check_array[0] = 'pass';
                } else {
                    check_array[0] = 'err';
                }
            }
        } else {
            check_array[1] = 'err';
        }
        if (/\\/.test(selector)) {
            check_array[2] = 'warn2';
        }
        is_dynamic(selector)
            ? (check_array[1] = 'warn')
            : (check_array[1] = 'pass');
        return check_array;
    };

    const selector_trim = selector => {
        let selector_array = selector.split(' ');
        let selector_short = selector;
        try {
            let results = document.querySelectorAll(selector);
            for (var j = 0; j < selector_array.length; j++) {
                var returns = document.querySelectorAll(selector_short);
                if (
                    selector_short &&
                    returns.length === results.length &&
                    Array.from(returns).includes(start)
                ) {
                    var selector_optimized = selector_short;
                    selector_array = selector_short.split(' ');
                } else {
                    selector_array[element.index] = element.value;
                }
                var element = {
                    value: selector_array[j],
                    index: j
                };
                selector_short = exclude_and_stringify(
                    selector_array,
                    element.index
                );
            }
            return selector_optimized;
        } catch (e) {
            return selector;
        }
    };

    const build_mapnode_structure = () => {
        while (node.parentNode) {
            initialize_mapnode();
            set_mapnode_tag();
            set_mapnode_id();
            set_mapnode_class();
            set_mapnode_property('alt');
            set_mapnode_property('name');
            set_mapnode_nth_child();
            set_mapnode_nth_of_type_variables();
            insert_mapnode();
        }
    };

    const selector_finder = n => {
        reset(n);
        build_mapnode_structure();
        const location_path = location_path_builder();
        const selector = selector_builder();
        const check = selector_check(selector);
        location_checker = location_path_checker(start, location_path);
        set_reset_element(selector);
        messageCenter.initialize(
            start,
            structure,
            selector,
            check,
            location_path,
            location_checker
        );
    };

    const initialize = (node, e) => {
        if (e) {
            stop_event_propagation(e);
        }
        selector_finder(node);
    };

    return {
        initialize
    };
})();
