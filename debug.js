"use strict";
exports.__esModule = true;
var fs = require("fs");
var res = fs.readFileSync("./src/publications.json", "utf8");
console.log(res);
