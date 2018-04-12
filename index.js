const path          = require("path");
const url           = require("url");
const https         = require("https");
const VERSION       = "0.0.1";
const REPOSITORIES  = {
    main : url.parse("https://raw.githubusercontent.com/DiscordModubot/ModuBot_Repository/master/")
};
TOKEN               = "";
USERNAME            = "";
CONFIG              = path.resolve(__dirname, "config.js");
MODULES             = path.resolve(__dirname, "modules/");
SAFEMODE            = false;
QUIET               = false;
VERBOSE             = false;

const HELP      = `MultiBot ${VERSION}, a bot for https://discordapp.com.
Usage: node index.js [OPTIONS]...

Options:
			-h, --help                  Display this message
			-v, --version               Display the program's version
			-l, --list                  List all packages in the repository
			-s, --search                Supply a query to search for in the repository
			-i, --install               Supply a package name or URL to install a module
			-t, --token                 Supply the token for the bot
			-c, --config                Supply the location for the configuration file
			-m, --modules               Supply the location directory for the modules
			-u, --username              Supply the username to change to on startup
			-S, --safemode              Run the application with no modules
			-q, --quiet                 Run the application with no display
			-V, --verbose               Run the application as verbose
			
Toshimonster 2018`;

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    let sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)).toString().padEnd(5, " ") + sizes[i];
}
function list() {
    apicall()
        .then((r) => {
            r = r.filter((v) => {
                return v.name !== "README.md" || v.name !== "MASTER.data"
            });
            r.sort((a,b) => {
                let A = a.name.toUpperCase();
                let B = b.name.toUpperCase();
                if (A < B) return -1;
                if (A > B) return 1;
                return 0;
            });
            let packages = "";
            r.forEach((v) => {
                packages += `${v.name.padEnd(15, " ")} | ${formatBytes(v.size)}\n`
            });
            console.log(`Found ${r.length} packages;\n${packages}`.slice(0, -1))
        })
}

function search(args) {
    apicall(REPOSITORIES.main)
        .then((r) => {
            console.log(r)
        })
}
function install(args) {
    console.log("TODO")
}
function apicall(repository) {
    return new Promise((resolve, reject) => {
        https.get({
            host: repository.host,
            path: repository.path,
            headers: {
                'User-Agent': "discordmodubot"
            }
        }, (res) => {
            res.setEncoding("utf8");
            let body = "";
            res.on("data", (data) => {
                //collect packet
                body += data;
            });
            res.on("end", () => {
                body = JSON.parse(body);
                resolve(body)
            });
        })
            .on("error", reject)
    })
}
let exe = true;
let optioncont = 0;
process.argv = process.argv.slice(2);
process.argv.forEach((value, index) => {
    if (optioncont !== 0) {
        optioncont -= 1
    } else if (value.startsWith("-")) {
        let option = value.slice(1);

        switch (option) {

            case "h":
            case "-help":
                console.log(HELP);
                exe = false;
                break;

            case "v":
            case "-version":
                console.log(VERSION);
                exe = false;
                break;

            case "l":
            case "-list":
                list();
                exe = false;
                break;

            case "s":
            case "-search":
                optioncont = 1;
                search(process.argv.slice(index+1));
                exe = false;
                break;

            case "i":
            case "-install":
                optioncont = Infinity;
                install(process.argv.slice(index+1));
                exe = false;
                break;

            case "t":
            case "-token":
                optioncont = 1;
                TOKEN = process.argv[index + 1];
                break;

            case "c":
            case "-config":
                optioncont = 1;
                CONFIG = path.resolve(process.argv[index + 1]);
                break;

            case "m":
            case "-modules":
                optioncont = 1;
                MODULES = path.resolve(process.argv[index + 1]);
                break;

            case "u":
            case "-username":
                optioncont = 1;
                USERNAME = process.argv[index + 1];
                break;

            case "S":
            case "-safemode":
                SAFEMODE = true;
                break;

            case "q":
            case "-quiet":
                QUIET = true;
                break;

            case "V":
            case "-verbose":
                VERBOSE = true;
                break;

            default:
                console.log(`Invalid option '-${option}'.`);
                exe = false;
        }
    }
});

if (exe) require("./bot.js")();