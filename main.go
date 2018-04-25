package main

import (
	"apility"
	"encoding/json"
	"flag"
	"fmt"
)

var (
	domain string
	ip     string
	url    string
)

func init() {
	flag.StringVar(&domain, "d", "", "domain to be looked up")
	flag.StringVar(&ip, "ip", "", "IP to be looked up")
}

func main() {

	flag.Parse()
	c := apility.NewClient()

	switch {
	case domain != "":
		fmt.Println("checking domain:", domain)
		res, err := c.Domainsearch(domain)
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
		res, err := c.IPsearch(ip)
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
