ig.module(
	'game.entities.levelchange'
)
	.requires(
		'impact.entity'
	)
	.defines(function(){
		EntityLevelchange = ig.Entity.extend({
			_wmDrawBox: true,
			_wmBoxColor: 'rgba(0, 0, 255, 0.7)',

			size: {x: 32, y: 32},
			level: null,

			triggeredBy: function( entity, trigger ) {
				if( this.level ) {
					var levelName = this.level.replace(/^(Level)?(\w)(\w*)/, function( m, l, a, b ) {
						return a.toUpperCase() + b;
					});
					ig.game.loadLevelDeferred( ig.global['Level'+levelName] );
				}
			},
			update: function(){}
		});
	});