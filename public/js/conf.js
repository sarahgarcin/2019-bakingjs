/* VARIABLES */
var socket = io.connect();
var zIndex = 0;
var currentFolder = window.location.pathname.replace(/^\/([^\/]*).*$/, '$1');;

/* sockets */
socket.on('connect', onSocketConnect);
socket.on('error', onSocketError);

socket.on('listAllMedias', onListMedias);
socket.on('newMedia', onNewMedia);
socket.on('mediaPosition', onMediaPosition);
socket.on('mediaDragPosition', onMediaDragPosition);
socket.on('mediaDragPositionForAll', onMediaDragPositionForAll);
socket.on('padCleared', padCleared);

jQuery(document).ready(function($) {

	$(document).foundation();
	init();
});


function init(){



	$(window).on('dragover',function(e){
		$(".drop-files-container").css('pointer-events', "auto");
		e.preventDefault();
		e.stopPropagation();
		return false;
	});

	$(window).on('dragleave',function(e){
		e.preventDefault();
		e.stopPropagation();
		return false;
	});

	$(".drop-files-container").on("drop", function(e) {
		e.preventDefault();
		console.log("DROP FILE");
    var files = e.originalEvent.dataTransfer.files;
    processFileUpload(files); 
    $(".drop-files-container").css('pointer-events', "none");
    
    //file data to display it correctly
    var mediaX = e.offsetX;
 		var mediaY = e.offsetY;
 		var id = convertToSlug(files[0].name);
 		zIndex ++;
 		var randomRot = Math.floor((Math.random() * 40) - 15);
 		// console.log(mediaX, mediaY, id, zIndex, randomRot);
    setTimeout(function(){
			socket.emit("dropPosition", {mediaX:mediaX, mediaY:mediaY, id:id, mediaZ: zIndex, random:randomRot});
  	},200);
  	// forward the file object to your ajax upload method
    return false;
	});



	// ctrl + f -> Clear le pad -> supprime toutes les images
	// $(document).keypress("f",function(e) {
	//   if(e.ctrlKey)
	//     socket.emit("clearPad");
	// });

}

function onListMedias(dataArr){
	$.each( dataArr, function( i, data ) {
		var path = "/"+currentFolder+"/"+data.media;
		var id = data.id;
		zIndex = data.zPos;
		var ext = data.media.split('.').pop();
		var mediaItem;

		if(ext == 'jpg' || ext == "jpeg" || ext == "png" || ext == "gif" || ext == "JPG"){
			mediaItem = $(".js--templates .image").clone(false);
			mediaItem
			  .find( 'img')
			    .attr('src', path)
			  .end()
			  .attr('id', id)
			  .css({
			  	"top":data.y,
			  	"left":data.x,
			  	"z-index":data.z,
			  	// "transform":"rotate("+data.random+"deg)",
			  	"display":"block"
			  });
		}

		if(ext == 'mp4' || ext == "avi" || ext == "ogg" || ext == "mov" || ext == "webm"){
			mediaItem = $(".js--templates .video").clone(false);
			mediaItem
			  .find( 'source')
			    .attr('src', path)
			  .end()
			  .attr('id', id)
			  .css({
			  	"top":data.y,
			  	"left":data.x,
			  	"z-index":data.z,
			  	// "transform":"rotate("+data.random+"deg)",
			  	"display":"block"
			  });
		}

		if(ext == 'pdf'){
			mediaItem = $(".js--templates .pdf").clone(false);
			mediaItem
			  .find('a')
			    .attr('href', path)
			    .attr('title', data.name)
			    .attr('target', '_blank')
			    .append(data.name)
			  .end()
				.attr('id', id)
			  .css({
			  	"top":data.y,
			  	"left":data.x,
			  	"z-index":data.z,
			  	// "transform":"rotate("+data.random+"deg)",
			  	"display":"block"
			  });
		}


	$('.medias-list').prepend(mediaItem);
	mediaItem.draggable();


	// rendre les medias draggable
	// mediaItem.draggable({
 //    start: function() {
 //    	//zIndex ++;
	//     //console.log(zIndex);
 //    },
 //    drag: function(event) {
 //    	// console.log(event);
 //    	var offset = $(this).offset();
 //      var posX = offset.left;
 //      var posY = offset.top;
 //    	// socket.emit("dragMediaPos", {x: posX, y:posY, id:id, z:zIndex});
 //    }
 //  });

});

  // ajouter un attribut paysage ou portrait pour définir une taille rationnelle
  // setTimeout(function(){
	 //  //console.log(mediaItem.find('img')[0].naturalWidth, mediaItem.find('img')[0].naturalHeight);
		// var mediaW = mediaItem.find('img')[0].naturalWidth;
		// var mediaH = mediaItem.find('img')[0].naturalHeight;
		// //console.log(mediaW, mediaH);
		// var orientation;
		// if(mediaW > mediaH){
		// 	orientation = "paysage";
		// }
		// else{
		// 	orientation = "portrait";
		// }
		// mediaItem.attr("data-orientation", orientation);
  // }, 500);



  //draggable media
  // mediaItem.draggable({
  //   start: function() {
  //   	zIndex ++;
	 //    // console.log(zIndex);
  //   },
  //   drag: function(event) {
  //   	// console.log(event);
  //   	var offset = $(this).offset();
  //     var posX = offset.left;
  //     var posY = offset.top;
  //   	socket.emit("dragMediaPos", {x: posX, y:posY, id:id, z:zIndex});
  //   },
  //   stop: function() {
  //   	socket.emit('takeScreenShot');
  //   }
  // });
}

function onNewMedia(data){
	var path = "/"+currentFolder+"/"+data.name;
	console.log(path);
	var id = data.id;
	var ext = data.name.split('.').pop();
	var mediaItem;
	
	if(ext == 'jpg' || ext == "jpeg" || ext == "png" || ext == "gif" || ext == "JPG"){
		console.log("The file is an image");
		mediaItem = $(".js--templates .image").clone(false);
		mediaItem
		  .find( 'img')
		    .attr('src', path)
		  .end()
		  .addClass('no-position')
		  .attr('id', id)
		  .css({
		  	"zIndex": zIndex
		  });
	}

	if(ext == 'mp4' || ext == "avi" || ext == "ogg" || ext == "mov" || ext == "webm"){
		mediaItem = $(".js--templates .video").clone(false);
		mediaItem
		  .find('source')
		    .attr('src', path)
		  .end()
		  .addClass('no-position')
		  .attr('id', id)
		  .css({
		  	"zIndex": zIndex
		  });
	}

	if(ext == 'pdf'){
		mediaItem = $(".js--templates .pdf").clone(false);
		mediaItem
		  .find('a')
		    .attr('href', path)
		    .attr('title', data.name)
		    .attr('target', '_blank')
		    .append(data.name)
		  .end()
		  .addClass('no-position')
		  .attr('id', id)
		  .css({
		  	"zIndex": zIndex
		  });
	}


	$('.medias-list ul').prepend(mediaItem);
	  
  //draggable media
  // mediaItem.draggable({
  //   start: function() {
  //   	zIndex ++;
  //   },
  //   drag: function(event) {
  //   	// console.log(event);
  //   	var offset = $(this).offset();
  //     var posX = offset.left;
  //     var posY = offset.top;
  //   	socket.emit("dragMediaPos", {x: posX, y:posY,  z:zIndex, id:id});
  //   },
  //   stop: function() {
  //   	socket.emit('takeScreenShot');
  //   }
  // });
}

function onMediaPosition(mouse){
	$(".drop-files-container").css("z-index", -1);
	var mediaW = $(".medias-list li.no-position").width();
	var mediaH = $(".medias-list li.no-position").height();
	var orientation;

	if(mediaW > mediaH){
		orientation = "paysage";
	}
	else{
		orientation = "portrait";
	}

	$(".medias-list li.no-position")
		.css({
			"top": mouse.mediaY,
	  	"left":mouse.mediaX,
	  	"transform":"rotate("+mouse.random+"deg)",
	  	"z-index": mouse.mediaZ,
	  	"display":"block"
		})
		.removeClass('no-position')
		.attr("data-index", mouse.mediaZ)
		.attr("data-orientation", orientation)
	;
	socket.emit('takeScreenShot');
	
}

function onMediaDragPosition(pos){
	$(".medias-list li#"+pos.id)
		.css({
			"top": pos.y,
	  	"left":pos.x,
	  	"z-index":pos.z
		});	
}

function onMediaDragPositionForAll(pos){
	$(".medias-list li#"+pos.id)
	.css({
  	"z-index":pos.z,
	});	
}

function padCleared(){
	location.reload();
}

/* sockets */
function onSocketConnect() {
	sessionId = socket.io.engine.id;
	console.log('Connected ' + sessionId);
	socket.emit("listAllMedias", currentFolder);
};

function onSocketError(reason) {
	console.log('Unable to connect to server', reason);
};



function processFileUpload(droppedFiles) {
  // add your files to the regular upload form
  var uploadFormData = new FormData($("#form")[0]); 
  if(droppedFiles.length > 0) { // checks if any files were dropped
    for(var f = 0; f < droppedFiles.length; f++) { // for-loop for each file dropped
      uploadFormData.append("files[]",droppedFiles[f]);  // adding every file to the form so you could upload multiple files
    	// console.log(droppedFiles[f]);
    }
  }


	// the final ajax call
 $.ajax({
  url : "/"+currentFolder+"/file-upload", // use your target
  type : "POST",
  data : uploadFormData,
  cache : false,
  contentType : false,
  processData : false,
  success : function(ret) {
    // callback function
    console.log(ret);
  }
 });

}


function convertToSlug(Text){
  // converti le texte en minuscule
	var s = Text.toLowerCase();
	// remplace les a accentué
	s = s.replace(/[àâäáã]/g, 'a');
	// remplace les e accentué
	s = s.replace(/[èêëé]/g, 'e');
	// remplace les i accentué
	s = s.replace(/[ìîïí]/g, 'i');
	// remplace les u accentué
	s = s.replace(/[ùûüú]/g, 'u');
	// remplace les o accentué
	s = s.replace(/[òôöó]/g, 'o');
	// remplace le c cédille
	s = s.replace(/[ç]/g, 'c');
	// remplace le ene tilde espagnol
	s = s.replace(/[ñ]/g, 'n');
	// remplace tous les caractères qui ne sont pas alphanumérique en tiret
	s = s.replace(/\W/g, '-');
	// remplace les double tirets en tiret unique
	s = s.replace(/\-+/g, '-');
	// renvoi le texte modifié
	return s;
}