'use strict'

var integration = require('@segment/analytics.js-integration')

var Asayer = module.exports = integration('asayer')
  .global('asayer')
  .option('siteId', null)
  .tag('<script src="https://static.asayer.io/asayer.js" data-asayer-ns="asayer"></script>')

Asayer.prototype.initialize = function () {
  var siteId = Number(this.options.siteId)

  if (this.options.siteId === null || isNaN(siteId)) {
    console.warn('Asayer wrong siteId option, not loading.')
    return
  }

  var r = [siteId]
  var asayer = window.asayer = { r: r }
  asayer.start = function (v) { r.push([0]) }
  asayer.vars = function (k, v) { r.push([1, k, v]) }
  asayer.event = function (t, p) { r.push([2, t, p]) }
  asayer.id = Function.prototype
  asayer.started = function () { return false }

  this.load(this.ready)
}

Asayer.prototype.identify = function (identify) {
  if (identify.userId()) {
    window.asayer.vars('userId', String(identify.userId()))
  }
  var traits = identify.traits({
    'anonymousId': 'anonymousId'
  })
  for (var key in traits) {
    if (traits.hasOwnProperty(key)) {
      var value = traits[key]
      if (value !== null && typeof value !== 'boolean' && typeof value !== 'string' && (typeof value !== 'number' || !isFinite(value))) {
        delete traits[key]
      }
    }
  }
  window.asayer.vars(traits)
}

Asayer.prototype.track = function (track) {
  var props = track.properties()
  if (typeof props === 'object' && !Array.isArray(props)) {
    window.asayer.event(track.event(), props)
  }
}
