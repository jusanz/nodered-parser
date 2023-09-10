package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/rs/cors"
)

type Node struct {
	ID           string     `json:"id"`
	Type         string     `json:"type"`
	Label        string     `json:"label,omitempty"`
	Z            string     `json:"z,omitempty"`
	Name         string     `json:"name,omitempty"`
	Props        []Prop     `json:"props,omitempty"`
	Wires        [][]string `json:"wires,omitempty"`
	Rules        []Rule     `json:"rules,omitempty"`
	Property     string     `json:"property,omitempty"`
	PropertyType string     `json:"propertyType,omitempty"`
	Count        string     `json:"count,omitempty"`
	Finalized    string     `json:"finalized,omitempty"`
	Func         string     `json:"func,omitempty"`
	Initialize   string     `json:"initialize,omitempty"`
	Libs         []string   `json:"libs,omitempty"`
	NoErr        int        `json:"noerr"`
	Outputs      int        `json:"outputs"`

	Tab string `json:"-"`
}

type Prop struct {
	P  string `json:"p,omitempty"`
	VT string `json:"vt,omitempty"`
}

type Rule struct {
	P   string `json:"p,omitempty"`
	PT  string `json:"pt,omitempty"`
	T   string `json:"t,omitempty"`
	TO  string `json:"to,omitempty"`
	TOT string `json:"tot,omitempty"`
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/flows-json-text", flowsJsonTextHandler)
	mux.HandleFunc("/nodes", nodesHandler)
	mux.HandleFunc("/nodes/", nodeDetailHandler)
	go func() {
		c := cors.New(cors.Options{
			AllowedOrigins: []string{"http://app:3000"},
		})
		handler := c.Handler(mux)

		log.Fatal(http.ListenAndServe(":8080", handler))
	}()
	select {}
}

func flowsJsonTextHandler(w http.ResponseWriter, r *http.Request) {
	s, err := os.ReadFile("/tmp/node-red-data/flows.json")
	if err != nil {
		log.Fatal(err)
	}
	w.Write(s)
	return
}

func readNodes() ([]Node, error) {
	s, err := os.ReadFile("/tmp/node-red-data/flows.json")
	if err != nil {
		return nil, err
	}

	var nodes []Node
	if err := json.Unmarshal(s, &nodes); err != nil {
		return nil, err
	}

	tabs := make(map[string]string)
	for _, node := range nodes {
		if node.Type == "tab" {
			tabs[node.ID] = node.Label
		}
	}

	var _nodes []Node
	for _, node := range nodes {
		if node.Type != "tab" {
			node.Tab = tabs[node.Z]
		} else {
			node.Tab = node.Label
		}
		_nodes = append(_nodes, node)
	}
	nodes = _nodes

	return nodes, nil
}

func nodesHandler(w http.ResponseWriter, r *http.Request) {
	nodes, err := readNodes()
	if err != nil {
		log.Fatal(err)
	}

	nodesFilterHandler(w, r, nodes)
	return
}

func nodesFilterHandler(w http.ResponseWriter, r *http.Request, nodes []Node) {
	q := r.URL.Query()

	if q.Get("id") != "" {
		var _nodes []Node
		for _, node := range nodes {
			if node.ID == q.Get("id") {
				_nodes = append(_nodes, node)
			}
		}
		nodes = _nodes
	}

	if q.Get("type") != "" {
		var _nodes []Node
		for _, node := range nodes {
			if node.Type == q.Get("type") {
				_nodes = append(_nodes, node)
			}
		}
		nodes = _nodes
	}

	if q.Get("name") != "" {
		var _nodes []Node
		for _, node := range nodes {
			if strings.Contains(node.Name, q.Get("name")) {
				_nodes = append(_nodes, node)
			}
		}
		nodes = _nodes
	}

	if q.Get("tab") != "" {
		var _nodes []Node
		for _, node := range nodes {
			if strings.Contains(node.Tab, q.Get("tab")) {
				_nodes = append(_nodes, node)
			}
		}
		nodes = _nodes
	}

	s, err := json.Marshal(nodes)
	if err != nil {
		log.Fatal(err)
	}

	w.Write(s)
	return
}

func nodeDetailHandler(w http.ResponseWriter, r *http.Request) {
	p := strings.Split(r.URL.Path, "/")
	if len(p) != 4 {
		w.WriteHeader(http.StatusNotFound)
		response := map[string]string{"error": "Not found"}
		s, err := json.Marshal(response)
		if err != nil {
			log.Fatal(err)
		}
		w.Write(s)
		return
	}

	id := p[2]
	if p[3] == "downstream-nodes" {
		downstreamNodesHandler(w, r, id)
		return
	} else if p[3] == "upstream-nodes" {
		upstreamNodesHandler(w, r, id)
		return
	} else {
		w.WriteHeader(http.StatusNotFound)
		response := map[string]string{"error": "Not found"}
		s, err := json.Marshal(response)
		if err != nil {
			log.Fatal(err)
		}
		w.Write(s)
		return
	}
}

func downstreamNodesHandler(w http.ResponseWriter, r *http.Request, id string) {
	nodes, err := readNodes()
	if err != nil {
		log.Fatal(err)
	}

	relations := make(map[string][]string)
	for _, node := range nodes {
		for _, wire := range node.Wires {
			for _, wireID := range wire {
				relations[node.ID] = append(relations[node.ID], wireID)
			}
		}
	}

	node_ids := make(map[string]bool)
	var addNodes func(id string)
	addNodes = func(id string) {
		for _, _id := range relations[id] {
			node_ids[_id] = true
			addNodes(_id)
		}
	}
	addNodes(id)

	var _nodes []Node
	for _, node := range nodes {
		for _id := range node_ids {
			if node.ID == _id {
				_nodes = append(_nodes, node)
			}
		}
	}

	nodesFilterHandler(w, r, _nodes)
	return
}

func upstreamNodesHandler(w http.ResponseWriter, r *http.Request, id string) {
	nodes, err := readNodes()
	if err != nil {
		log.Fatal(err)
	}

	relations := make(map[string][]string)
	for _, node := range nodes {
		for _, wire := range node.Wires {
			for _, wireID := range wire {
				relations[wireID] = append(relations[wireID], node.ID)
			}
		}
	}

	node_ids := make(map[string]bool)
	var addNodes func(id string)
	addNodes = func(id string) {
		for _, _id := range relations[id] {
			node_ids[_id] = true
			addNodes(_id)
		}
	}
	addNodes(id)

	var _nodes []Node
	for _, node := range nodes {
		for _id := range node_ids {
			if node.ID == _id {
				_nodes = append(_nodes, node)
			}
		}
	}

	nodesFilterHandler(w, r, _nodes)
	return
}
