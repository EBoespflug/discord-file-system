/**
 * This file contains the logic for the 'download' command.
 */


 const Buffer = require("buffer").Buffer;
 const main = require("./main.js");
 const util = require("./util.js");
 const request = require(`request`);
 const fs = require("fs");

// Download

function load_chunk(channel, record, message_id, files, chunk_id, finish_callback) {

    util.cprint(`downloading ${record.name} [${chunk_id}/${record.messages}  ${Math.ceil(chunk_id / record.messages)}%] `);

    channel.messages.fetch(message_id).then(message => {
        // Get attachments.

        const aList = (message.attachments).values();

        if(aList === undefined || aList === null)  exit(1);

        attachments = []
        for(const item of aList) {
            //console.log("url = " + item.url);
            attachments.push(item.url);
        }

        files = attachments.concat(files)

        // Next message.
        reg = /\[(.+)\] \[(.+)\] \[(.+)\]: (.*)/;
        matched = message.content.match(reg);

        if(matched.length != 5) {
            util.cprint("");
            console.error("error: unexpected parsing: " + matched);
        }
        if(matched[1] != record.id) {
            util.cprint("");
            console.log("warning: invalid file id '" + matched[1] + "' expected '" + record.id + "'.");
        }

        //if(trace_all)            console.log(`dowloading ${record.id} chunk ${matched[2]} (step: ${chunk_id})`)
        next_message_id = matched[3];


        if(matched[2] === 0 || next_message_id === "ROOT") { // First chunk
            finish_callback(chunk_id, files);
            return;
        }
        else
            load_chunk(channel, record, next_message_id, files, chunk_id + 1, finish_callback);

        
    }).catch(console.error);
}

function download_attachments(channel, conf, record, urls, files, buffer, file_id, finish_callback) {
    if(file_id >= urls.length) {
        finish_callback(buffer);
        return;
    }
    url = urls[file_id];
    dest = ".dfs/part" + file_id.toString();

    request(url, { encoding: null }, (err, resp, new_buffer) => {
        if(err) {
            console.log(clear_line + "\rerror occured " + err);
            exit(1);
        }
        
        if(buffer == null) {
            buffer = new_buffer;
        } else {
            buffer = Buffer.concat([buffer, new_buffer]);
        }

        download_attachments(channel, conf, record, urls, files, buffer, file_id + 1, finish_callback);
    });
    
}

function download(channel, args, conf, indexes, finish_callback) {
    id = args["file"];
    
    if(!(id in indexes)) {
        finish_callback(`cannot find the file with id '${id}'.`);
        return;
    }

    record = indexes[id];
    if(main.debug) console.log(JSON.stringify(record));
    if(record === undefined || record.id !== id) {
        finish_callback("bad encoding.");
        return(2);
    }

    process.stdout.write(`loading file: ${id}...`);
    load_chunk(channel, record, record.last_message_id, [], 0, function(chunk_id, urls) {

        download_attachments(channel, conf, record, urls, [], null, 0, function(buffer) {
            fs.writeFile(args["path"], buffer, function() {
                util.cprint("");
                console.log("saved " + record.name + " at " + args["path"] + ".")
                finish_callback();
            });
        });
    });
}



module.exports = { download };