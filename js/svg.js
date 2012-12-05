/*global Base, window, document, _ */

;(function() {
  "use strict";

  function createElement(type, attributes) {
    var element = document.createElementNS("http://www.w3.org/2000/svg", type);
    _.each(attributes, function(val, key) {
      if (key === 'href' || key === 'xlink:href') {
        element.setAttributeNS('http://www.w3.org/1999/xlink', key, val);
      } else {
        element.setAttribute(key, val);
      }
    });
    return element;
  }

  var svg = Base.extend({
      constructor: function(attributes) {
        this.element = createElement('svg', _.extend({ version: '1.1', xmlns: 'http://www.w3.org/2000/svg' }, attributes || {}));
      },
      rect: function(attributes) {
        var element = createElement('rect', attributes);
        this.element.appendChild(element);
        return element;
      },
      defs: function(attributes) {
        var element = createElement('defs', attributes);
        this.element.appendChild(element);
        return element;
      },
      pattern: function(defs, attributes, image) {
        var pattern = createElement('pattern', attributes);
        if (image) {
          pattern.appendChild(image);
        }
        defs.appendChild(pattern);
        this.element.appendChild(defs);
        return defs;
      },
      image: function(attributes) {
        return createElement('image', attributes);
      },
      path: function(attributes) {
        var element = createElement('path', attributes);
        this.element.appendChild(element);
        return element;
      },
      createElement: createElement
    });


  window.JazSvg = svg;
}());
