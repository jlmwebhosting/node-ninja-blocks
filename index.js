var request       = require('request');
var uri           = 'https://api.ninja.is/rest/v0/';

/**
 * Ninja Blocks Node Library
 * For interfacing with the Ninja Blocks Platform
 *
 * @module
 */
exports.app = function(opts) {
  var qs = {};

  if (opts.access_token) {
    qs.access_token = opts.access_token;
  } else if (opts.user_access_token) {
    qs.user_access_token = opts.user_access_token;
  }

  return {
    /**
     * Fetches all the user's information. If no callback is provided
     * then more specific information can be requested
     *
     * Example:
     *     app.user(function(err, data) { ... })
     *     app.user().stream(function(err,data){ ... })
     *
     * @param {Function} cb
     * @api public
     */
    user: function(cb) {

      if (typeof cb === "function") {
        var opts = {
          url: uri + 'user',
          method: 'GET',
          qs: qs,
          json: true
        };
        request(opts,function(e,r,b) {
          if (e) cb(e)
          else {
            if (r.statusCode==200) cb(null, b)
            else {
              cb({statusCode:r.statusCode,error:b.error})
            }
          }
        });        
        return;
      }

      return {
        /**
         * Fetches the user's stream
         *
         * Example:
         *     app.user().stream(function(err,data){ ... })
         *
         * @param {Function} cb
         * @api public
         */
        stream: function(cb) {
          var opts = {
            url: uri + 'user/stream',
            method: 'GET',
            qs: qs,
            json: true
          };
          request(opts,function(e,r,b) {
            if (e) cb(e)
            else {
              if (r.statusCode==200) cb(null, b)
              else {
                cb({statusCode:r.statusCode,error:b.error})
              }
            }
          });  
        },
        /**
         * Fetches the user's pucher channel
         *
         * Example:
         *     app.user().pusher_channel(function(err,data){ ... })
         *
         * @param {Function} cb
         * @api public
         */
        pusher_channel: function(cb) {
          var opts = {
            url: uri + 'user/pusherchannel',
            method: 'GET',
            qs: qs,
            json: true
          };
          request(opts,function(e,r,b) {
            if (e) cb(e)
            else {
              if (r.statusCode==200) cb(null, b.data)
              else {
                cb({statusCode:b.id||200,error:b.error})
              }
            }
          });  
        },
      }
    },

    device: function(device) {

      return {
        /**
         * Actuates a device, sending a given `command`.
         *
         * Example:
         *     app.device(a_led_guid).actuate('FFFFFF',function(err) { ... })
         *
         * @param {String} command
         * @param {Function} cb
         * @api public
         */
        actuate: function(command,cb) {
          var opts = {
            url: uri + 'device/'+device,
            method: 'PUT',
            qs: qs,
            json: { DA:command }
          };
          request(opts,function(e,r,b) {
            if (e) cb(e)
            else {
              if (b.result===1) cb(null)
              else cb({statusCode:b.id||200,error:b.error})
            }
          });
        },

        /**
         * Subscribes to a device's data feed.
         * 
         * Optionally `overwrite`s an existing callback `url`
         * Default is false.
         *
         * Example:
         *     app.device(guid).subscribe('example.com',true,function(err) { ... })
         *
         * @param {String} url The url that Ninja Blocks will POST data to
         * @param {Boolean} overwrite If a callback url exists, this flag will force an overwrite
         * @param {Function} cb
         * @api public
         */
        subscribe: function(url,overwrite,cb) {
          if (typeof overwrite === "function") {
            cb = overwrite;
            overwrite = false;
          }
          var opts = {
            url: uri + 'device/'+device+'/callback',
            method: 'POST',
            qs: qs,
            json: { url:url }
          };
          request(opts,function(e,r,b) {
            if (e) cb(e)
            else {
              if (b.result===1) cb(null)
              else if (b.id===409 && overwrite) {
                // A url already exists, let's update it
                var opts = {
                  url: uri + 'device/'+device+'/callback',
                  method: 'PUT',
                  qs: qs,
                  json: { url:url }
                };
                request(opts,function(e,r,b) {
                  if (e) cb(e)
                  else {
                    if (b.result===1) cb(null)
                    else cb({statusCode:b.id||200,error:b.error})
                  }
                });
              }
              else {
                cb({statusCode:b.id||200,error:b.error})
              }
            }
          });
        },

        /**
         * Unubscribes to a device's data feed.
         * 
         * Example:
         *     app.device(guid).unsubscribe(function(err) { ... })
         *
         * @param {Function} cb
         * @api public
         */
        unsubscribe: function(cb) {
          var opts = {
            url: uri + 'device/'+device+'/callback',
            method: 'DELETE',
            qs: qs
          };
          request(opts,function(e,r,b) {
            if (e) cb(e)
            else {
              if (b.result===1) cb(null)
              else {
                cb({statusCode:b.id||200,error:b.error})
              }
            }
          });
        },

        /**
         * Fetches any historical data about this device.
         * Optionally specify the period's `start` and `end`
         * timestamp.
         *
         * Example:
         *     app.device(guid).data(start, end, function(err, data) { ... })
         *
         * @param {Integer|Date} start The timestamp/datetime of the beginning of the period
         * @param {Integer|Date} end the timestamp/datetime of the end of the period
         * @param {Function} cb
         * @api public
         */
        data: function(start, end, cb) {

          if (typeof start === "function") {
            cb = start;
            start = false;
          } else if (typeof end === "function") {
            cb = end;
            end = false;
          }

          if (start instanceof Date) start = start.getTime();
          if (start) qs.from = start;
          if (end instanceof Date) end = end.getTime();
          if (end) qs.to = end;

          var opts = {
            url: uri + 'device/'+device+'/data',
            method: 'GET',
            qs: qs,
            json: true
          };

          request(opts,function(e,r,b) {
            if (e) cb(e)
            else {
              if (b.result===1) cb(null, b.data)
              else cb({statusCode:b.id||200,error:b.error})
            }
          });
        },

        /**
         * Fetches the last heartbeat received by this device.
         *
         * Example:
         *     app.device(guid).last_heartbeat(function(err, data) { ... })
         *
         * @param {Function} cb
         * @api public
         */
        last_heartbeat: function(cb) {
          var opts = {
            url: uri + 'device/'+device+'/heartbeat',
            method: 'GET',
            qs: qs,
            json: true
          };
          request(opts,function(e,r,b) {
            if (e) cb(e)
            else {
              if (b.result===1) cb(null, b.data)
              else cb({statusCode:b.id||200,error:b.error})
            }
          });
        }

      }

    },
    /**
     * Fetched all the user's device details.
     * Optionally specify a device type to return
     *
     * Example:
     *     app.devices('rgbled',function(err, data) { ... })
     *
     * @param {String} type
     * @param {Function} cb
     * @api public
     */
    devices: function(type,cb) {
      
      if (typeof type == "function") {
        cb = type;
      };

      var opts = {
        url: uri + 'devices',
        method: 'GET',
        qs: qs,
        json: true
      };
      request(opts,function(e,r,b) {
        if (e) cb(e)
          else {
            if (b.result===1) {
              if (typeof type == "string") {
                var out = {};
                for (var guid in b.data) {
                  if (b.data.hasOwnProperty(guid) && b.data[guid].device_type===type) {
                    out[guid] = b.data[guid];
                  }
                }
                b.data = out;
              }
              cb(null, b.data)
            }
            else {
              cb({statusCode:b.id||200,error:b.error})
            }
          }
      });
    }
  }
}