const fs = require('fs');
const path = require('path');
const colors = require('colors');
/***************************************************************** */
/** Utilities Functions
 * 
 * 
 */
/**
 * @desc: Generate UniqueID
 * @return {String} ID
 */
function generateId() {
    let sequence = 1;
    let now = Math.abs(Date.now() - 1357027200000);
    let seqId = sequence % 1023
    let nextId = (now << 15 | 1 << 10 | seqId).toString(36).toUpperCase();
    return nextId[0] === '-' ? nextId.substr(1, nextId.length) : nextId;
}

/**
 * 
 * @param {String} dirname 
 */
function createFolderIfNotExist(dirname) {
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname);
    }
}
/**
 * 
 * @param {String} dirname 
 * @param {String} filename 
 * @param {String[Javascript]} content 
 */
function saveFile(opts) {
    createFolderIfNotExist(opts.output.dirname);
    const destination = path.join(__dirname, opts.output.dirname, opts.output.filename);
    fs.writeFileSync(destination, opts.content);
    return {
        success: true
    }
}


function cleanBeforeBuild(path) {
    console.log('Cleaning...'.red);
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}



module.exports = {
    saveFile,
    generateId,
    cleanBeforeBuild
}