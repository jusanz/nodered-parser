FROM golang:1.21-alpine

ENV ROOT=/usr/src/app
WORKDIR ${ROOT}

COPY go.mod go.sum ${ROOT}
RUN go mod download && go mod verify

COPY . ${ROOT}
RUN go build -v -o /usr/local/bin/app ${ROOT}/.

CMD ["app"]
