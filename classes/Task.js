var Class = require( 'classes' ).Class;

module.exports = Class.extend(
{
  setup: function( payload, callback ) {
    this.payload = payload;
    this.callback = callback;

    return [ payload, callback ];
  }
});
