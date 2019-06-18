'use strict'

var integration = require('@segment/analytics.js-integration')

var Asayer = module.exports = integration('Asayer')
  .global('asayer')
  .option('sid', null)
  .tag('<script src="https://static.asayer.io/asayer.js" data-asayer-ns="asayer"></script>')

Asayer.prototype.initialize = function () {
  var sid = Number(this.options.sid)

  if (this.options.sid === null || isNaN(sid)) {
    console.warn('Asayer wrong sid option, not loading.')
    return
  }

  var r = [sid]
  var asayer = window.asayer = { r: r }
  asayer.start = function (v) { r.push([0]) }
  asayer.vars = function (k, v) { r.push([1, k, v]) }
  asayer.event = function (t, p) { r.push([2, t, p]) }

  this.load(this.ready)
}

Asayer.prototype.identify = function (identify) {
  if (identify.userId()) {
    window.asayer.vars('segment_user_id', String(identify.userId()))
  }
  var traits = identify.traits({
    'anonymousId': 'segment_anonymous_id',
    'email': 'segment_email',
    'firstName': 'segment_firstname',
    'lastName': 'segment_lastname',
    'name': 'segment_name',
    'title': 'segment_title',
    'phone': 'segment_phone',
    'username': 'segment_username'
  })
  for (var key in traits) {
    if (traits.hasOwnProperty(key)) {
      if (key.substring(0, 8) !== 'segment_') {
        delete traits[key]
        continue
      }
      var value = traits[key]
      if (typeof value !== 'string' && (typeof value !== 'number' || !isFinite(value))) {
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
