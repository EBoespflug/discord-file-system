/**
 * Main file of DFS, used as a CLI to manage the storage.
 */


require("dotenv").config();
const main = require("./main.js");
const upload = require("./upload.js");
const download = require("./download.js");
const { Client, Intents } = require("discord.js");
const util = require("./util.js");
const fs = require("fs");
const table = require("table");
const { ArgumentParser } = require("argparse");

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] });

/**
 * Parse the command line arguments and returns the corresponding argument dict.
 * @returns the parsed argument dictionnary.
 */
function set_configs() {
    const arg_parser = new ArgumentParser({description: "Discord file system CLI."});
    
    // Subparsers
    subparsers = arg_parser.add_subparsers({title:'commands', dest:"command", description:'valid subcommands',help:'The DFS command to be executed.', metavar:"<command>"});

    // ls
    const parser_ll = subparsers.add_parser("ls", {help:"The 'ls' command allows to list all file in DFS."});
    parser_ll.add_argument("-c", "--config", {help:"Specify a configuration json file containing options & discord's options (default: ./conf.file.).", default:main.conf_file});
    
    // dl 
    const parser_dl = subparsers.add_parser("dl", {help:"The 'download' command allows to download a specific file."});
    parser_dl.add_argument("file", {help:"The id of the file to be downloaded. Use 'll' command to know files ids."});
    parser_dl.add_argument("path", {help:"The file path for the downloaded file."});
    parser_dl.add_argument("-c", "--config", {help:"Specify a configuration json file containing options & discord's options (default: ./conf.file.).", default:main.conf_file});

    // ul 
    const parser_ul = subparsers.add_parser("up", {help:"The 'upload' command allows to upload a local file to your online storage."});
    parser_ul.add_argument("file", {help:"The file to be uploaded."});
    parser_ul.add_argument("-i", "--id", {help:"Specify the id of the file to be uploaded (must be unique)."});
    parser_ul.add_argument("-c", "--config", {help:"Specify a configuration json file containing options & discord's options (default: ./conf.file.).", default:main.conf_file});
    
    let args = arg_parser.parse_args();
    
    return args;
}

// ls command.
function list(indexes, args) {
    rows = [["Name", "Size", "Nodes", "ID", "LMI", "Date"]];

    for(const [k, v] of Object.entries(indexes)) {
        row = [v["name"], util.format_bytes(v["size"]), v["messages"], v["id"], v["last_message_id"], v["date"]];
        rows.push(row);
    }

    let t = table.table(rows, {});

    console.log(t);

}

function handle_command(args) {
     // Open config file.
     fs.readFile(args.config, {encoding: 'utf-8'}, function(err, data) {
        if (err) {
            console.log("error occured when trying to read 'conf.json': " + err);
            process.exit(1);
        }
        var conf = JSON.parse(data);
        if(main.debug) console.log("conf = " + JSON.stringify(conf, null, 4));
        
        // Open database.
        fs.readFile(conf["indexes"], {encoding: 'utf-8'}, function(err, data) {
            let indexes = {};
            if(err) {
                // Ignore.
            } else {
                indexes = JSON.parse(data);
                if(main.debug) console.log("indexes: " + JSON.stringify(indexes, null, 4));
            }            
            
            let cmd = args.command;

            if(cmd === "ls") {
                list(indexes, args);
                return;   
            }
            
            client.on('ready', () => {
                if(main.debug) console.log(`logged in as ${client.user.tag}!`);            
            
                // Load channel 
                client.channels.fetch(conf["save_channel_id"]).then(function (channel) {    
                    // Switch commands.
                    if(cmd === "up") {
                        upload.upload(channel, args, conf, indexes, function(err) {
                            if(err) console.log(err);
                            client.destroy();
                        });
                    } else if(cmd == "dl") {
                        download.download(channel, args, conf, indexes, function(err) {
                            if(err) console.log(err);
                            client.destroy();
                        });
                    } else {
                        console.error(`unknown command '${cmd}'`)
                        process.exit(3);
                    }
                });
            });

            client.login(process.env.CLIENT_TOKEN);
        });
    });
}

// Main.
const args = set_configs();
if(main.debug) console.log(args);

handle_command(args);
