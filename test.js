const { exec } = require("child_process");
const { isEqual } = require("lodash");

const config = require("./config.json");

// Configure automatic server launch
const serverLaunch = true;
// Configure server stdout/stderr redirection
const serverRedirect = false;

// Server connection settings
const URL = "127.0.0.1";
const PORT = config.PORT;

// Define constant test data
const test1Data = {
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
};

const test1Result = {
    price_initial: 150,
    price_monthly: 65,
    tiles: [
        {
            quantity: 5,
            initial: 125,
            monthly: 50,
        },
        {
            quantity: 1,
            initial: 10,
            monthly: 0,
        },
        {
            quantity: 3,
            initial: 15,
            monthly: 15,
        },
    ],
};

const test2Data = {
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
};

const test2Result = {
    price_initial: 85,
    price_monthly: 30,
    tiles: [
        { quantity: 3, initial: 75, monthly: 30 },
        { quantity: 1, initial: 10, monthly: 0 },
    ],
};

async function sendPost(data) {
    // Send request
    let res = await fetch(`http://${URL}:${PORT}/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    }).catch((err) => {
        console.log(`Fetch Error: ${err}`);
    });

    // Return on fetch error
    if (res == undefined) {
        return;
    }

    // Handle error codes
    if (!res.ok) {
        console.log(`Response not OK: ${res.status}`);
        return;
    }

    // Display response
    let body = await res.json();
    console.log(`Response from server:`, body);
    return body;
}

async function test(num, data, expected) {
    try {
        console.log(`\n----------- ${num} -----------`);
        console.log("Testing with data:", data);

        // Try a post request
        let response = undefined;
        response = await sendPost(data);

        // Handle the result
        if (response != undefined) {
            let result = isEqual(response, expected);
            console.log(`Test ${num}: ${result ? "Pass" : "Fail"}`);
            if (!result) {
                console.log("Expected:", expected);
            }
        } else {
            console.log(`Test ${num}: no response`);
        }
    } catch (err) {
        console.log("Caught error:", err);
    }
}

function startServer(redirect = false) {
    let server;

    // Launch the server
    server = exec("node main.js");
    if (server.pid != undefined) {
        // Windows will not have a process id
        console.log(`Server PID: ${server.pid}`);
    } else {
        console.log("Server Launched");
    }

    if (redirect == true) {
        // Redirect stdout
        server.stdout.on("data", (data) => {
            console.log(`Server STDOUT: ${data}`);
        });

        // Redirect stderr
        server.stderr.on("data", (data) => {
            console.error(`Server STDERR: ${data}`);
        });
    }

    return server;
}

async function start() {
    let server;

    // Launch the server if configured
    if (serverLaunch) {
        server = startServer(serverRedirect);
    }

    // After a 1 second delay to let the server load, run two tests
    setTimeout(async () => {
        await test(1, test1Data, test1Result);
        await test(2, test2Data, test2Result);

        if (server != undefined) {
            // Kill the server
            let killed = server.kill();
            console.log(`Server killed: ${killed}`);
        }
    }, 1000);
}

start();
