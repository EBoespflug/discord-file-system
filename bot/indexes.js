/**
 * Contains function to manipulate the records list.
 */

const main = require("./main.js");
const fs = require('fs');

// Ugly AF
function get_available_id(indexes) {
    found = false;
    
    while(!found) 
    {
        id = Math.floor(Math.random() * 1000000);
        if(!(id in indexes))
        {
            return id;
        }
    }
}

function save_indexes(file_path, records, callback) {
    data = JSON.stringify(records, null, 4);
    
    fs.writeFile(file_path, data, (err) => {
        if (err) {
            throw err;
        }
        callback();
    });    
}


function FileRecordInfo(name, path, id, size)
{
    this.id = id.toString();
    this.name = name;
    this.path = path; // Source name during upload
    this.size = size;
    this.messages = undefined; // # of message to save the file.
    this.last_message_id = 0; // Use linked list of message from the end to avoid duplicate request for edit.
    this.date = new Date(); // Upload date.
}

exports.get_available_id = get_available_id;
exports.save_indexes = save_indexes;
exports.FileRecordInfo = FileRecordInfo;