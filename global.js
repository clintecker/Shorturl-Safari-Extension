var bitlykey = safari.extension.settings.getItem("bitlykey");
var prefermeta = safari.extension.settings.getItem("prefermeta");
var current_url = '';

var get_shorturl = function(event) {
  if((event.command !== "shorten url") && !url) return;
  figure_out_shorturls(event.target.browserWindow.activeTab.url);
};

var figure_out_shorturls = function(url) {
  bitlykey = safari.extension.settings.getItem("bitlykey");
  bitlyusername = safari.extension.settings.getItem("bitlyusername");
  prefermeta = safari.extension.settings.getItem("prefermeta");

  console.log(bitlykey);
  console.log(bitlyusername);
  console.log(prefermeta);

  current_url = url;

  if(prefermeta) {
    // Dispatch a call for the meta tags
    console.log('sending message to check for metatag');
    safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("check for metatag", null);
  } else {
    if (bitlykey && bitlyusername) {
      getBitlyURL(current_url, bitlykey, bitlyusername, handle_shorturl);
    } else {
      getIsGdURL(current_url, handle_shorturl);
    }
  }
};

var handle_shorturl = function(shorturl) {
  console.log('Sending show shorturl message for: ' + shorturl);
  safari.application.activeBrowserWindow.activeTab.page.dispatchMessage("show shorturl", shorturl);
};
 
var validate_shorturl = function(event) {
  if(event.command === "shorten url") {
    // Disable the button if there is no URL loaded in the tab.
    event.target.disabled = !event.target.browserWindow.activeTab.url;
  }
};

var getBitlyURL = function(url, key, username, callback) {
  console.log('Getting bitly url');
  var endpoint = "http://api.bit.ly/v3/shorten?login="+username+"&apiKey="+key+"&longUrl="+escape(url)+"&format=txt";
  var myRequest = new XMLHttpRequest();
  myRequest.open("GET", endpoint);
  console.log('opening ' + endpoint);
  myRequest.onload = function() {
    callback(myRequest.responseText);
  };
  myRequest.send();
};
  
var getIsGdURL = function(url, callback) {
  console.log('Getting isgd url');
  var endpoint = 'http://is.gd/api.php?longurl=' + escape(url);
  var myRequest = new XMLHttpRequest();
  myRequest.open("GET", endpoint);
  console.log('opening ' + endpoint);
  myRequest.onload = function() {
    callback(myRequest.responseText);
  };
  myRequest.send();
};

var handle_message = function(msgEvent) {
  var messageName = msgEvent.name;
  var messageData = msgEvent.message;
  
  console.log(messageName);
  console.log(messageData);

  if(messageName === 'found metatag') {
    handle_shorturl(messageData);
  } else if(messageName === 'no metatags') {
    if (bitlykey && bitlyusername) {
      getBitlyURL(current_url, bitlykey, bitlyusername, handle_shorturl);
    } else {
      getIsGdURL(current_url, handle_shorturl);
    }
  } else if(messageName == 'keyboard') {
    figure_out_shorturls(messageData);
  }

};

safari.application.addEventListener("command", get_shorturl, false);
safari.application.addEventListener("validate", validate_shorturl, false);
safari.application.addEventListener("message", handle_message, false);
