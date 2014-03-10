#!/usr/bin/env node
/* Sendanor Node/NPM Package Lint Utility */
try {

	var debug = require('nor-debug');
	var argv = require('optimist').argv;
	var core = require('../lib');
	var semver = require('semver');

	var working_path = core.getWorkingPath(argv);
	var package_path = core.getPackageRoot(argv);

	if(!package_path) {
		throw new TypeError("No package directory found.");
	}

	var warnings = [];
	
	function add_warning(str) {
		warnings.push(str);
	}

	//debug.log('working_path = ', working_path);
	//debug.log('package_path = ', package_path);

	var package_json = core.getPackageJSON({'package': package_path});
	var installed_packages = core.getInstalledModules(argv);

	// TODO: Search installed packages that are in the package's package.json but not correct version
	['dependencies', 'optionalDependencies', 'devDependencies'].forEach(function(type) {
		Object.keys(package_json[type]).forEach(function(name) {
			var spec = package_json[type][name];
			var pkg = installed_packages[name];
			var git;
	
			// Enable git paths as version
			if(spec.substr(0, 'git://'.length) === 'git://') {
				git = spec;
				spec = undefined;
			}

			//debug.log("name = ", name);
			//debug.log("spec = ", spec);
			//debug.log("pkg = ", pkg);

			if(!pkg) {
				add_warning(''+ name + ': not installed');
				return;
			}

			if(pkg.name !== name) {
				add_warning(''+ name + ': different name in package.json: ' + pkg.name);
			}

			if(spec && (!semver.satisfies(pkg.version, spec)) ) {
				add_warning(''+ name + ': Installed as v' + pkg.version + ' which does not satisfy ' + spec);
			}

		});
	});
	
	// TODO: Search installed packages that are not in project's package.json
	
	// TODO: Search installed packages that are not yet in the NPM
	
	// TODO: Search dependencies with different versions
	
	// TODO: Search dependencies with newer available upstream versions

	/* Handle results */
	if(warnings.length === 0) {
		console.log('No warnings.');
	} else {
		warnings.forEach(function(msg) {
			console.log('Warning! ' + msg);
		});
	}

} catch(err) {
	require('util').error(err);
}

/* EOF */
