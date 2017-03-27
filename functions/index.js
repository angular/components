'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var firebaseFunctions = require("firebase-functions");
var firebaseAdmin = require("firebase-admin");
var data_1 = require("./data");
var image_data_1 = require("./image_data");
var data_image_1 = require("./data_image");
var test_goldens_1 = require("./test_goldens");
var github_1 = require("./github");
/**
 * Usage: Firebase functions only accept javascript file index.js
 *   tsc
 *   firebase deploy --only functions
 *
 *
 * Data and images handling for Screenshot test.
 *
 * All users can post data to temporary folder. These Functions will check the data with JsonWebToken and
 * move the valid data out of temporary folder.
 *
 * For valid data posted to database /$temp/screenshot/reports/$prNumber/$secureToken, move it to
 * /screenshot/reports/$prNumber.
 * These are data for screenshot results (success or failure), GitHub PR/commit and TravisCI job information
 *
 * For valid image results written to database /$temp/screenshot/images/$prNumber/$secureToken/, save the image
 * data to image files and upload to google cloud storage under location /screenshots/$prNumber
 * These are screenshot test result images, and difference images generated from screenshot comparison.
 *
 * For golden images uploaded to /goldens, read the data from images files and write the data to Firebase database
 * under location /screenshot/goldens
 * Screenshot tests can only read restricted database data with no credentials, and they cannot access
 * Google Cloud Storage. Therefore we copy the image data to database to make it available to screenshot tests.
 *
 * The JWT is stored in the data path, so every write to database needs a valid JWT to be copied to database/storage.
 * All invalid data will be removed.
 * The JWT has 3 parts: header, payload and signature. These three parts are joint by '/' in path.
 */
// Initailize the admin app
firebaseAdmin.initializeApp(firebaseFunctions.config().firebase);
/** The valid data types database accepts */
var dataTypes = ['result', 'sha', 'travis'];
/** The Json Web Token format. The token is stored in data path. */
var jwtFormat = '{jwtHeader}/{jwtPayload}/{jwtSignature}';
/** The temporary folder name for screenshot data that needs to be validated via JWT.  */
var tempFolder = '/untrustedInbox';
/** Untrusted report data for a PR */
var reportPath = tempFolder + "/screenshot/reports/{prNumber}/" + jwtFormat + "/";
/** Untrusted image data for a PR */
var imagePath = tempFolder + "/screenshot/images/{prNumber}/" + jwtFormat + "/";
/** Trusted report data for a PR */
var trustedReportPath = "screenshot/reports/{prNumber}";
/**
 * Copy valid data from /$temp/screenshot/reports/$prNumber/$secureToken/
 *   to /screenshot/reports/$prNumber
 * Data copied: filenames(image results names), commit(github PR info),
 *     sha (github PR info), result (true or false for all the tests), travis job number
 */
var testDataPath = reportPath + "/{dataType}";
exports.testData = firebaseFunctions.database.ref(testDataPath)
    .onWrite(function (event) {
    var dataType = event.params.dataType;
    if (dataTypes.includes(dataType)) {
        return data_1.verifyJWTAndUpdateData(event, dataType);
    }
});
/**
 * Copy valid data from /$temp/screenshot/reports/$prNumber/$secureToken/
 *   to /screenshot/reports/$prNumber
 * Data copied: test result for each file/test with ${filename}. The value should be true or false.
 */
var testResultsPath = reportPath + "/results/{filename}";
exports.testResults = firebaseFunctions.database.ref(testResultsPath)
    .onWrite(function (event) {
    return data_1.verifyJWTAndUpdateData(event, "results/" + event.params.filename);
});
/**
 * Copy valid data from database /$temp/screenshot/images/$prNumber/$secureToken/
 *   to storage /screenshots/$prNumber
 * Data copied: test result images. Convert from data to image files in storage.
 */
var imageDataToFilePath = imagePath + "/{dataType}/{filename}";
exports.imageDataToFile = firebaseFunctions.database.ref(imageDataToFilePath)
    .onWrite(data_image_1.convertTestImageDataToFiles);
/**
 * Copy valid goldens from storage /goldens/ to database /screenshot/goldens/
 * so we can read the goldens without credentials.
 */
exports.goldenImageToData = firebaseFunctions.storage.bucket(firebaseFunctions.config().firebase.storageBucket).object().onChange(function (event) {
    return image_data_1.convertGoldenImagesToData(event.data.name, event.data.resourceState, event.data.bucket);
});
/**
 * Copy test result images for PR to Goldens.
 * Copy images from /screenshot/$prNumber/test/ to /goldens/
 */
var approveImagesPath = trustedReportPath + "/approved";
exports.approveImages = firebaseFunctions.database.ref(approveImagesPath).onWrite(function (event) {
    return test_goldens_1.copyTestImagesToGoldens(event.params.prNumber);
});
/**
 * Update github status. When the result is true, update github commit status to `success`,
 * otherwise update github status to `failure`.
 * The Github Status Token is set in config.secret.github
 */
var githubStatusPath = trustedReportPath + "/result";
exports.githubStatus = firebaseFunctions.database.ref(githubStatusPath).onWrite(github_1.updateGithubStatus);
//# sourceMappingURL=index.js.map