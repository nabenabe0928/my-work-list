import * as fs from "fs"

const res = fs.readFileSync("./src/publications.json", "utf8")
console.log(res)
