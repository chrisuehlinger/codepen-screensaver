/* #region Setup */

var debug = false;
var mouseDelta = {};

var request = require('request');
var parseString = require('xml2js').parseString;
var gui = require('nw.gui'); 


if(debug) {
  gui.Window.get().showDevTools();
  
}

$(function(){
  $('body').append('<div class="overlay"></div>');
  setEvents();
});


function setEvents() {
  $(window).mousemove(function(e) {  
    if(!mouseDelta.x) {
      mouseDelta.x = e.pageX;
      mouseDelta.y = e.pageY;
      return false;
    }  
    
    deltax = Math.abs(e.pageX - mouseDelta.x);
    deltay = Math.abs(e.pageY - mouseDelta.y);  
    if(deltax > 20 || deltay > 20){
      endScreensaver(e);
    }
  });

  $(window).on("mousedown keydown", function(e){
    console.log("Event: mousedown||keydown", e);
    if(e.keyCode == 37) { // Prev     
      console.log("keydown", "prev");
      changePhoto(true);
      return false;
    }else if(e.keyCode == 39) { // Next
      console.log("keydown", "next");
      changePhoto();
      return false;
    }else if(e.keyCode == 27) { // Escape
      console.log("keydown", "next");
      gui.App.quit();
      return false;
    }else if(e.keyCode == 32) { // Play/Pause
      if(playing){
        console.log("keydown", "stop");
        stopSlide();
        $('#statusPause').removeClass('hide');
        playing = false;
      }else{
        console.log("keydown", "start");
        startSlide();
        $('#statusPause').addClass('hide');
        playing = true;
      }      
      return false;
    }
    if(!debug){
      e.preventDefault();    
    }
    endScreensaver(e);   
  });
}

function endScreensaver(e) {
  //console.log("endScreensaver", e);
  if(!debug){ // don't close on debug-mode
    gui.App.quit();
  }
}

/* #endregion */
 
var pens = [];
var currentPage = 1;
var maxPage = 3;
request('https://codepen.io/picks/feed', function (error, response, body) {
  if (error || response.statusCode !== 200) {
    console.log('Error:' + JSON.stringify(error));
    return ;
  }
  console.log(body);
  
  var result = $.parseXML( body);
  console.log($('item link',result));
  var rawPens = $('item link',result);
  rawPens.each(function(i, penData){
    console.log(penData);
    var pen = penData.innerHTML.replace('/pen/', '/full/');
    pens.push(pen);
  });
  
  run(pens);
  
  nextPage();
  
  function nextPage(){
    currentPage++;
    if(currentPage <= maxPage)
      request('https://codepen.io/picks/feed?page=' + currentPage, function (error, response, body) {
        if (error || response.statusCode !== 200) {
          console.log('Error:' + JSON.stringify(error));
          return ;
        }

        var result = $.parseXML( body);
        var rawPens = $('item link',result);
        rawPens.each(function(i, penData){
          console.log(penData);
          var pen = penData.innerHTML.replace('/pen/', '/full/');
          pens.push(pen);
        });
        
        nextPage();
      });
  };
});

//run([
//  'http://codepen.io/isac/full/jELyQx',
//  'http://codepen.io/mariosmaselli/full/raqKQm',
//  'http://codepen.io/gpyne/full/WvvoYP',
//]);

function run(pens){
  console.log('Loaded: ' + JSON.stringify(pens, null, 4));
  var i = 0;
  var penFrame = $('.pen-frame');
  newPen(true);
  setInterval(newPen, 10000);
  
  function newPen(firstTime){
    var delay = firstTime ? 500 : 250;
    
    if(firstTime){
      $('.default-bg').fadeOut(500);
    }
    
    penFrame.fadeOut(500, function(){
      penFrame.attr('src', pens[i]);
      setTimeout(function(){
        penFrame.fadeIn(500);
      }, delay);
      
      i++;
      if(i > pens.length-1)
        i = 0;
    })
  };
};