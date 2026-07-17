const { checkContent } = require("./services/contentFilter");

const tests = [
    "I love this project.",
    "You are stupid.",
    "BUY NOW and get FREE MONEY!",
    "Visit https://a.com https://b.com https://c.com",
    "Noooooooooooooooo!!!!"
];

console.log("=== Content Filter Test ===\n");

for (const text of tests) {

    console.log("Input:");
    console.log(text);

    console.log("Result:");
    console.log(checkContent(text));

    console.log("--------------------------");

}