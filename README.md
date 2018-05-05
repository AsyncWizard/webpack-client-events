# webpack-client-events

Allow to manage webpack client events by using [EventEmitter2](https://github.com/EventEmitter2/EventEmitter2).
Loading chunk is virtually in waiting state until promises are resolved so you can report loading for e.g. integrating other chunks (i18n ones ? -- initial purpose of this library) 

## Installation

Install with npm:

```
npm i --save webpack-client-events
```

## Usage

**webpack.config.js**

```js
import WebpackClientEvents from 'webpack-client-events';

let wph = new WepbackClientHooks();

wph
  /**
   * chunkAppend event listener:
   * Emitted when <script> tag is added to the <head>
   * The "src" attribute need to be match the wph.chunkRx RegExp
   *   Default: /\/([^/]+)\.js$/
   *   The parenthesis capture result is given in callback parameters
   */
  .on('chunkAppend', function(chunkId){
    
    /**
     * Loading is virtually waiting until the promise is resolved.
     * It's possible to stop chunk integration by rejecting the promise
     **/
    return new Promise(function(res, rej){
    // Promise code
    };
  })
  
  /**
   * Same thing with 'chunksLoad', you can delaying or preventing the .onload event for webpack client 
   */
  .on('chunksLoad', function(chunkId){
    return new Promise(function(resolver){
      
    })
  })
  
  /**
   * Same thing for the jsonp integration
   */
  .on('chunksCallJsonp', function(reqs, chunks){
    return new Promise(function(resolver){
      
    })
  })
  .start() //Start "listening"

  // And finally
  .stop()
```

