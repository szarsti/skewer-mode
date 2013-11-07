// ==UserScript==
// @name         Skewer Console
// @description  Run skewer at page load and hijack console object.
// @lastupdated  2013-09-30
// @installURL   http://localhost.ig.com/skewer/runner.user.js
// @version      1.0
// @license      Public Domain
// @include      https://localhost.ig.com/*
// @run-at document-start
// ==/UserScript==

(function runner(doc, console) {
   var host = 'https://localhost.ig.com',
       script = doc.createElement('script'),
       stash = [],
       injected = false;

   function logger(level, chain, message) {
      var parts = Array.prototype.slice.call(arguments, 2),
          formatted = parts.join(' ');
      chain && chain.apply(null, parts);
      if (window.skewer !== undefined) {
         skewer.log(formatted);
      } else {
         stash.push(formatted);
      }
   }

   function decorate(console) {
      ['debug', 'info', 'warn', 'error'].forEach(function(level) {
         console[level] = logger.bind(null, level, console[level] && console[level].bind(console));
      });         
      console.log = logger.bind(null, 'debug', console.logger && console.log.bind(console));
      return console;
   }

   script.src =  host + '/skewer';
   script.onload =  function onskewerload() {
      var i;
      if (!('skewer' in window)) {
         throw new Error("Skewer should be initialised by now");
      }
      for (i = 0; i < stash.length; i ++) {
         skewer.log(stash[i]);
      }
      stash = null;
   };

   doc.addEventListener('DOMNodeInserted', function(event) {
      if (!injected && event.target.parentNode.tagName == 'HEAD') {
         injected = true;
         event.target.parentNode.insertBefore(script, event.target);
         decorate(console || {});
      }
   });
})(document);

