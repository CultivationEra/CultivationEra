/**
 * This file is used to bootstrap the other compiler scripts.
 */
const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const yaml = fs.readFileSync('build.yaml').toString();

// Do manual yaml parsing because we want to use 0 dependencies
const lines = yaml.split('\r').join('').split('\n').map(x=>x.split(':')).filter(x=>x.length==2);

// Copied (and modified) from https://stackoverflow.com/questions/13786160/copy-folder-recursively-in-node-js
var copyRecursiveSync = function(src, dest) {
    if(fs.existsSync(dest)) {
        fs.rmdirSync(dest,{recursive:true});
    }
    var exists = fs.existsSync(src);
    var stats = exists && fs.statSync(src);
    var isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        fs.mkdirSync(dest);
        fs.readdirSync(src).forEach(function(childItemName) {
            copyRecursiveSync(path.join(src, childItemName),
                path.join(dest, childItemName));
            });
    } else {
        fs.copyFileSync(src, dest);
    }
};

/** Finds a specific line in the yaml file */
function findLine(key) {
    const line = lines.find(x=>x[0].startsWith(key));
    let value = line[1];
    while(value.startsWith(' ')) value = value.substring(1);
    while(value.endsWith(' ')) value = value.substring(0,value.length-1);
    if(value.startsWith('"') && value.endsWith('"')) value = value.substring(1,value.length-1);
    else if(value.startsWith("'") && value.endsWith("'")) value = value.substring(1,value.length-1);
    return value;
}

/** Run a command in a specific directory */
function do_in(dir, callback) {
    let curdir = process.cwd();
    process.chdir(dir);
    callback();
    process.chdir(curdir);
}

// Create build/install directories
const buildLine = findLine('build_directory');
const installLine = findLine('install_directory');
if(!fs.existsSync(buildLine)) {
    fs.mkdirSync(buildLine,{recursive:true});
}
if(!fs.existsSync(installLine)) {
    fs.mkdirSync(installLine,{recursive:true});
}

// Scripts config
const scripts_config_dir = path.join(buildLine,'scripts_config');
const scrips_out_dir = path.relative(scripts_config_dir,path.join(installLine,'bin','scripts','tswow'));
const scripts_root_dir = path.relative(scripts_config_dir,'./tswow-scripts');

// Compiler config
const compile_config_dir = path.join(buildLine, 'compiler_config');
const compile_tsconfig = 
`{
    "compilerOptions": {
      "target": "es2018",
      "module": "commonjs",
      "outDir": ${JSON.stringify(path.join(scrips_out_dir,'compile'))},
      "strict": true,
      "esModuleInterop": true,
      "sourceMap": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true
    },
    "include":[${JSON.stringify(path.join(scripts_root_dir,'compile'))},${JSON.stringify(path.join(scripts_root_dir,'util'))}]
}`

// Create build config directories
if(!fs.existsSync(compile_config_dir)) fs.mkdirSync(compile_config_dir,{recursive:true});
fs.writeFileSync(path.join(compile_config_dir,'tsconfig.json'),compile_tsconfig)

// Install typescript if it's missing
try { child_process.execSync('tsc --help'); } 
catch(err) { child_process.execSync('npm i --g typescript'); }

// Compile build scripts
fs.copyFileSync('./package.json',path.join(installLine,'package.json'));
do_in(installLine,()=>child_process.execSync('npm i',{stdio:'inherit'}))
do_in(compile_config_dir,()=>child_process.execSync('tsc',{stdio:'inherit'}));

// Start main build loop
const mainBuildPath = path.join(installLine,'bin','scripts','tswow','compile','compile','CompileTsWow.js');
child_process.execSync(`node -r source-map-support/register ${mainBuildPath} ${process.argv.slice(2).join(' ')}`,{stdio:'inherit'});