/* VARIABLES */
var socket = io.connect();

function onSocketConnect() {
	sessionId = socket.io.engine.id;
	console.log('Connected ' + sessionId);
	socket.emit('listConf');
};

function onSocketError(reason) {
	console.log('Unable to connect to server', reason);
};

/* sockets */
socket.on('connect', onSocketConnect);
socket.on('error', onSocketError);
socket.on('confCreated', onFolderCreated);
socket.on('listAllFolders', onListAllFolders);

jQuery(document).ready(function($) {

	// $(document).foundation();
	init();
});


function init(){

	$('body').on('click', '.js-add-conf', function(){
		var newConfLieu = $('input.lieu').val();
		var newConfDate= $('input.date').val();
		var newConfTitre = $('input.titre').val();
		var newConfAuth = $('input.auteur').val();
		console.log('hey');
		socket.emit( 'newConf', { "lieu" : newConfLieu, "date": newConfDate, "titre":newConfTitre, "auteur":newConfAuth  });
  });

}

function onFolderCreated(data){

	location.reload();
}

function onListAllFolders( foldersData) {
	console.log(foldersData);
  $.each( foldersData, function( index, fdata) {
  	var $folderContent = makeFolderContent( fdata);
  	console.log($folderContent);
    return insertOrReplaceFolder( fdata.slugFolderName, $folderContent);
  });
}

function insertOrReplaceFolder( slugFolderName, $folderContent) {
  $(".dossier-list").append( $folderContent);

  return "inserted";

}

// Fonction qui affiche les dossiers HTML
function makeFolderContent( projectData){

	console.log(projectData)
	
	var name = projectData.name;
	var slugFolderName = projectData.slugFolderName;
	var lieu = projectData.lieu;
	var date = new Date(projectData.date);

	var auteur = projectData.auteur;

	var newFolder = $(".js--templates > .dossier").clone(false);

	// customisation du projet
	newFolder
	  .attr( 'data-nom', name)
	  .attr( 'data-slugFolderName', slugFolderName)
	  .find( '.folder-link')
	    .attr('href', '/' + slugFolderName)
	    .attr('title', name)
	  .end()

	  .find( '.title').text(name).end()
	  .find( '.lieu').text(lieu).end()
	  .find( '.date').text(date.getDate() + '/' + (date.getMonth() + 1) + '/' +  date.getFullYear()).end()
	  .find( '.auteur').text(auteur).end()

    .end()
  ;

		return newFolder;
}

