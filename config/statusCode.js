// config/HttpStatus.js
class HttpStatus {
  // 1xx Informational
  static CONTINUE = 100;
  static SWITCHING_PROTOCOLS = 101;

  // 2xx Success
  static OK = 200;
  static CREATED = 201;
  static ACCEPTED = 202;
  static NO_CONTENT = 204;

  // 3xx Redirection
  static MOVED_PERMANENTLY = 301;
  static FOUND = 302;
  static NOT_MODIFIED = 304;

  // 4xx Client Errors
  static BAD_REQUEST = 400;
  static UNAUTHORIZED = 401;
  static FORBIDDEN = 403;
  static NOT_FOUND = 404;
  static METHOD_NOT_ALLOWED = 405;
  static CONFLICT = 409;

  // 5xx Server Errors
  static INTERNAL_SERVER_ERROR = 500;
  static NOT_IMPLEMENTED = 501;
  static BAD_GATEWAY = 502;
  static SERVICE_UNAVAILABLE = 503;
}

export default HttpStatus;
