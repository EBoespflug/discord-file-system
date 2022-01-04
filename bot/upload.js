/**
 * This file contains the logic for the 'upload' command.
 */

 const files = require("./indexes.js");
 const main = require("./main.js");
 const util = require("./util.js");
 const path = require("path")
 const fs = require("fs");

 function message_header(record, chunk_id, last_message_id) {
    txt = `[${record.id}] [${chunk_id}] [${last_message_id}]`;
    return txt
}

// Upload 

function create_all_attachments(file_list, data, file_size, file_id, name_prefix, conf, callback)
{
    start_index = file_size * file_id;
    
    if(start_index >= Buffer.byteLength(data))
    {
        callback(file_list);
        return;
    }
    util.cprint("uploading file: partitionning... (" + file_id + "/" + Math.ceil(Buffer.byteLength(data) / file_size).toString() +  ")");

    to_write = data.slice(start_index, start_index + file_size);
    
    chunk_file_name = main.tmp_folder + name_prefix + ".part" + file_id;
    
    fs.writeFile(chunk_file_name, to_write, null, function (err) {      
        if(err !== null) {
            console.log(err);
            return;
        }

        file_list.push(chunk_file_name);
        
        create_all_attachments(file_list, data, file_size, file_id + 1, name_prefix, conf, callback);
    });

}

function upload_chunk(channel, record, last_message, attachment_list, chunk_id, conf, finish_callback)
{
    // compute list.
    util.cprint("uploading file (" + chunk_id + "/" + Math.ceil(attachment_list.length / main.transfert.file_per_message).toString() +  ")");
    msg_attachments = attachment_list.slice(chunk_id * main.transfert.file_per_message, (chunk_id + 1) * main.transfert.file_per_message);

    if(msg_attachments.length <= 0) {
        finish_callback(last_message, chunk_id);
        return;
    }
    
    last_message_id = (chunk_id == 0) ? "ROOT": last_message.id;
    message_string = message_header(record, chunk_id, last_message_id);
    message_content = message_string + ": null";

    options_file_list = []
    msg_attachments.forEach(function (item, idx) {
        options_file_list.push({
            attachment: item,
            name: item
        });

    });

    channel.send({content: message_content, files: options_file_list}).then((posted_message) => {
        upload_chunk(channel, record, posted_message, attachment_list, chunk_id + 1, conf, finish_callback);        
    }).catch(console.error);
}

function upload(channel, args, conf, indexes, finish_callback) {
    var CHUNK_SIZE = main.transfert.file_block_size;
    var stats = fs.statSync(args["file"]);
    if(main.debug) console.log(JSON.stringify(stats, null, 4));

    fs.readFile(args["file"], function(err, data) {
        if(err) {
            console.error(err);
            return;
        }
        
        // Create record.
        var id = args["id"];
        if(id !== undefined && (id in indexes)) {
            finish_callback(`error: file with ${id} already exists, please remove the record before.`);    
            return;        
        }
        record = new files.FileRecordInfo(path.basename(args["file"]), args["file"], (id === undefined) ? files.get_available_id(indexes) : id, stats["size"]);
        record.stats = stats;

        last_message = null;
        
        process.stdout.write("uploading file: partitioning...");
        create_all_attachments([], data, CHUNK_SIZE, 0, "file", conf, function(attachment_list) {
            upload_chunk(channel, record, last_message, attachment_list, 0, conf, function(last_message, chunk_count) {
                record.messages = chunk_count;
                record.last_message_id = last_message.id;
                
                indexes[record.id] = record;
                files.save_indexes(conf["indexes"], indexes, () => {
                    util.cprint("");
                    console.log("uploaded " + record.name + " (id=" + record.id + ").")
                    finish_callback();
                });                
            })
        });
    });
}


module.exports = { upload };