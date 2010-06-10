(function() {
  
  if(window !== window.top)
    return;
  
  console.log('injected');
    
  var show_link = function(link) {
    prompt('Short link to this page', link);
  };

  var find_metatags = function() {
    console.log('checking for metatags');
    
    var links = document.getElementsByTagName('link');
    var link = null;
    
    if(links.length == 0) {
      safari.self.tab.dispatchMessage("no metatags", null);
      return;
    }
    
    for(var i = 0; i < links.length; i++)
    {
      link = links[i];
      if(link.rel == 'shorturl' || link.rel == 'shortlink' || link.rev == 'canonical') {
        console.log('Sending "found metatag" with data: ' + link.href);
        safari.self.tab.dispatchMessage("found metatag", link.href);
        return;    
      }
    }
    console.log('didnt find any, sending message back');
    safari.self.tab.dispatchMessage("no metatags", null);
  };

  
  var handle_message = function(msgEvent) {
    var messageName = msgEvent.name;
    var messageData = msgEvent.message;
    
    console.log('inject message: ' + messageName);

    if(messageName === 'check for metatag') 
      find_metatags();

    if(messageName === 'show shorturl')
      show_link(messageData);
  };

  var handle_keypress = function(e) {
    console.log('handing ' + e.keyCode);
    if(e.keyCode !== 223) return;
    safari.self.tab.dispatchMessage("keyboard", window.location.href);
  }

  safari.self.addEventListener("message", handle_message, false);
  window.addEventListener("keypress", handle_keypress)
})();

