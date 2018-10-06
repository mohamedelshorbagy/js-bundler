const fs = require('fs');
const path = require('path');
const babylon = require('babylon');
const traverse = require('babel-traverse').default;
const { transformFromAst } = require('babel-core');
const { saveFile, generateId, cleanBeforeBuild } = require('./utility');
const colors = require('colors');
/** Main Functions
 * 
 * 
 */

/**
 * 
 * @param {String} entry
 * @return {Object} asset 
 */

let ID = 0;
function createAsset(filename) {
    const content = fs.readFileSync(filename, 'utf-8');
    // Generate AST
    let ast = babylon.parse(content, {
        sourceType: 'module'
    });

    let dependencies = [];
    traverse(ast, {
        ImportDeclaration: ({ node }) => {
            dependencies.push(node.source.value);
        }
    })


    const assetId = generateId();

    const { code } = transformFromAst(ast, null, {
        presets: ['env']
    });


    const asset = {
        id: assetId,
        filename,
        dependencies,
        code
    };


    return asset;



}

function createGraph(entry) {
    let mainAsset = createAsset(entry);
    firstId = mainAsset.id;
    /**
     * Queue : Holds the MainAsset & recursively add the others
     */
    let queue = [mainAsset];


    for (let asset of queue) {

        const dirname = path.dirname(asset.filename);
        asset.mapping = {};
        asset.dependencies.forEach(rPath => {
            const aPath = path.join(dirname, rPath);
            const child = createAsset(aPath);
            asset.mapping[rPath] = child.id;
            queue.push(child);
        })
    }


    return queue;


}

/**
 * 
 * @param {Graph} graph
 * @return {String[JavascriptBundled]} 
 */
function bundle(graph) {
    let modules = ``;

    graph.forEach(mod => {
        modules += `
            ${JSON.stringify(mod.id)}: [
                function(require, module, exports) {
                    ${mod.code}
                },
                ${JSON.stringify(mod.mapping)}
            ],
        `
    })

    const result = `
        (function (modules) {
            function require(id) {
                const [fn, mapping] = modules[id];

                function localRequire(rPath) {
                    return require(mapping[rPath]);
                }

                const module = { exports: {} }
                
                fn(localRequire, module, module.exports);


                return module.exports;
            }

            require('${firstId}');
        })({${modules}})
    
    `;
    return result;

}

function JsBundler(entry, output = { filename: 'bundle.js', dirname: 'dist' }) {
    let opts = {
        output
    };
    cleanBeforeBuild(output.dirname);
    const graph = createGraph(entry);
    const bundledCode = bundle(graph);
    opts.content = bundledCode;
    const savedFile = saveFile(opts);
    if (savedFile.success) {
        console.log('Bundle Generated Successfully!'.green);
    }

}




JsBundler('./src/app.js');

