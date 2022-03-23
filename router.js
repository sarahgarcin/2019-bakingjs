var _ = require("underscore");
var url = require('url')
var fs = require('fs-extra');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var parsedown = require('woods-parsedown'),
    slugg = require('slugg'),
    moment = require('moment'),
    path = require("path");


var config  = require('./public/js/settings.js');


module.exports = function(app,io,m){

  /**
  * routing event
  */
  app.get("/", getIndex);
  app.get("/:conf", getConf);
  app.post("/:conf/file-upload", multipartMiddleware, postFile);

  /**
  * routing functions
  */

  // GET
  function getIndex(req, res) {
    var pageTitle = "Baking Projects";
    res.render("index", {title : pageTitle});
  };

  function getConf(req, res) {
    var fmeta = getFolderMeta(req.params.conf);
    //console.log(fmeta);
    var confTitle = fmeta.name;
    var confLieu = fmeta.lieu; 
    var confDate = fmeta.date; 
    var confAuteur = fmeta.auteur;
    res.render("conf", {title : confTitle, lieu: confLieu, date: confDate, auteur: confAuteur});
  };


  function postFile(req, res) {
    console.log("------ Requête reçue ! -----");
    console.log("------ ROUTER — postFile -----");

    var slugConfName = req.params.conf;
    var confPath = getFullPath( slugConfName);
    var currentDateString = getCurrentDate();

    for(var i= 0; i<req.files.files.length; i++){
      if(req.files.files[i].size > 0){
        var name = req.files.files[i].name;

        createMediaData(slugConfName, confPath, currentDateString, name).then(function(newMediaData, filePath){
          console.log("Le fichier de données du média a bien été crée.", newMediaData);
        }, function(errorpdata) {
            console.error("Échec de création du fichier de données du média! Error: ", errorpdata);
            
        });
        createMedia(req.files.files[i].path, path.join(confPath,name)).then(function(newMedia){
          console.log("Le nouveau media a bien été crée à ", path.join(confPath,name));
          io.sockets.emit("newMedia", {name: name, id: slugg(name) });
        }, function(errorpdata){
          console.error("Échec de création du média… Error: ", errorpdata);
        });
      }
    }
  }

  function createMediaData(slugConfName, confPath, currentDateString, name){
    return new Promise(function(resolve, reject) {
      console.log(path.join(confPath, name));
      fs.access(path.join(confPath, name), fs.F_OK, function( err) {
        // if there's nothing at path
        if (err) {
          var fmeta =
            {
              "media" : name,
              "id" : slugg(name), 
              "x" : 0,
              "y": 0,
            };
          storeData(confPath + '/' + name + config.metaFileext, fmeta, "create").then(function( meta) {
            console.log('sucess ', meta); 
            resolve( meta);
          });

        } else {
          // if there's already something at path
          console.log("WARNING - the following folder name already exists: " + slugConfName);
          var objectJson = {
            "media" : name,
            "id" : slugg(name), 
            "x" : 0,
            "y": 0,
          };
          reject( objectJson);
        }
      });
    });
  }

  function createMedia(files, filePath){
    return new Promise(function(resolve, reject) {
      fs.readFile(files, function (err, data) {
        fs.writeFile(filePath, data, function (err) {
          if(!err){
            resolve(data);
          }
          else{
            reject(data);
          }
        });
      });
    });
  }


  // function convertToSlug(Text){
  //   // converti le texte en minuscule
  //   var s = Text.toLowerCase();
  //   // remplace les a accentué
  //   s = s.replace(/[àâäáã]/g, 'a');
  //   // remplace les e accentué
  //   s = s.replace(/[èêëé]/g, 'e');
  //   // remplace les i accentué
  //   s = s.replace(/[ìîïí]/g, 'i');
  //   // remplace les u accentué
  //   s = s.replace(/[ùûüú]/g, 'u');
  //   // remplace les o accentué
  //   s = s.replace(/[òôöó]/g, 'o');
  //   // remplace le c cédille
  //   s = s.replace(/[ç]/g, 'c');
  //   // remplace le ene tilde espagnol
  //   s = s.replace(/[ñ]/g, 'n');
  //   // remplace tous les caractères qui ne sont pas alphanumérique en tiret
  //   s = s.replace(/\W/g, '-');
  //   // remplace les double tirets en tiret unique
  //   s = s.replace(/\-+/g, '-');
  //   // renvoi le texte modifié
  //   return s;
  // }

  function getFolderMeta( slugFolderName) {
    console.log( "COMMON — getFolderMeta");

    var folderPath = getFullPath( slugFolderName);
    var folderMetaFile = getMetaFileOfFolder( folderPath);

    var folderData = fs.readFileSync( folderMetaFile,config.textEncoding);
    var folderMetadata = parseData( folderData);

    return folderMetadata;
  }

  function getFullPath( path) {
    return config.contentDir + "/" + path;
  }

  function getMetaFileOfFolder( folderPath) {
    return folderPath + '/' + config.confMetafilename + config.metaFileext;
  }

  function parseData(d) {
    var parsed = parsedown(d);
    return parsed;
  }

  function getCurrentDate() {
    return moment().format( config.metaDateFormat);
  }

  function storeData( mpath, d, e) {
    return new Promise(function(resolve, reject) {
      console.log('Will store data', mpath);
      var textd = textifyObj(d);
      if( e === "create") {
        fs.appendFile( mpath, textd, function(err) {
          if (err) reject( err);
          resolve(parseData(textd));
        });
      }
      if( e === "update") {
        fs.writeFile( mpath, textd, function(err) {
        if (err) reject( err);
          resolve(parseData(textd));
        });
      }
    });
  }

  function textifyObj( obj) {
    var str = '';
    console.log( '1. will prepare string for storage');
    for (var prop in obj) {
      var value = obj[prop];
      console.log('2. value ? ' + value);
      // if value is a string, it's all good
      // but if it's an array (like it is for medias in publications) we'll need to make it into a string
      if( typeof value === 'array')
        value = value.join(', ');
      // check if value contains a delimiter
      if( typeof value === 'string' && value.indexOf('\n----\n') >= 0) {
        console.log( '2. WARNING : found a delimiter in string, replacing it with a backslash');
        // prepend with a space to neutralize it
        value = value.replace('\n----\n', '\n ----\n');
      }
      str += prop + ': ' + value + config.textFieldSeparator;
    }
    console.log( '3. textified object : ' + str);
    return str;
  }

};
