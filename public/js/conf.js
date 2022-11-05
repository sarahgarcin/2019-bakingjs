/* VARIABLES */
var socket = io.connect();

var currentFolder = window.location.pathname.replace(/^\/([^\/]*).*$/, '$1');;
var windowW = window.innerWidth;
var windowH = window.innerHeight; 

// gestion du z-index
var higherZindex = 0;

/* sockets */
socket.on('connect', onSocketConnect);
socket.on('error', onSocketError);

socket.on('listAllMedias', onListMedias);
socket.on('newMedia', onNewMedia);
socket.on('mediaChange', onMediaChange);
socket.on('mediaRemoved', onMediaRemoved);
// socket.on('mediaDragPosition', onMediaDragPosition);
// socket.on('mediaDragPositionForAll', onMediaDragPositionForAll);
socket.on('padCleared', padCleared);

jQuery(document).ready(function($) {

	// $(document).foundation();
	init();
});


function init(){
	$(window).on("resize", function(){
		windowW = window.innerWidth;
		windowH = window.innerHeight;
	})

	$(window).on('dragover',function(e){
		$(".drop-files-container")
			.css('pointer-events', "auto")
			.addClass("dragover");
		e.preventDefault();
		e.stopPropagation();
		return false;
	});

	$(window).on('dragleave',function(e){
		e.preventDefault();
		e.stopPropagation();
		return false;
	});

	// Quand une image est dropper dans la zone
	$(".drop-files-container").on("drop", function(e) {
		e.preventDefault();
		$(".drop-files-container").removeClass("dragover");
		console.log("DROP FILE");
    var files = e.originalEvent.dataTransfer.files;
    processFileUpload(files); 
    $(".drop-files-container").css('pointer-events', "none");
    //file data to display it correctly
    var posX = e.offsetX;
 		// var posY = e.offsetY;
 		var posY = window.scrollY;
 		// transforme la position en %
 		posX = parseInt((posX * 100) / windowW);
 		posY = parseInt((posY * 100) / windowH); 
 		var id = convertToSlug(files[0].name);
 		// var fileNameWithExt = files[0].name.split('.');
 		// var fileName = fileNameWithExt[0];
 		// var fileExt = fileNameWithExt[1];
 		// console.log(fileName, fileExt);	
 		// le z-index ne fonctionne pas
 		// console.log(zIndex);
 		higherZindex ++;
 		var randomRot = Math.floor((Math.random() * 40) - 15);
 		console.log(posX, posY, id, randomRot);
    setTimeout(function(){
			socket.emit("dropPosition", {mediaX:posX, mediaY:posY, id:id, rotation:randomRot, fileName : files[0].name, folder: currentFolder, zIndex : higherZindex});
  	},1000);
  	// forward the file object to your ajax upload method
    return false;
	});

	// Upload image(s) with the upload button
	const form = $("#form");
	const inputFile = $("#file");

	const formData = new FormData();

	const handleSubmit = (files) => {
	    console.log(files[0]);
	    processFileUpload(files)
	    	// console.log('function is called after ajax success', files);
		    //file data to display it correctly
		 		var posY = window.scrollY;
		 		// transforme la position en %
		 		posX = 50;
		 		posY = parseInt((posY * 100) / windowH); 
		 		var id = convertToSlug(files[0].name);

		 		higherZindex ++;
		 		var randomRot = Math.floor((Math.random() * 40) - 15);
		 		console.log(posX, posY, id, randomRot);
		    setTimeout(function(){
					socket.emit("dropPosition", {mediaX:posX, mediaY:posY, id:id, rotation:randomRot, fileName : files[0].name, folder: currentFolder, zIndex : higherZindex});
		  	},3000);
	    return false;
	};

	// Quand une image est uploadée - trigger event on input change
	// $("#form").on("change", event => {
	//   const files = event.target.files;
	//   handleSubmit(files);
	// });
	$(document).on("change", "#form", event => {
	  const files = event.target.files;
	  handleSubmit(files);
	});
    

	// Supprimer un média
	$('body').on('click', '.delete-btn', function(){
		var thisId = $(this).parents('li').attr('id');
		var thisFileName = $(this).parents('li').data('name');
		// console.log(thisFileName);
		$(this).parents('li').css('display', 'none');
		socket.emit("removeMedia", {id:thisId, folder: currentFolder, fileName: thisFileName});
	});

	// Vider le plan de travail
	$('.clear-btn').on('click', function(){
		$(".clear-confirm-wrapper").css("display", "block");
	});

	$('#clear-yes').on('click', function(){
		$(".clear-confirm-wrapper").css("display", "none");
		$(".medias-list li").css("display", "none");
		socket.emit("clearPad", {folder: currentFolder});
	});

	$('#clear-no').on('click', function(){
		$(".clear-confirm-wrapper").css("display", "none");
	});


	// Cliquer sur le bouton texte
	// Ajouter du texte sur le plan de travail
	$('.text-btn').on('click', function(){
		mediaItem = $(".js--templates .text").clone(false);
		var randomRot = Math.floor((Math.random() * 40) - 15);
		higherZindex ++;
		mediaItem.css({
			'transform' : "rotate("+randomRot+"deg)",
			'z-index' : higherZindex
		});
		$('.medias-list').append(mediaItem);


		var $textarea = mediaItem.find('textarea');
		$textarea.focus();
		// mediaItem.draggable({
		// 	stack: "li", 
		// 	stop: function(event) {
	 //    	var offset = $(this).position();
	 //      var posX = parseInt(offset.left);
	 //      var posY = parseInt(offset.top);
	 //      var id = $(this).attr('id')
	 //      var rotation = getRotationDegrees($(this))
	 //      var filePath = $(this).find('img').attr('src');
	 //      var fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
	 //    	socket.emit("dragMediaPos", {x: posX, y:posY, id:id, folder: currentFolder, fileName: fileName, rotation: rotation });
	 //    }
		// });

		// Cliquer sur le bouton ok pour soumettre le texte = envoi l'info sur le serveur
		mediaItem.find('.submit-btn').on('click', function(){
			console.log('submit element');
			var textVal = $textarea.val();
			mediaItem.prepend("<p>"+textVal+"</p>");
			$(this).remove();
			$textarea.remove();

			var id = convertToSlug(textVal + ".md");
			var slugText = convertToSlug(textVal);
			var offset = mediaItem.position();
      var posX = parseInt(offset.left);
      var posY = parseInt(offset.top);
      higherZindex ++;
			socket.emit("textCreated", {text:textVal, x: posX, y:posY, zIndex:higherZindex, id:id, folder: currentFolder, rotation: randomRot, name : slugText  });

			mediaItem.draggable({
				stack: "li", 
				stop: function(event) {
		      var fileName = slugText + ".md";
		      var offset = $(this).position();
		      var posX = offset.left;
		      var posY = offset.top;
		      // transforme la position en %
			 		posX = parseInt((posX * 100) / windowW);
			 		posY = parseInt((posY * 100) / windowH);
		      var id = $(this).attr('id')
		      var rotation = getRotationDegrees($(this));
		      higherZindex ++;
		    	socket.emit("dragMediaPos", {text:textVal, x: posX, y:posY, zIndex:higherZindex, id:id, folder: currentFolder, fileName: fileName, rotation: rotation });
		    }
			});
		});

	});

	// Afficher la lightbox et naviguer dedans
	var $lightbox = $(".lightbox");
	$('body').on('click', '.open-lightbox', function(){	
		var $thisImg = $(this).parents('li');
		var $thisId = $thisImg.attr('id');
		var $thisSrc = $thisImg.find('img').attr('src');
		$lightbox.find('figure img').attr('src', $thisSrc);
		$lightbox.find('figure').attr('data-id', $thisId);
		$lightbox.css('display', 'block');
	});

	$(".lightbox .go-next").on('click', function(){
		var lightboxImg = $lightbox.find('figure').attr('data-id');
		var $nextImage = $("#"+lightboxImg).next('li');
		if(lightboxImg == "undefined"){
			$nextImage = $('.medias-list li').first();
		}
		var $nextImageId = $nextImage.attr('id');
		var $nextImageSrc = $nextImage.find('img').attr('src');
		console.log($nextImage);
		$lightbox.find('figure img').attr('src', $nextImageSrc);
		$lightbox.find('figure').attr('data-id', $nextImageId);
	});

	$(".lightbox .go-prev").on('click', function(){
		var lightboxImg = $lightbox.find('figure').attr('data-id');
		var $prevImage = $("#"+lightboxImg).prev('li');
		// console.log(lightboxImg, $('.medias-list li').first().attr('id'));
		// if(lightboxImg == $('.medias-list li').first().attr('id')){
		// 	console.log($('.medias-list li').last());
		// 	$prevImage = $('.medias-list li').last();
		// }
		var $prevImageId = $prevImage.attr('id');
		var $prevImageSrc = $prevImage.find('img').attr('src');
		console.log($prevImage.find('img').attr('src'));
		$lightbox.find('figure img').attr('src', $prevImageSrc);
		$lightbox.find('figure').attr('data-id', $prevImageId);
	});

	$(".close-lightbox").on('click', function(){
		$(".lightbox").css('display', 'none');
	});

}

function onListMedias(dataArr){

	$.each( dataArr, function( i, data ) {
		var path = "/"+currentFolder+"/"+data.media;
		var id = data.id;
		var ext = data.media.split('.').pop();
		var mediaItem;

		// console.log(data, ext, mediaItem); 

		// Get width of media
		var mediaWidth;
		if(data.width != undefined){
			mediaWidth = data.width;
		}
		else{
			mediaWidth = "25";
		}


		if(ext == 'jpg' || ext == "jpeg" || ext == "png" || ext == "gif" || ext == "JPG"){
			mediaItem = $(".js--templates .image").clone(false);
			mediaItem
			  .find( 'img')
			    .attr('src', path)
			  .end()
			  .attr('id', id)
			  .attr('data-name', data.media)
			  .css({
			  	"width": mediaWidth + '%', 
			  	"top": parseInt(data.y) + 'vh',
			  	"left": parseInt(data.x) + '%',
			  	"z-index":data.z,
			  	"transform":"rotate("+parseInt(data.rotation)+"deg)",
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
			  .attr('data-name', data.media)
			  .css({
			  	"width": mediaWidth + '%', 
			  	"top": parseInt(data.y) + 'vh',
			  	"left": parseInt(data.x) + '%',
			  	"z-index":data.z,
			  	"transform":"rotate("+parseInt(data.rotation)+"deg)",
			  	"display":"block"
			  });
		}

		if(ext == 'pdf'){
			mediaItem = $(".js--templates .pdf").clone(false);
			mediaItem
			  .find('a')
			    .attr('href', path)
			    .attr('title', data.media)
			    .attr('target', '_blank')
			    .append(data.media)
			  .end()
				.attr('id', id)
				.attr('data-name', data.media)
			  .css({
			  	"width": mediaWidth + '%', 
			  	"top": parseInt(data.y) + 'vh',
			  	"left": parseInt(data.x) + '%',
			  	"z-index":data.z,
			  	"transform":"rotate("+parseInt(data.rotation)+"deg)",
			  	"display":"block"
			  });
		}

		if(ext == 'md'){
			mediaItem = $(".js--templates .text").clone(false);
			mediaItem
			  .find('textarea').remove()
			  .end()
			  .find('.submit-btn').remove()
			  .end()
			  .append('<p>'+data.text+'</p>')
				.attr('id', id)
				.attr('data-name', data.media)
			  .css({
			  	"width": mediaWidth + '%', 
			  	"top": parseInt(data.y) + 'vh',
			  	"left": parseInt(data.x) + '%',
			  	"z-index":data.z,
			  	"transform":"rotate("+parseInt(data.rotation)+"deg)",
			  	"display":"block"
			  });
		}


		$('.medias-list').append(mediaItem);

		// Récupère le plus grand z-index 
		$(".medias-list li").each(function() {
	    // always use a radix when using parseInt
	    var index_current = parseInt($(this).css("zIndex"), 10);
	    if(index_current > higherZindex) {
	        higherZindex = index_current;
	    }
		});

		// Quand je drag and drop une image par la suite = changement de position à enregistrer
		mediaItem.draggable({
			stack: "li", 
			stop: function(event) {
				// get size of media
				var width = $(this).width();
        // transforme la taille en %
        width = parseInt((width * 100) / windowW);
        console.log("resize", width);

	    	var offset = $(this).position();
	      var posX = offset.left;
	      var posY = offset.top;
	      // transforme la position en %
		 		posX = parseInt((posX * 100) / windowW);
		 		posY = parseInt((posY * 100) / windowH);
	      var id = $(this).attr('id')
	      var rotation = getRotationDegrees($(this));
	      higherZindex ++;
	      // on envoie la data text seulement pour les fichiers textes
	    	socket.emit("dragMediaPos", {x: posX, y:posY, zIndex:higherZindex, width: width,  id:id, folder: currentFolder, fileName: data.media, rotation: rotation, text : data.text  });
	    }
		});

		// Redimensionner les médias
		mediaItem.bind('resizestop',function() {   
	  }).resizable({
	   		aspectRatio: true,
	      stop : function() {
	        var width = $(this).width();
	        // transforme la taille en %
	        width = parseInt((width * 100) / windowW);
	        console.log("resize", width);

	        var offset = $(this).position();
		      var posX = offset.left;
		      var posY = offset.top;
		      // transforme la position en %
			 		posX = parseInt((posX * 100) / windowW);
			 		posY = parseInt((posY * 100) / windowH);
		      var id = $(this).attr('id')
		      var rotation = getRotationDegrees($(this));
		      higherZindex ++;

	        socket.emit("resizeMedia", {x: posX, y:posY, zIndex:higherZindex,  id:id, folder: currentFolder, fileName: data.media, rotation: rotation, width: width,  text : data.text  });
	      }
	  });



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
	console.log(data);
	
	if(ext == 'jpg' || ext == "jpeg" || ext == "png" || ext == "gif" || ext == "JPG"){
		console.log("The file is an image");
		mediaItem = $(".js--templates .image").clone(false);
		mediaItem
		  .find( 'img')
		    .attr('src', path)
		  .end()
		  .attr('id', id)
		  .attr('data-name', data.name)
		  .css({
		  	"z-index": data.z
		  });
	}

	if(ext == 'mp4' || ext == "avi" || ext == "ogg" || ext == "mov" || ext == "webm"){
		mediaItem = $(".js--templates .video").clone(false);
		mediaItem
		  .find('source')
		    .attr('src', path)
		  .end()
		  .attr('id', id)
		  .attr('data-name', data.name)
		  .css({
		  	"z-index": data.z
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
		  .attr('data-name', data.name)
		  .css({
		  	"z-index": data.z
		  });
	}

	if(ext == 'md'){
		mediaItem = $(".js--templates .text").clone(false);
		mediaItem
		  .find('textarea').remove()
		  .end()
		  .find('.submit-btn').remove()
		  .end()
		  .append('<p>'+data.text+'</p>')
			.attr('id', id)
			.attr('data-name', data.name)
			.css({
		  	"z-index": data.z
		  });
		  // .css({
		  // 	"top": parseInt(data.y),
		  // 	"left": parseInt(data.x),
		  // 	// "z-index":data.z,
		  // 	"transform":"rotate("+parseInt(data.rotation)+"deg)",
		  // 	"display":"block"
		  // });
	}


	$('.medias-list').append(mediaItem);
	
	// Quand je drag and drop une image par la suite = changement de position à enregistrer
	mediaItem.draggable({
		stack: "li", 
		stop: function(event) {
			// get size of media
			var width = $(this).width();
      // transforme la taille en %
      width = parseInt((width * 100) / windowW);
      if(width == undefined){
      	width = 25;
      }
      console.log("drag width", width);

    	var offset = $(this).position();
      var posX = offset.left;
      var posY = offset.top;
      // transforme la position en %
	 		posX = parseInt((posX * 100) / windowW);
	 		posY = parseInt((posY * 100) / windowH);
      var id = $(this).attr('id')
      var rotation = getRotationDegrees($(this))
      // var filePath = $(this).find('img').attr('src');
      // var fileName = filePath.substring(filePath.lastIndexOf('/') + 1);
      higherZindex ++;
    	socket.emit("dragMediaPos", {x: posX, y:posY, zIndex:higherZindex, id:id, folder: currentFolder, fileName: data.name, rotation: rotation, width: width });
    }

	});

	mediaItem.bind('resizestop',function() {   
  }).resizable({
   		aspectRatio: true,
      stop : function() {
        var width = $(this).width();
        // transforme la taille en %
        width = parseInt((width * 100) / windowW);
        console.log("resize", width);

        var offset = $(this).position();
	      var posX = offset.left;
	      var posY = offset.top;
	      // transforme la position en %
		 		posX = parseInt((posX * 100) / windowW);
		 		posY = parseInt((posY * 100) / windowH);
	      var id = $(this).attr('id')
	      var rotation = getRotationDegrees($(this));
	      higherZindex ++;

        socket.emit("resizeMedia", {x: posX, y:posY, zIndex:higherZindex,  id:id, folder: currentFolder, fileName: data.name, rotation: rotation, width: width,  text : data.text  });
      }
  });




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

function onMediaRemoved(mediaData){
	$('#' + mediaData.id).css('display', 'none');
}

function onMediaChange(mediaData){
	// $(".drop-files-container").css("z-index", -1);
	// var mediaW = $(".medias-list li.no-position").width();
	// var mediaH = $(".medias-list li.no-position").height();
	// var orientation;

	// if(mediaW > mediaH){
	// 	orientation = "paysage";
	// }
	// else{
	// 	orientation = "portrait";
	// }
	// console.log('on MEDIA CHANGE');
	// console.log(mediaData);

	// Get width of media
	var mediaWidth;
	if(mediaData.width != undefined){
		mediaWidth = mediaData.width;
	}
	else{
		mediaWidth = "25";
	}

	$("#" + mediaData.id)
		.css({
			"width": mediaWidth  + "%",
			"top": mediaData.y + 'vh',
	  	"left":mediaData.x + '%',
	  	"z-index": mediaData.z,
	  	"transform":"rotate("+mediaData.rotation+"deg)",
	  	"display":"block"
		})
		// .removeClass('no-position')
		// .attr("data-orientation", orientation)
	;
	// socket.emit('takeScreenShot');
}

function padCleared(){
	$(".medias-list li").css("display", "none");
}

// function onMediaDragPosition(pos){
// 	$(".medias-list li#"+pos.id)
// 		.css({
// 			"top": pos.y,
// 	  	"left":pos.x,
// 	  	"z-index":pos.z
// 		});	
// }

// function onMediaDragPositionForAll(pos){
// 	$(".medias-list li#"+pos.id)
// 	.css({
//   	"z-index":pos.z,
// 	});	
// }

// function padCleared(){
// 	location.reload();
// }

/* sockets */
function onSocketConnect() {
	sessionId = socket.io.engine.id;
	console.log('Connected ' + sessionId);
	socket.emit("listAllMedias", currentFolder);
};

function onSocketError(reason) {
	console.log('Unable to connect to server', reason);
};



function processFileUpload(droppedFiles, callback) {
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
  success : function(ret){
  	console.log(ret);
  },
  error: function(request, error) {
      console.log(request, error);
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

function getRotationDegrees(obj) {
    var matrix = obj.css("-webkit-transform") ||
    obj.css("-moz-transform")    ||
    obj.css("-ms-transform")     ||
    obj.css("-o-transform")      ||
    obj.css("transform");
    if(matrix !== 'none') {
        var values = matrix.split('(')[1].split(')')[0].split(',');
        var a = values[0];
        var b = values[1];
        var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
    } else { var angle = 0; }
    return (angle < 0) ? angle + 360 : angle;
}