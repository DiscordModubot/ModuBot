const CONFIG = require(CONFIG)
const Date = new Date

if (VERBOSE) {
	console.verbose = console.log
} else {
	console.verbose = function() {}
}
if (QUIET) {
	console.log = function() {}
}
if (!TOKEN) {
	TOKEN = CONFIG.TOKEN
}
if (!USERNAME) {
	USERNAME = CONFIG.USERNAME
}

let initTime = Date.getTime()
console.log("--INITIALISATION--")

console.verbose("Importing discord.js library")
const discord = require("discord.js")

console.verbose("Importing modules")
let modules = {}
fs.readdirSync(MODULES).forEach(file => {
	console.verbose("Importing " + file)
	modules[file] = eval(fs.readFileSync(file))
})

console.verbose("Creating discord client")
const client = new discord.Client()

console.verbose("Logging into discord client")
client.login(TOKEN)
	.catch(console.error("Invalid Token"))

console.verbose(`Initialisation done, took ${Date.getTime() - inittime}ms`)
