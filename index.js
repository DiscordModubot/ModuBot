const path = require("path")
const VERSION = "0.0.1"
let TOKEN = ""
let USERNAME = ""
let CONFIG = path.resolve(__dirname, "config.js")
let MODULES = path.resolve(__dirname, "modules/")
let SAFEMODE = false
let QUIET = false
let VERBOSE = false
const HELP = `MultiBot 0.0.1, a bot for discordapp.com.
Usage: node index.js [OPTIONS]...

Options:
			-h, --help					Display this message
			-v, --version				Display the program's version
			-t, --token					Supply the token for the bot
			-c, --config				Supply the location for the configuration file
			-m, --modules				Supply the location directory for the modules
			-u, --username				Supply the username to change to on startup
			-s, --safemode				Run the application with no modules
			-q, --quiet					Run the application with no display
			-V, --verbose				Run the application as verbose
			
Toshimonster 2018
`

optioncheck:
	let optioncont = false
	process.argv = process.argv.slice(2)
	process.argv.forEach((value, index) => {
	
		if (optioncont) {
			optioncont = false
		} else if (value.startsWith("-")) {
			option = value.slice(1)
			
			switch (option) {
				
				case "h":
				case "-help":
					console.log(HELP)
					break;
					
				case "v":
				case "-version":
					console.log(VERSION)
					break;
				
				case "t":
				case "-token":
					optioncont = true
					TOKEN = process.argv[index+1]
					break;
				
				case "c":
				case "-config":
					optioncont = true
					CONFIG = path.resolve(process.argv[index+1])
					break;
					
				case "m":
				case "-modules":
					optioncont = true
					MODULES = path.resolve(process.argv[index+1])
					break;
				
				case "u":
				case "-username":
					optioncont = true
					USERNAME = process.argv[index+1]
					break;
				
				case "s":
				case "-safemode":
					SAFEMODE = true
					break;
					
				case "q":
				case "-quiet":
					QUIET = true
					break;
					
				case "V":
				case "-verbose":
					VERBOSE = true
					break;
					
				default:
					console.log("Invalid option '" + option + "'.")
			}
		}
	})
