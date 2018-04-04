const EventEmitter = require('eventemitter2').EventEmitter2
const defaultChunkRx = /\/([^/]+)\.js$/
const noop = function () {}

export default class extends EventEmitter {
  constructor () {
    super()
    this.chunkRx = defaultChunkRx
    this._observer = new window.MutationObserver(mutations => {
      for (let mutationRecord of mutations) {
        for (let node of mutationRecord.addedNodes) {
          let chunkId = null
          if (node instanceof window.HTMLScriptElement &&
            node.type === 'text/javascript' &&
            ([, chunkId] = this.chunkRx.exec(node.src))
          ) {
            this
              .emitAsync('chunkAppend', chunkId)
              .then(() => {
                let originalOnload = node.onload
                let originalOnerror = node.onerror
                node.onload = () => this.emitAsync('chunksLoad', chunkId).then(originalOnload)
                node.onerror = () => this.emitAsync('chunksError', chunkId).then(originalOnerror)
              })
              .catch(noop)
          }
        }
      }
    })
  }
  start (node = window.document.head) {
    this._observer.observe(node, {
      childList: true
    })
    this._initialWebpackJsonp = window.webpackJsonp
    let initialWebpackJsonp = window.webpackJsonp
    window.webpackJsonp = (requesters, chunks) => {
      this
        .emitAsync('chunksCallJsonp', requesters, chunks)
        .then(() => initialWebpackJsonp(requesters, chunks))
    }
    return this
  }
  stop () {
    this._observer.disconnect()
    window.webpackJsonp = this._initialWebpackJsonp
    return this
  }
}
