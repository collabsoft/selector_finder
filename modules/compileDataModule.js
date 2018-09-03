// This module receives the event target from onLoadModule and sends the result to messageCenter
var compileDataModule = (function () {
    start = new Object();
    node = new Object();
    mapnode = new Object();
    structure = new Array();

    var initialize = function (node, e) {
        stop_event_propagation(e);
        selector_finder(node);
    };

    var stop_event_propagation = function (e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
        }
    };

    var selector_finder = function (n) {
        reset_vars(n);
        build_mapnode_structure();
        var location_path = location_path_builder();
        var selector = selector_builder();
        var check = selector_check(selector);
        location_checker = location_path_checker(start, location_path);
        set_reset_element(selector);
        messageCenter.initialize(start, structure, selector, check, location_path, location_checker);
    };

    var reset_vars = function (init) {
        keyDown = false;
        node = init;
        start = init;
        structure = [];
        log_start(start);
    };

    var log_start = function (start) {
        //console.log("# Investigated Element: #");
        //console.log(start);
        $("*").removeClass("hova_recreate_color");
        $(start).not("#finderUIdiv").addClass("hova_recreate_color");
    };

    var set_reset_element = function (selector) {
        //console.log("Element reset");
        // console.log("Selector Finder: " + selector.replace(/^[\s]*/g,''));
        var counter = sessionStorage.getItem("navigation_counter");
        if (counter == 0) {
            sessionStorage.setItem("start_node", selector);
            sessionStorage.setItem("navigation_counter", 1);
        }
    };

    var build_mapnode_structure = function () {
        while (node.parentNode) {
            initialize_mapnode();
            set_mapnode_tag();
            set_mapnode_id();
            set_mapnode_class();
            set_mapnode_property("alt");
            set_mapnode_property("name");
            set_mapnode_nth_child();
            set_mapnode_nth_of_type_variables();
            insert_mapnode();
        }
    };

    var initialize_mapnode = function () {
        mapnode = {};
    };

    var set_mapnode_tag = function () {
        mapnode.tag = node.localName;
    };

    var set_mapnode_id = function () {
        verify_string(node.id) ? mapnode.id = "#" + escape_characters(node.id) : escape_characters(node.id);
        // console.log(mapnode.id);
    };

    var set_mapnode_class = function () {
        if (verify_string(node.className)) {
            mapnode.class = sanitize_class_names(mapnode);
        } else if (typeof (node.className) == 'string')
            mapnode.class = node.className;
    };

    var set_mapnode_property = function (type) {
        verify_string(node[type]) ? mapnode[type] = "[" + type + "='" + escape_characters(node[type]) + "']" : escape_characters(node[type]);
        // console.log(mapnode[type]);
    };

    var set_mapnode_nth_child = function () {
        var sibling = node.parentNode.firstElementChild;
        var nth_child_count = 1;
        while (sibling != node) { //nth-child
            sibling = sibling.nextElementSibling;
            nth_child_count++;
        }
        mapnode.nth_child = ":nth-child(" + nth_child_count + ")";
        if (nth_child_count === 1)
            mapnode.first_child = ":first-child";
        else
            mapnode.first_child = null;
        if (nth_child_count === node.parentNode.childElementCount)
            mapnode.last_child = ":last-child";
        else
            mapnode.last_child = null;
    };

    var set_mapnode_nth_of_type_variables = function () {
        var count_same_tag_and_class_siblings = 1;
        count_same_tag_siblings = 1;
        count_type = 1;
        sibling = node.parentNode.firstElementChild;
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
        mapnode.nth_of_type = ":nth-of-type(" + count_type + ")";
        mapnode.same_tag_siblings = count_same_tag_siblings - 1;
        mapnode.same_tag_and_class_siblings = count_same_tag_and_class_siblings - 1;
    };

    var insert_mapnode = function () {
        structure.unshift(mapnode);
        node = node.parentNode;
    };

    var verify_string = function (string) {
        if (string && typeof (string) == 'string' && string != 'undefined' && string != '' /*&& !string.match(':') && !string.match(/\[/g)*/)
            return true;
        else return false;
    };

    var escape_characters = function (string) {
        if (string) string = string.replace(/([\[\]\:]+)/g, "\\$1");
        return string;
    };

    var location_path_builder = function () {
        var location_path = '';
        for (var index = 0; index < structure.length; index++) {
            if (index == 0) location_path = structure[index].tag;
            else {
                location_path = location_path + ">" + structure[index].nth_child;
            }
        }
        return location_path;
    };

    var sanitize_class_names = function (mapnode) {
        var classes = "." + node.className.replace(/[\[\]]/g, '').replace(/^\s{2}/, ' ').replace(/  +/g, " ");
        classes = classes.replace(/\s/g, ".").replace(/^\.{2}/, '.');
        classes = classes.replace(".hova_recreate_border", ""); // removes the class added for hover borders and colors
        classes = classes.replace(".hova_recreate_color", "");
        if (classes.endsWith('.')) {
            classes = classes.substring(0, classes.length - 1);
        }
        return classes;
    };

    var location_path_checker = function (start, location_path) {
        var test = document.querySelector(location_path);
        var test_all = document.querySelectorAll(location_path);
        if (test == start && test_all.length == 1)
            var check = true;
        else var check = false;
        return check;
    };

    var selector_builder = function () {
        var selector_array = new Array();
        var selector = "";
        // console.log(structure);
        for (var i = 0; i < structure.length; i++) { // skips [0]-html- and [1]-body-
            if (structure[i].id) {
                selector = selector + " " + structure[i].id;
            } else {
                if (!structure[i].class) { //no class checks :nth_child
                    if (structure[i].same_tag_siblings === 0 && structure[i].same_tag_and_class_siblings === 0)
                        selector = selector + " " + structure[i].tag;
                    else {
                        if (structure[i].first_child)
                            selector = selector + " " + structure[i].tag + structure[i].first_child;
                        else if (structure[i].last_child)
                            selector = selector + " " + structure[i].tag + structure[i].last_child;
                        else selector = selector + " " + structure[i].tag + structure[i].nth_child;
                    }
                } else {
                    var classes = document.querySelectorAll(structure[i].class);
                    if (classes.length > 1) {
                        if (structure[i].same_tag_siblings === 0 && structure[i].same_tag_and_class_siblings === 0)
                            selector = selector + " " + structure[i].class;
                        else {
                            if (structure[i].first_child)
                                selector = selector + " " + structure[i].class + structure[i].first_child;
                            else if (structure[i].last_child)
                                selector = selector + " " + structure[i].class + structure[i].last_child;
                            else selector = selector + " " + structure[i].class + structure[i].nth_child;
                        }
                    } else if (classes.length === 1)
                        selector = selector + " " + structure[i].class;
                }
            }
        }
        // console.log(selector);
        var optimized_selector = selector_optimizer(selector, start);
        return optimized_selector;
    };

    var selector_check = function (selector) {
        var check_array = [];
        try {
            var selector_returns = document.querySelectorAll(selector);
        } catch (err) {
            return false;
        };
        if (selector_returns) {
            if (selector_returns.length > 1)
                check_array[0] = "warn_" + selector_returns.length;
            else if (selector_returns.length === 1)
                if (start === selector_returns[0])
                    check_array[0] = "pass";
                else check_array[0] = "err";
        } else check_array[1] = "err";
        if(/\\/.test(selector)){
            check_array[2] = "warn2";
            console.log(check_array);
            console.log(/\\/.test(selector));
        } 
        is_dynamic(selector) ? check_array[1] = "warn" : check_array[1] = "pass";
        return check_array;
    };


    var is_dynamic = function (string) {
        var regexp = /\d{2}/gm;
        if (regexp.test(string)) return true;
        else return false;
    };

    var selector_optimizer = function (selector, start) {
        //console.log(selector);
        var selector_optimized = selector_trim(selector);
        if (!selector_optimized) selector_optimized = selector;
        return selector_optimized;
    };

    var selector_trim = function (selector) {
        var selector_array = selector.split(' ');
        var selector_short = selector;
        try {
            var results = document.querySelectorAll(selector);
            for (var j = 0; j < selector_array.length; j++) {
                var returns = document.querySelectorAll(selector_short);
                if (selector_short && returns.length === results.length && /* returns.indexOf(start) !== -1*/ inArray(start, returns)) {
                    // console.log(selector_short);
                    var selector_optimized = selector_short;
                    selector_array = selector_short.split(' ');
                } else {
                    selector_array[element.index] = element.value;
                }
                var element = {
                    value: selector_array[j],
                    index: j
                };
                selector_short = exclude_and_stringify(selector_array, element.index);
                // selector_short = selector_short.replace('\\:','\:');
            }
            return selector_optimized;
        } catch (e) {
            console.log(e);
            return selector;
        }
    };

    var inArray = function (element, array) {
        var found = false;
        for (var i = 0; i < array.length; i++) {
            if (element === array[i]) {
                found = true;
                break;
            }
        }
        return found;
    };

    var exclude_and_stringify = function (array, x) { //returns a modified array without affecting the global array
        var local_array = array;
        if (x) local_array[x] = '';
        var string = JSON.stringify(local_array);
        string = string.replace(/[\[\"\]]/g, '').replace(/null/g, '').replace(/\,/g, ' ').replace('\\:','\:');
        return string;
    };

    return {
        initialize: initialize,
        stop_event_propagation: stop_event_propagation
    };
}());
