/* The core functionality */

var debug = require('nor-debug');
var PATH = require('path');
var fs = require('nor-fs');
var is = require('nor-is');
var core = module.exports = {};

/* Read package.json */
core.getPackageJSON = function(argv) {
	argv = argv || {};
	var path = argv.package;
	debug.assert(path).is('string');
	var pkginfo_file = PATH.resolve(path, "package.json");
	var info = require(pkginfo_file);
	if(!is.object(info.dependencies)) {
		info.dependencies = {};
	}
	if(!is.object(info.devDependencies)) {
		info.devDependencies = {};
	}
	if(!is.object(info.optionalDependencies)) {
		info.optionalDependencies = {};
	}
	return info;
};

/** Returns the working path */
core.getWorkingPath = function(argv) {
	return PATH.resolve(process.cwd());
};

/** Returns the package root */
core.getPackageRoot = function(argv) {
	var last_p;
	var p = core.getWorkingPath(argv);
	do {
		if( fs.sync.exists( PATH.resolve(p, 'package.json') ) ) {
			return p;
		}
		last_p = p;
		p = PATH.dirname(p);
	} while( (p !== '/') && (last_p !== p) );
	return;
};

/** Get installed modules in the package as an array of package.json's */
core.getInstalledModules = function(argv) {
	var root = core.getPackageRoot(argv);
	var node_modules_path = PATH.resolve(root, "node_modules");
	if(!fs.sync.exists(node_modules_path)) {
		return [];
	}
	var obj = {};
	fs.sync.readdir(node_modules_path).forEach(function(path) {
		if(path === '.bin') {
			return;
		};
		var pkg = core.getPackageJSON({'package': PATH.resolve(node_modules_path, path) });
		obj[path] = pkg;
	});
	return obj;
};

/* EOF */
