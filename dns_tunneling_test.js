
// DNS tunneling test Script

const packet = require('dns-packet');
const dgram  = require('dgram');
const tld    = 'google.com';
var str = new String();

if (process.argv.length === 3) {                                                                  // Provide a payload
    var input = Buffer.from(process.argv[2]).toString('base64').replace('=', '_');                // Encode to base64, base64 is the closest option when it comes to compliance with the DNS spec
    console.log("\n ...Size of uncompressed, base64 encoded input is: " + input.length);          // Printing the number of encoded bytes
    for (i = 0;  i < input.length; i+=62) {
          str += input.substr(i, 62) +  ".";                                                      // Transform to the dotted notation
    }
    console.log('\n ...Fully qualified DNS hostname: ', str+=tld);                                // Build a FQDN i.e. well formed DNS hostname
  }
  else {
    console.log("Usage: "  + __filename +  " payload");
    process.exit(-1);
  }

var socket = dgram.createSocket('udp4');                                                           // Use dns-packet and a 3rd party socket abstraction module to send or receive DNS messages
var buff = packet.encode({
              type: 'query',
              id:    1234,
              flags: packet.RECURSION_DESIRED,
              questions: [{
                  type: 'srv',
                  name: str
                }]
            });

socket.on('message', function(message, rinfo) {
   console.log(rinfo);                                                                             // Printing response info
   console.log(packet.decode(message));
})

socket.send(buff, 0, buff.length, 53, '8.8.8.8');
