ig.module(
	'game.entities.enemy1'
)
	.requires(
		'impact.entity'
	)

	.defines(function(){
		EntityEnemy1 = ig.Entity.extend({
			size: {x: 30, y: 25},
			maxVel: {x: 100, y: 100},
			friction: {x: 150, y: 0},
			type: ig.Entity.TYPE.B, // Evil enemy group
			checkAgainst: ig.Entity.TYPE.A, // Check against friendly
			collides: ig.Entity.COLLIDES.PASSIVE,

			health: 4,
			speed: -200,
			flip: true,

			animSheet: new ig.AnimationSheet( 'media/enemy1.png', 30, 25 ),
			sfxDie: new ig.Sound( 'media/sounds/Blood_Squirt.*' ),

			init: function( x, y, settings ) {
				this.parent( x, y, settings );

				this.addAnim( 'crawl', 0.2, [0,1,2,3] );
				this.addAnim( 'dead', 1, [2] );
				ig.game.enemy1 = this;
			},

			update: function() {
				// Near an edge? return!
				if( !ig.game.collisionMap.getTile(
						this.pos.x + (this.flip ? +20 : this.size.x -20),
						this.pos.y + this.size.y+1
					)
				) {
					this.flip = !this.flip;
				}
				var xdir = this.flip ? -1 : 1;
				this.vel.x = this.speed * xdir;
				this.currentAnim.flip.x = !this.flip;

				this.parent();
			},

			kill: function() {
				this.sfxDie.play();
				this.parent();
			},

			handleMovementTrace: function( res ) {
				this.parent( res );

				if( res.collision.x ) {
					this.flip = !this.flip;
				}
			},

			check: function( other ) {
				other.receiveDamage( 1, this );
			}
		});
	});