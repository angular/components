#!/usr/bin/env node

var fs = require("fs");
var rimraf = require("rimraf");
var cpy = require("cpy");
var exec = require("child_process").exec;
var spawn = require("child_process").spawn;

// Set rimraf's maxBusyTries option to a high value to make sure the folder will be deleted
// instead of cancelling because of EBUSY and ENOTEMPTY errors
const rrOptions = { maxBusyTries: 999 };
const cpyOptions = { parents: true, cwd: "dist" };

console.info("Delete dist folder");
rimraf("dist", rrOptions, function (err) {
	if (err) {
		console.error(err);
		return;
	}
	console.info("Delete deploy folder");
	rimraf("deploy", rrOptions, function (err) {
		if (err) {
			console.error(err);
			return;
		}

		console.info("Running ng build");
		exec("ng build", function (err, stdout, stderr) {
			if (err) {
				console.error(err);
				return;
			}

			console.info("Creating inline resources");
			exec("npm run inline-resources", function (err, stdout, stderr) {
				if (err) {
					console.error(err);
					return;
				}
			});
			console.info("Creating deploy");
			fs.mkdirSync("deploy");

			console.info("Copy core and components");
			cpy(["components/**/*.*", "core/**/*.*"], "../deploy", cpyOptions).then(function () {
				console.info("Deploy created!");
			});
		});
	});
});