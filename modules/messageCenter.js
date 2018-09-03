
//This module receives the result from compileDataModule and transmits it to the iframe
var messageCenter = (function () {

  var start, actual_node, selector, check, location, location_checker;

  var iframe_origin = chrome_extension;

  async function initialize(r_start, r_structure, r_selector, r_check_array, r_location, r_checker) {
    selector = r_selector,
      location = r_location,
      start = r_start,
      actual_node = start;
    await Promise.all[get_investigated_element_html(r_structure), get_selector_checks(r_check_array), get_location_path_check(r_checker), detect_surroundings(r_start), get_selectors()];
    display_ui();
  };

  var get_investigated_element_html = function (structure) {
    var element = structure[structure.length - 1];
    var first_child = element.first_child && document.querySelector('#finder_nthchild') ? document.querySelector('#finder_nthchild').innerText + ", " + element.first_child : '';
    var last_child = element.last_child && document.querySelector('#finder_nthchild') ? document.querySelector('#finder_nthchild').innerText + ", " + element.last_child : '';
    var message = {
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
        same_tag_and_class_siblings: element.same_tag_and_class_siblings,
      }
    };
    send_message(message);
  };

  var get_selector_checks = function (check_array) {
    switch (check_array[0]) {
      case "pass":
        var check_str = "<pass>&#x2713;  this query points to the Investigated Element</pass><br>";
        break;
      case "err":
        var check_str = "<err>&#x2717;  this query is broken </err><br>";
        break;
      default:
        var check_str = "<warn>&#x26a0;  this query has returned " + check_array[0].split('_')[1] + " elements </warn><br>";
        break;
    }
    switch (check_array[1]) {
      case "pass":
        var dynamic_str = "<pass>&#x2713;  this query doesn't seem to be dynamic.Happy days!</pass><br>";
        break;
      case "warn":
        var dynamic_str = "<warn>&#x26a0;  this query is porbably dynamic, pay attention</warn><br>";
        break;
      // case "warn2":
      //   var dynamic_str = "";
      //   break;
      case "err":
        var dynamic_str = "<err>&#x2717;  this query is broken </err><br>";
        break;
    }
    if(check_array[2] && check_array[2] === "warn2") check_str += "<warn>&#x26a0;  this query contains escape characters.</warn><br>"
    check = check_str + dynamic_str + "<br><hr>";
    //send message with checks
    console.log(check);
  };

  var get_location_path_check = function (checker) {
    checker ? location_checker = "<pass>&#x2713;  this path has passed the query check<pass><br>" :
      "<err>&#x2717;  this query is broken</err><br>";
  };

  var detect_surroundings = function (actual_node) {
    var types = [1, 9, 10, 11];
    var parent, prev, next, child;
    if (actual_node.parentElement && actual_node.parentElement.nodeType in types) {
      parent = { add: 'positive_node', remove: 'negative_node' };
    } else {
      parent = { add: 'negative_node', remove: 'positive_node' };
    }
    if (actual_node.previousElementSibling && actual_node.previousElementSibling.nodeType in types) {
      prev = { add: 'positive_node', remove: 'negative_node' };
    } else {
      prev = { add: 'negative_node', remove: 'positive_node' };
    }
    if (actual_node.nextElementSibling && actual_node.nextElementSibling.nodeType in types) {
      next = { add: 'positive_node', remove: 'negative_node' };
    } else {
      next = { add: 'negative_node', remove: 'positive_node' };
    }
    if (actual_node.firstElementChild && actual_node.firstElementChild.nodeType in types) {
      child = { add: 'positive_node', remove: 'negative_node' };
    } else {
      child = { add: 'negative_node', remove: 'positive_node' };
    }
    //send message with classes
    var message = {
      action: 'set_button_classes',
      button_classes: {
        parent,
        prev,
        next,
        child,
      }
    };
    // console.log(message);
    send_message(message);
  };

  var get_selectors = function () {
    $(document).ready(function () {
      var message = {
        action: 'selectors',
        selectors: {
          investigated_tag: "<" + document.querySelector(selector).localName + ">",
          selector: "<h6>" + selector + "</h6>",
          selector_check: check.toLowerCase(),
          location_path: "<h7>" + location.toLowerCase() + "<h7>",
          location_check: location_checker.toLowerCase(),
        }
      };
      send_message(message);
    });
  };

  window.addEventListener("message", function (event) {
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
          // console.log(event.data);
          send_message({ action: "error" });
          break;

      }
    }
  }, false);

  var find_custom_selector = function (custom_selector) {
    try {
      if (custom_selector && custom_selector !== '') {
        var is_matched = tester(custom_selector);
        // console.log(is_matched);
        send_message({ action: 'check_custom_selector', matched: is_matched });
        actual_node = document.querySelector(custom_selector);
        compileDataModule.initialize(actual_node);
      }
    } catch (err) {
      send_message({ action: 'check_custom_selector', matched: false });
    }
  };

  var check_custom_selector = function (custom_selector) {
    try {
      if (custom_selector && custom_selector !== '') {
        var is_matched = tester(custom_selector);
        // console.log(is_matched);
        send_message({ action: 'check_custom_selector', matched: is_matched });
      }
    } catch (err) {
      send_message({ action: 'check_custom_selector', matched: false });
    }
  };

  var tester = function (string) {
    var element = document.querySelector(string);
    if (actual_node === element) return true;
    else return false;
  };

  var handle_reset = function () {
    var selector = sessionStorage.getItem("start_node");
    var start = document.querySelector(selector);
    // reset_ui_content();
    compileDataModule.initialize(start);
  };

  var handle_new_node = function (node) {
    if (actual_node && node) {
      update_actual_node(node);
    } else {
      send_message({ action: 'no_init' });
    }
  };

  var update_actual_node = function (node) {
    $(actual_node).removeClass("hova_recreate_color");
    actual_node = node;
    compileDataModule.initialize(actual_node);
  };

  var get_element_innerText = function () {
    // send_message({ action: 'innertext', payload: 'text' });
    if (actual_node) {
      var text = actual_node.innerText;
      send_message({ action: 'innertext', payload: text });
    } else {
      send_message({ action: 'no_init' });
    }
  };

  var send_message = function (message) {
    window.frames['finderUIWrapper'].postMessage(message, '*');
  };

  var close_modal = function () {
    document.getElementById('finderUIWrapper').style.display = 'none';
    // $('#finderUIWrapper').hide();
    // document.getElementById('finderUIdiv').style.zIndex = 0;
    sessionStorage.removeItem("start_node");
    sessionStorage.setItem("navigation_counter", 0);
    window.focus();
    $('*').removeClass("hova_recreate_border");
    $('*').removeClass("hova_recreate_color");

    // reset_ui_content();
    // reset_ui_position();
  };

  $(document).click(function (e) {
    if (!$(e.target).closest('#finderUIdiv').length || $(e.target).is('#finderUIdiv')) {
      close_modal();
    }
  });

  var display_ui = function () {
    // document.getElementById('finderUIdiv').style.zIndex = 99999999;
    document.getElementById('finderUIWrapper').style.display = 'block';
  };


  return {
    initialize: initialize
  };
}());
