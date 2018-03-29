package main

import (
		"fmt"
		"flag"
		"net/http"
		"io"
		"encoding/json"
		"net/http/httputil"
		"os"
		"github.com/nihalpasham/secautomation/apility"
)

var (	
	 domain   string
	 ip		 string
	 url      string
)

func init() {

	flag.StringVar(&domain, "d", "", "domain to be looked up")
	flag.StringVar(&ip, "ip", "", "IP to be looked up")				
}


func main() {

	flag.Parse()
	c := newClient()

	switch {
		case domain != "":
			fmt.Println("checking domain:", domain)
			res, err := c.domainsearch(domain)
			if err != nil {
				fmt.Printf("Error : %#v\n", err)
				} else {
					b, err := json.MarshalIndent(res, "", "\t")
					if err == nil {
					fmt.Println(string(b))
					}	
				}
		case ip != "":
			fmt.Println("checking ip:", ip)
			res, err := c.ipsearch(ip)
			if err != nil {
				fmt.Printf("Error : %#v\n", err)
			} else {
				b, err := json.MarshalIndent(res, "", "\t")
				if err == nil {
					fmt.Println(string(b))
				}
			}
		}

}