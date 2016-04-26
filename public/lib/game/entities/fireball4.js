ig.module(
    'game.entities.fireball4'
)
    .requires(
        'impact.entity',
        'impact.entity-pool'
    )

    .defines(function(){

        EntityFireball4 = ig.Entity.extend({
            _wmIgnore: true,
            gravityFactor: 0,
            maxVel: {x: 800, y: 400},
            playposition_x: null,

            distance: 400,

            type: ig.Entity.TYPE.NONE,
            checkAgainst: ig.Entity.TYPE.A,
            collides: ig.Entity.COLLIDES.PASSIVE,

            animSheet: new ig.AnimationSheet( 'media/bullet4.png', 45, 13 ),
            sfxSpawn: new ig.Sound( 'media/sounds/fireball4.*' ),

            init: function( x, y, settings ) {
                this.parent( x, y, settings );

                this.vel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
                this.vel.y = 0;
                this.addAnim( 'idle', 1, [0] );
                this.playposition_x = x;
                this.sfxSpawn.play();
            },

            reset: function( x, y, settings ) {
                this.parent( x, y, settings );

                this.vel.x = (settings.flip ? -this.maxVel.x : this.maxVel.x);
                this.vel.y = 0;
                this.sfxSpawn.play();
                this.playposition_x = x;
            },

            update: function() {
                if (Math.abs(this.playposition_x - this.pos.x) > this.distance || Math.abs(this.playposition_x - this.pos.x) < -this.distance) {
                    this.kill();
                }
                this.parent();

                this.currentAnim.angle = 0;
            },

            handleMovementTrace: function( res ) {
                this.parent( res );

                if( res.collision.x || res.collision.y || res.collision.slope ) {
                    this.kill();
                }
            },

            check: function( other ) {
                other.receiveDamage( 1, this );
                this.kill();
            }
        });
        ig.EntityPool.enableFor( EntityFireball4 );
    });
