"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var images = require("images");

var net = require("net");

var parser = require("./core/parse");

var _require = require('./core/render.js'),
    renderCanvas = _require.renderCanvas;

var Request = /*#__PURE__*/function () {
  function Request(options) {
    var _this = this;

    _classCallCheck(this, Request);

    this.method = options.method || 'GET';
    this.host = options.host;
    this.port = options.port || 80;
    this.path = options.path || '/';
    this.body = options.body || {};
    this.headers = options.headers || {};

    if (!this.headers["Content-Type"]) {
      this.headers["Content-Type"] = "application/x-www-form-urlencoded";
    }

    if (this.headers["Content-Type"] === "application/json") {
      this.bodyText = JSON.stringify(this.body);
    } else {
      this.bodyText = Object.keys(this.body).map(function (key) {
        return "".concat(key, "=").concat(encodeURIComponent(_this.body[key]));
      }).join('&');
    }

    this.headers["Content-Length"] = this.bodyText.length;
  }

  _createClass(Request, [{
    key: "send",
    value: function send(connection) {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        var parser = new ResponseParser();

        if (connection) {
          connection.write(_this2.toString());
        } else {
          connection = net.createConnection({
            host: _this2.host,
            port: _this2.port
          }, function () {
            connection.write(_this2.toString());
          });
        }

        connection.on('data', function (data) {
          console.log(data.toString());
          parser.receive(data.toString());

          if (parser.isFinished) {
            resolve(parser.response);
            connection.end();
          }
        });
        connection.on('error', function (err) {
          console.log(err);
          reject(err);
          connection.end();
        });
      });
    }
  }, {
    key: "toString",
    value: function toString() {
      var _this3 = this;

      return "".concat(this.method, " ").concat(this.path, " HTTP/1.1\r\n").concat(Object.keys(this.headers).map(function (key) {
        return "".concat(key, ": ").concat(_this3.headers[key]);
      }).join('\r\n'), "\r\n\r\n").concat(this.bodyText);
    }
  }]);

  return Request;
}();

var ResponseParser = /*#__PURE__*/function () {
  function ResponseParser() {
    _classCallCheck(this, ResponseParser);

    this.WAITING_STATUS_LINE = 0;
    this.WAITING_STATUS_LINE_END = 1;
    this.WAITING_HEADER_NAME = 2;
    this.WAITING_HEADER_SPACE = 3;
    this.WAITING_HEADER_VALUE = 4;
    this.WAITING_HEADER_LINE_END = 5;
    this.WAITING_HEADER_BLOCK_END = 6;
    this.WAITING_BODY = 7;
    this.current = this.WAITING_STATUS_LINE;
    this.statusLine = "";
    this.headers = {};
    this.headerName = "";
    this.headerValue = "";
    this.bodyParser = null;
  }

  _createClass(ResponseParser, [{
    key: "receive",
    value: function receive(string) {
      for (var i = 0; i < string.length; i++) {
        this.receiveChar(string.charAt(i));
      }
    }
  }, {
    key: "receiveChar",
    value: function receiveChar(_char) {
      if (this.current === this.WAITING_STATUS_LINE) {
        if (_char === '\r') {
          this.current = this.WAITING_HEADER_LINE_END;
        } else {
          this.statusLine += _char;
        }
      } else if (this.current === this.WAITING_STATUS_LINE_END) {
        if (_char === '\n') {
          this.current = this.WAITING_HEADER_NAME;
        }
      } else if (this.current === this.WAITING_HEADER_NAME) {
        if (_char === ':') {
          this.current = this.WAITING_HEADER_SPACE;
        } else if (_char === '\r') {
          this.current = this.WAITING_HEADER_BLOCK_END;

          if (this.headers['Transfer-Encoding'] === 'chunked') {
            this.bodyParser = new TrunkedBodyParser();
          }
        } else {
          this.headerName += _char;
        }
      } else if (this.current === this.WAITING_HEADER_SPACE) {
        if (_char === ' ') {
          this.current = this.WAITING_HEADER_VALUE;
        }
      } else if (this.current === this.WAITING_HEADER_VALUE) {
        if (_char === '\r') {
          this.current = this.WAITING_HEADER_LINE_END;
          this.headers[this.headerName] = this.headerValue;
          this.headerName = "";
          this.headerValue = "";
        } else {
          this.headerValue += _char;
        }
      } else if (this.current === this.WAITING_HEADER_LINE_END) {
        if (_char === '\n') {
          this.current = this.WAITING_HEADER_NAME;
        }
      } else if (this.current === this.WAITING_HEADER_BLOCK_END) {
        if (_char === '\n') {
          this.current = this.WAITING_BODY;
        }
      } else if (this.current === this.WAITING_BODY) {
        this.bodyParser.receiveChar(_char);
      }
    }
  }, {
    key: "isFinished",
    value: function isFinished() {
      return this.bodyParser && this.bodyParser.isFinished;
    }
  }, {
    key: "response",
    get: function get() {
      this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/);
      return {
        statusCode: RegExp.$1,
        statusText: RegExp.$2,
        headers: this.headers,
        body: this.bodyParser.content.join('')
      };
    }
  }]);

  return ResponseParser;
}();

var TrunkedBodyParser = /*#__PURE__*/function () {
  function TrunkedBodyParser() {
    _classCallCheck(this, TrunkedBodyParser);

    this.WAITING_LENGTH = 0;
    this.WAITING_LENGTH_LINE_END = 1;
    this.READING_TRUNK = 2;
    this.WAITING_NEW_LINE = 3;
    this.WAITING_NEW_LINE_END = 4;
    this.length = 0;
    this.content = [];
    this.isFinished = false;
    this.current = this.WAITING_LENGTH;
  }

  _createClass(TrunkedBodyParser, [{
    key: "receiveChar",
    value: function receiveChar(_char2) {
      if (this.current === this.WAITING_LENGTH) {
        if (_char2 === '\r') {
          if (this.length === 0) {
            this.isFinished = true;
          }

          this.current = this.WAITING_LENGTH_LINE_END;
        } else {
          this.length *= 16; // 不懂

          this.length += parseInt(_char2, 16);
        }
      } else if (this.current === this.WAITING_LENGTH_LINE_END) {
        if (_char2 === '\n') {
          this.current = this.READING_TRUNK;
        }
      } else if (this.current === this.READING_TRUNK) {
        this.content.push(_char2);
        this.length--;

        if (this.length === 0) {
          this.current = this.WAITING_NEW_LINE;
        }
      } else if (this.current === this.WAITING_NEW_LINE) {
        if (_char2 === '\r') {
          this.current = this.WAITING_NEW_LINE_END;
        }
      } else if (this.current === this.WAITING_NEW_LINE_END) {
        if (_char2 === '\n') {
          this.current = this.WAITING_LENGTH;
        }
      }
    }
  }]);

  return TrunkedBodyParser;
}();

_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
  var request, response, dom;
  return regeneratorRuntime.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          request = new Request({
            method: 'POST',
            host: '127.0.0.1',
            port: '8088',
            path: '/',
            headers: {// ["X-Foo2"]: "customed"
            },
            body: {
              name: 'chao'
            }
          });
          _context.next = 3;
          return request.send();

        case 3:
          response = _context.sent;
          // console.log(response)
          dom = parser.parseHTML(response.body); // const viewport = images(600, 800)
          // console.log(dom.children[0].children[5].children[3])
          // render(viewport, dom.children[0].children[5].children[3])

          renderCanvas(dom);

        case 6:
        case "end":
          return _context.stop();
      }
    }
  }, _callee);
}))();
