const express = require("express");
const bodyParser = require("body-parser");

const config = require("./config.json");

const app = express();

const PORT = config.PORT;

class Loc {
    constructor(x, y) {
        this.x = Number(x);
        this.y = Number(y);
    }
}

class Tile {
    constructor(initial, monthly) {
        this.initial = Number(initial);
        this.monthly = Number(monthly);
    }
}

/**
 * @brief Constructs a mapping between tile ID and its details
 *
 * @param {[[Number, Number]]} tile_costs From request body
 * @returns {Object}
{
    ID: Tile(),
    ...
}
 */
function constructPriceMap(tile_costs) {
    const map = {};

    for (const id in tile_costs) {
        map[id] = new Tile(tile_costs[id][0], tile_costs[id][1]);
    }

    return map;
}

app.use(bodyParser.json());

app.post("/", (req, res) => {
    console.log("Recieved:", req.body);

    // Verify body contents
    const checkArr = [req.body.tile_costs, req.body.tile_layout];
    for (const arr of checkArr) {
        // Check that these are arrays
        if (arr == undefined || !Array.isArray(arr)) {
            console.error(
                "Required body contents are undefined or not an array."
            );
            console.error(typeof arr);
            console.error(arr);
            res.sendStatus(400);
            return;
        }
        // Check that these arrays contain only arrays
        for (const arrarr of arr) {
            if (arrarr == undefined || !Array.isArray(arrarr)) {
                console.error("Layout or Cost arrays do not contain arrays");
                console.error(typeof arrarr);
                console.error(arrarr);
                res.sendStatus(400);
                return;
            }
            // Check that the nested arrays only contain numbers
            for (const num of arrarr) {
                if (!Number.isInteger(Number(num))) {
                    console.error(
                        `Array contents are not all integers: ${arrarr}`
                    );
                    console.error(typeof num);
                    console.error(num);
                    res.sendStatus(400);
                    return;
                }
            }
        }
    }

    const tile_costs = req.body.tile_costs;
    const tile_layout = req.body.tile_layout;

    // Create a map of tile ID's to initial and monthly prices
    const priceMap = constructPriceMap(tile_costs);

    // Assign the x y range of the calculation zone
    let topLeft;
    let bottomRight;
    if (
        req.body.selection_topleft != undefined &&
        req.body.selection_bottomright != undefined
    ) {
        topLeft = new Loc(
            req.body.selection_topleft[0],
            req.body.selection_topleft[1]
        );
        bottomRight = new Loc(
            req.body.selection_bottomright[0],
            req.body.selection_bottomright[1]
        );
    } else {
        topLeft = new Loc(0, 0);
        bottomRight = new Loc(
            tile_layout.length - 1,
            tile_layout[0].length - 1
        );
    }

    // Count the occurances of each tile
    let tiles = {};

    for (let x = topLeft.x; x <= bottomRight.x; x++) {
        for (let y = topLeft.y; y <= bottomRight.y; y++) {
            // Create entry for tile if it does not exist, otherwise add 1
            if (tiles[tile_layout[x][y]] == undefined) {
                tiles[tile_layout[x][y]] = 1;
            } else {
                tiles[tile_layout[x][y]] += 1;
            }
        }
    }

    // Generate the response, assigning tiles to the array using their ID's as the index
    let response = {
        price_initial: 0,
        price_monthly: 0,
        tiles: [],
    };

    for (const key of Object.keys(tiles)) {
        // Fill array to key ID index
        for (let i = 0; i < Number(key); i++) {
            if (response.tiles[i] == undefined) {
                response.tiles[i] = {
                    quantity: 0,
                };
            }
        }
        // Create entry
        let quantity = tiles[key];
        let initial = priceMap[Number(key)].initial * quantity;
        let monthly = priceMap[Number(key)].monthly * quantity;

        response.tiles[Number(key)] = {
            quantity: quantity,
            initial: initial,
            monthly: monthly,
        };

        // Increment overall pricing
        response.price_initial += initial;
        response.price_monthly += monthly;
    }

    console.log("Replied with:", response);

    res.send(JSON.stringify(response));
});

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});
