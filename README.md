# About

This microservice is a little express server that takes an HTTP POST request.

# Installation

## Prereqs

Node.js ~~and a dream~~

## Steps

1. To begin, clone the repository into a new folder.

2. Run `npm install` inside that folder.

## Configuration

To change the port the server runs on, edit the corresponding line in the `config.json` file.

# Usage

To start the server, run `npm start`.

# Communication Contract

## Requesting Data

By default, all requests are to be made to `http:/127.0.0.1:3000/` as HTTP POSTs.
Send your data in the request body and include `application/json` as the `Content-Type` header.

Request bodies are expected to follow the following format:

```js
{
    tile_costs: [[Number, Number]],                       // Initial, Monthly
    tile_layout: [[Number, ...]],                         // Tile ID
    selection_topleft: [Number, Number] || undefined,     // x, y; Optional
    selection_bottomright: [Number, Number] || undefined, // x, y; Optional
}
```

If the server understood your request and found no validation errors, an HTTP response will be returned:

```js
{
    price_initial: Number,
    price_monthly: Number,
    tiles: [
        {
            quantity: Number,
            initial: Number,
            monthly: Number
        },
    ],
}
```

The server will repeat json contained in requests and responses to stdout.

If there is invalid syntax in a request, the server will send a message to stderr with details as to any attempted wrongdoing and send back an HTTP `400` error in response.

Sample request body:

```js
{
    tile_costs: [
        [25, 10],
        [10, 0],
        [5, 5],
    ],
    tile_layout: [
        [0, 1, 0],
        [0, 0, 0],
        [2, 2, 2],
    ],
    selection_topleft: [0, 0],
    selection_bottomright: [1, 1],
}
```

Sample response:

```js
{
    price_initial: 85,
    price_monthly: 30,
    tiles: [
        { quantity: 3, initial: 75, monthly: 30 },
        { quantity: 1, initial: 10, monthly: 0 },
    ],
}
```

Example programmatic request / response code:

```js
fetch("http://127.0.0.1:3000/", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify(/* Your Request Here... */),
})
    .then((res) => res.json())
    .then((data) => {
        // Handle data...
    })
    .catch((err) => {
        console.log(`Fetch Error: ${err}`);
    });
```

# UML Sequence Diagram

![UML Sequence Diagram](/UML.png)
