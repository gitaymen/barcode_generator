"use strict";
var EAN13, pluginName;

EAN13 = (function() {
  EAN13.prototype.settings = {};

  EAN13.prototype.init = function() {
    var checkDigit, code;
    if (!this.number) {
      this.settings.onError.call(this, "Number cannot be null");
      return;
    }
    if (!this.isNumeric(this.number)) {
      this.settings.onError.call(this, "Number must be numeric");
      return;
    }
    if (!this.settings.number) {
      this.settings.prefix = false;
    }
    if (this.number.length === 12) {
      checkDigit = this.generateCheckDigit(this.number);
      this.number += checkDigit;
    }
    if (this.number.length === 13) {
      if (this.validate()) {
        this.settings.onValid.call();
      } else {
        this.settings.onInvalid.call();
      }
      code = this.getCode();
      return this.draw(code);
    } else {
      return this.settings.onError.call(this, "number length is not 12 or 13");
    }
  };

  EAN13.prototype.isNumeric = function(input) {
    return !isNaN(parseFloat(input)) && isFinite(input);
  };

  EAN13.prototype.getCode = function() {
    var countries, digit, encoding, i, leftCode, parts, prefix, raw_number, rightCode, table, tables;
    tables = [[0xd, 0x19, 0x13, 0x3d, 0x23, 0x31, 0x2f, 0x3b, 0x37, 0xb], [0x27, 0x33, 0x1b, 0x21, 0x1d, 0x39, 0x5, 0x11, 0x9, 0x17], [0x72, 0x66, 0x6c, 0x42, 0x5c, 0x4e, 0x50, 0x44, 0x48, 0x74]];
    countries = [0x0, 0xb, 0xd, 0xe, 0x13, 0x19, 0x1c, 0x15, 0x16, 0x1a];
    leftCode = 0;
    rightCode = 0;
    prefix = parseInt(this.number.substr(0, 1), 10);
    encoding = countries[prefix];
    raw_number = this.number.substr(1);
    parts = raw_number.split("");
    i = 0;
    while (i <= 5) {
      table = (encoding >> (5 - i)) & 0x1;
      leftCode *= Math.pow(2, 7);
      digit = parseInt(parts[i], 10);
      leftCode += tables[table][digit];
      i++;
    }
    i = 0;
    while (i <= 5) {
      rightCode *= Math.pow(2, 7);
      digit = parseInt(parts[6 + i], 10);
      rightCode += tables[2][digit];
      i++;
    }
    return [leftCode, rightCode];
  };

  EAN13.prototype.clear = function(context) {
    if (this.settings.background === null) {
      return context.clearRect(0, 0, this.element.width, this.element.height);
    } else {
      context.fillStyle = this.settings.background;
      return context.fillRect(0, 0, this.element.width, this.element.height);
    }
  };

  EAN13.prototype.draw = function(code) {
    var border_height, border_offset, chars, context, divider, height, height_no_padding, i, item_offset, item_width, j, k, key, l, layout, left, len, len1, len2, line, lines, m, mask, offset, prefix, prefix_offset, ref, ref1, ref2, value, width, width_no_padding, x, y;
    layout = {
      prefix_offset: 0.06,
      font_stretch: 0.073,
      border_line_height_number: 0.95,
      border_line_height: 1,
      line_height: 0.9,
      font_size: 0.15,
      font_y: 1.03,
      text_offset: 2
    };
    if (this.settings.prefix) {
      width_no_padding = this.element.width - 2 * this.settings.padding;
      width = width_no_padding - (width_no_padding * layout.prefix_offset);
    } else {
      width = this.element.width - 2 * this.settings.padding;
    }
    if (this.settings.number) {
      height_no_padding = this.element.height - 2 * this.settings.padding;
      border_height = layout.border_line_height_number * height_no_padding;
      height = layout.line_height * border_height;
    } else {
      height_no_padding = this.element.height - 2 * this.settings.padding;
      border_height = layout.border_line_height * height_no_padding;
      height = border_height;
    }
    item_width = width / 95;
    if (!this.element.getContext) {
      this.settings.onError.call(this, "canvas context is null");
      return;
    }
    context = this.element.getContext("2d");
    this.clear(context);
    context.fillStyle = this.settings.color;
    if (this.settings.number && this.settings.prefix) {
      left = this.element.width * layout.prefix_offset + this.settings.padding;
    } else {
      left = this.settings.padding;
    }
    context.fillRect(left, this.settings.padding, item_width, border_height);
    left = left + item_width * 2;
    context.fillRect(left, this.settings.padding, item_width, border_height);
    left = left + item_width * 7 * 6;
    i = 0;
    while (i <= 42) {
      if (code[0] % 2) {
        context.fillRect(left, this.settings.padding, item_width, height);
      }
      left = left - item_width;
      code[0] = Math.floor(code[0] / 2);
      i++;
    }
    left = left + (item_width * (7 * 6)) + 3 * item_width;
    context.fillRect(left, this.settings.padding, item_width, border_height);
    left = left + item_width * 2;
    context.fillRect(left, this.settings.padding, item_width, border_height);
    left = left + item_width * 7 * 6 + item_width;
    mask = 0x20000000000;
    while (code[1] > 0) {
      if (code[1] % 2) {
        context.fillRect(left, this.settings.padding, item_width, height);
      }
      left = left - item_width;
      code[1] = Math.floor(code[1] / 2);
    }
    left = left + item_width * 7 * 6 + item_width;
    context.fillRect(left, this.settings.padding, item_width, border_height);
    left = left + item_width * 2;
    context.fillRect(left, this.settings.padding, item_width, border_height);
    if (this.settings.number) {
      context.font = layout.font_size * height + "px monospace";
      prefix = this.number.substr(0, 1);
      if (this.settings.prefix) {
        x = this.settings.padding;
        y = border_height * layout.font_y + this.settings.padding;
        context.fillText(prefix, x, y);
      }
      if (this.settings.prefix) {
        prefix_offset = layout.prefix_offset * this.element.width;
      } else {
        prefix_offset = 0;
      }
      border_offset = 6 * item_width;
      offset = this.settings.padding + prefix_offset + border_offset;
      chars = this.number.substr(1, 6).split("");
      for (key = j = 0, len = chars.length; j < len; key = ++j) {
        value = chars[key];
        x = offset;
        y = border_height * layout.font_y + this.settings.padding;
        context.fillText(value, x, y);
        offset += layout.font_stretch * width;
      }
      item_offset = 4 * item_width;
      offset = offset + item_offset;
      ref = this.number.substr(7).split("");
      for (key = k = 0, len1 = ref.length; k < len1; key = ++k) {
        value = ref[key];
        x = offset;
        y = border_height * layout.font_y + this.settings.padding;
        context.fillText(value, x, y);
        offset += layout.font_stretch * width;
      }
    }
    if (this.settings.debug) {
      divider = [3, 3 + 1 * 7, 3 + 2 * 7, 3 + 3 * 7, 3 + 4 * 7, 3 + 5 * 7, 3 + 6 * 7];
      for (x = l = 0, ref1 = width, ref2 = item_width; ref2 > 0 ? l <= ref1 : l >= ref1; x = l += ref2) {
        context.beginPath();
        context.rect(x, 0, 1, border_height);
        context.fillStyle = 'red';
        context.fill();
      }
      lines = [3, 3 + 1 * 7, 3 + 2 * 7, 3 + 3 * 7, 3 + 4 * 7, 3 + 5 * 7, 3 + 6 * 7, 3 + 6 * 7 + 5, 3 + 6 * 7 + 5 + 1 * 7, 3 + 6 * 7 + 5 + 2 * 7, 3 + 6 * 7 + 5 + 3 * 7, 3 + 6 * 7 + 5 + 4 * 7, 3 + 6 * 7 + 5 + 5 * 7, 3 + 6 * 7 + 5 + 6 * 7];
      for (m = 0, len2 = lines.length; m < len2; m++) {
        line = lines[m];
        context.beginPath();
        context.rect(line * item_width, 0, 1, this.element.height);
        context.fillStyle = 'red';
        context.fill();
      }
    }
    return this.settings.onSuccess.call(this, this.number);
  };

  EAN13.prototype.generateCheckDigit = function(number) {
    var chars, counter, j, key, len, value;
    counter = 0;
    chars = number.split("");
    for (key = j = 0, len = chars.length; j < len; key = ++j) {
      value = chars[key];
      if (key % 2 === 0) {
        counter += parseInt(value, 10);
      } else {
        counter += 3 * parseInt(value, 10);
      }
    }
    return (10 - (counter % 10)) % 10;
  };

  EAN13.prototype.validate = function() {
    return parseInt(this.number.slice(-1), 10) === this.generateCheckDigit(this.number.slice(0, -1));
  };

  EAN13.prototype.toBin = function(number) {
    var str;
    str = number.toString(2);
    return '000000000'.substr(str.length) + str;
  };

  function EAN13(element, number1, options) {
    var option;
    this.element = element;
    this.number = number1;
    this.settings = {
      number: true,
      prefix: true,
      color: "#000",
      background: null,
      padding: 0,
      debug: false,
      onValid: function() {},
      onInvalid: function() {},
      onSuccess: function() {},
      onError: function() {}
    };
    if (options) {
      for (option in options) {
        this.settings[option] = options[option];
      }
    }
    this.init();
  }

  return EAN13;

})();

pluginName = null;

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = EAN13;
}
