package apility

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"net/http"
	"net/http/httputil"
	"os"
)

const (
	baseURL = "https://api.apility.net/"
	apiKey  = "" //get an API key from apility.io by signing up
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

func NewClient() *Client {

	c := &Client{
		entryPoint: baseURL,
		c:          http.DefaultClient,
		apiKey:     apiKey,
	}
	return c
}

// Client interacts with the services provided by apility.io
type Client struct {
	c          *http.Client
	entryPoint string
	apiKey     string
}

func (c *Client) domainsearch(domain string) (*DomainSearch, error) {
	var result DomainSearch
	err := c.query("GET", c.entryPoint+"baddomain/"+domain, nil, &result)
	if err != nil {
		fmt.Printf("domain query error : %v\n", err)
		return nil, err
	}
	return &result, nil
}

func (c *Client) ipsearch(ip string) (*IpSearch, error) {
	var result ipSearch
	err := c.query("GET", c.entryPoint+"badip/"+ip, nil, &result)
	if err != nil {
		fmt.Printf("ip query error : %v\n", err)
		return nil, err
	}
	return &result, nil
}

func (c *Client) query(method, url string, body io.Reader, result interface{}) error {

	req, err := http.NewRequest(method, url, body)
	if err != nil {
		return err
	}
	req.Header.Set("Accept", "application/json")
	req.Header.Set("X-Auth-Token", c.apiKey)

	resp, err := c.c.Do(req)

	if err != nil {
		return err
	}
	fmt.Printf("http StatusCode : %#v\n\n", resp.StatusCode)

	if resp.Body != nil {
		defer resp.Body.Close()
	}

	switch resp.StatusCode {
	case 200:
		err = json.NewDecoder(resp.Body).Decode(result)
		if err != nil {
			out, err := httputil.DumpResponse(resp, true)
			if err == nil {
				fmt.Printf("%s\n", string(out))
			}
		}
	case 404:
		fmt.Printf("%v is NOT in any of the blacklists\n", domain)
	default:
		fmt.Printf("Something went wrong! Recheck the domain/ip ...\n\n")
		fmt.Fprintf(os.Stderr, "exiting with StatusCode : %#v ...\n", resp.StatusCode)
		os.Exit(1)
	}
	return nil
}

// DomainSearch holds the full bad domain details if any
type DomainSearch struct {
	Type     string `json:"type"`
	Response struct {
		Domain struct {
			MX          []string `json:"mx"`
			NS          []string `json:"ns"`
			BlacklistMx []string `json:"blacklist_mx"`
			BlacklistNs []string `json:"blacklist_ns"`
			Blacklist   []string `json:"blacklist"`
			score       int      `json:"score"`
		} `json:"domain"`
		Score    int `json:"score"`
		SourceIP struct {
			Score         int      `json:"score"`
			Address       string   `json:"address"`
			IsQuarantined bool     `json:"is_quarantined"`
			Blacklist     []string `json:"blacklist"`
		} `json:"source_ip"`
		IP struct {
			Score         int      `json:"score"`
			Address       string   `json:"address`
			IsQuarantined bool     `json:"is_quarantined"`
			Blacklist     []string `json:"blacklist"`
		} `json:"ip"`
	} `json:"response"`
}

// ipSearch holds the list of all blacklist for a given IP (if any)
type IpSearch struct {
	Type     string   `json:"type"`
	Response []string `json:"response"`
}
