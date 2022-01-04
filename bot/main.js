/**
 * General parameters for the tool.
 */

module.exports = {
    conf_file: "conf.json", // Default configuration file.
    version: "1.0",
    tmp_folder: "/tmp/dfs/",

    debug: false, // Debug mode (extended print).
    
    transfert: {
        file_block_size: (1024*1024),
        file_per_message: 10, // Max 10 for Discord API.

        request_delay: 105, // Request minimum delay (ms).
        request_noise: 200, // Variation on request delay (ms).    
    }
};