

var qs = require('querystringify');
var request = require('request');
var AsyncPolling = require('async-polling');

var API  = 'https://api.ssllabs.com/api/v3/';                                                                                                                  // SSLlabs API entry point
var path = [
            'info',                                                                                                                                            // API paths
            'analyze',
            'getEndpointData',
            'getStatusCodes',
            'getRootCerts'];
var queryParams = {
                    host:           'www.ssllabs.com',                                                                                                         // API query parameters
                    publish:        'off',
                    startNew:       'off',
                    fromCache:      'off',
                    all:            'done',
                    ignoreMismatch: 'off'
                  };

checkAvaiability_url  = API + path[0];

queryParams.fromCache = 'on'; queryParams.maxAge = '144'
fromCacheResults_url  = API + path[1] + qs.stringify(queryParams, true);                                                                                       // URL for cached results

queryParams.startNew  = 'on'; queryParams.fromCache = 'off';
newScanResults_url    = API + path[1] + qs.stringify(queryParams, true);                                                                                       // URL for newScan results

delete queryParams.startNew;
inProgressCheck_url   = API + path[1] + qs.stringify(queryParams, true);                                                                                       // URL for polling new scans progress


function fromCache() {                                                                                                                                         // Check API availbility and see if results are in cache. If yes, retreive from cache and log it.
           if  (response.statusCode == 200) {
                     request.get(checkAvaiability_url, function(err, response, body) {
                                      info = JSON.parse(body); 
                                      console.log(info);
                                         request.get(fromCacheResults_url, function(err, res, body) {
                                           cachedResult = JSON.parse(body);
                                           if (res.statusCode == 200 && cachedResult.status == 'READY' && cachedResult.status !== 'ERROR') {                       
                                                console.log(cachedResult);
                                                }
                                           else {
                                                 console.log('HTTP error at Cached Result retrieval time: ', err);
                                                 console.log('HTTP statusCode: ', res && res.statusCode);
                                                 if (res.statusCode == (400||429||500||503||529)) {
                                                      console.log(cachedResult.errors);
                                                    }
                                                  }
                                                });
                                              }
                                  else {
                                        console.log('HTTP error at API availability check time: ', err);
                                        console.log('HTTP statusCode: ', response && response.statusCode); 
                                        }
                                  });

                                }


function newScan() {                                                                                                                                               // Perform a new scan and check progress during the scan. Upon completion, retrieve and log results.
                   request(newScanResults_url, function(err, res, body) {
                     if (res.statusCode == 200) {                    
                          var polling = AsyncPolling(function (end) {
                                              request(inProgressCheck_url, function(err, res, body){
                                              Host = JSON.parse(body);
                                              console.log(Host);
                                              if (Host.status == 'READY' || Host.status == 'ERROR') {
                                                process.exit(-1);
                                              }
                                            });
                                      end();
                                      }, 10000).run();

                                  }
                    else {
                          console.log('HTTP error at New scan results retrieval time: ', err);
                          console.log('HTTP statusCode: ', res && res.statusCode); 
                        }
                   });
              }


fromCache();
newScan();
