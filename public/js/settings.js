var settings = {

  "contentDir" : "sessions",

  "metaFileext" : ".txt",
  "confMetafilename" : "data",

  "metaDateFormat" : "YYYYMMDD_HHmmss",
  "textEncoding" : "UTF-8",
  "textFieldSeparator" : "\n\n----\n\n",
  "deletedPrefix" : "x_",
  "thumbSuffix" : "_thumb",

  "mediaThumbWidth" : 320,
  "mediaThumbHeight" : 240
};

// should work in ES6
var config = Object.assign(settings);

try {
  module.exports = config;
} catch( err) {

}