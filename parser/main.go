package main

import (
	"log"
	"net/http"
	"os"

	"github.com/rs/cors"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/flows-json-text", flowsJsonTextHandler)
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
}
