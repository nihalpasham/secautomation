
# SecOps automation

A few nodejs, python, go tools 

Goals:

	1. To help with quick prototyping
	2. Ease automation efforts 
	3. And a simpler programming style that allows for repurposing. 
	

## sslScan.js

A node script that's essentially a tiny client leveraging the ssllabs api to perform a TLS scan of a given endpoint. It takes 2 command line arguments:

	1. a hostname
	2. and an optional 'checkcache' parameter with the value 'cache'

 Installation: 
 
 	1. Download the script from this repo
	2. Get these dependencies 'querystringify', 'request', async-polling via npm. 
	
Usage: 

	node sslScan.js 'your hostName' and the optional 'checkcache=cache' argument

Notes: 

This script has 2 functions 

	1. newScan: performs a new TLS scan asynchronously i.e. if you dont use the optional 'checkcache=cache' flag, 
		a. A newScan calls on the ssllabs api to perform a new scan. 
		b. A new scan could take anywhere between 3-15 mins, depending on a bunch of different factors. 
		c. A new scan will keep polling for progress (no progress bar) during this time.
		d. Upon completion, a JSON object will be returned. 
	2. fromCache: to fetch a previously scanned result from cache asynchronously, use the 'checkcache=cache' flag. 
		a. If the result is not in cache, an error is returned - 'HTTP error at Cached Result retrieval time'
		b. If the ssllabs api is unavailable or unresponsive, an 'HTTP error at API availability check time' is returned.  
		b. Please refer to the ssllabs API for more info - https://github.com/ssllabs/ssllabs-scan/blob/master/ssllabs-api-docs.md

Lambda: 

	1. This script can be easily adapted to run in a serverless environment with very little modification. 
	2. Unfortunately, I cant show you the exact piece of serverless code. 
	3. But here's a working link that should give you an idea - https://e4jtf0bv84.execute-api.ap-south-1.amazonaws.com/prod_QA/-sslscan?hostname=www.google.com

A screenshot of the resultant JSON object:

![sslscan js readme 4](https://user-images.githubusercontent.com/20253082/39177024-dc580820-47cb-11e8-9d03-73dc17ce6651.png)

