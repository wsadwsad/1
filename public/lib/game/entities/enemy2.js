ig.module(
    'game.entities.enemy2'
)
    .requires(
        'impact.entity',
        'game.entities.fireball4',
        'game.entities.player'
    )

    .defines(function(){

        EntityEnemy2 = ig.Entity.extend({
            size: {x: 33, y: 36},
            maxVel: {x: 100, y: 100},
            friction: {x: 150, y: 0},
            type: ig.Entity.TYPE.B, // Evil enemy group
            checkAgainst: ig.Entity.TYPE.A, // Check against friendly
            collides: ig.Entity.COLLIDES.PASSIVE,
            timer: new ig.Timer(3),

            health: 8,
            speed: 0,
            flip: true,

            animSheet: new ig.AnimationSheet( 'media/enemy2.png', 33, 36 ),
            sfxDie: new ig.Sound( 'media/sounds/Blood_Squirt.*' ),


            init: function( x, y, settings ) {
                this.parent( x, y, settings );

                this.addAnim( 'crawl', 0.2, [0] );
                this.addAnim( 'dead', 1, [0] );
                ig.game.enemy2 = this;
                this.timer = new ig.Timer(0.5);
            },

            update: function() {
                var player = ig.game.getEntitiesByType(EntityPlayer)[0];
                if( !ig.game.collisionMap.getTile(
                        this.pos.x + (this.flip ? +4 : this.size.x -4),
                        this.pos.y + this.size.y+1
                    )
                ) {
                    this.flip = !this.flip;
                }
                var xdir = this.flip ? -1 : 1;
                this.vel.x = this.speed * xdir;

                if(this.timer.delta() > .8)
                {
                     if(player){
                        if(player.pos.x < this.pos.x) {
                            if(this.flip)
                            {
                                this.currentAnim.flip.x = this.flip;
                            }
                            ig.game.spawnEntity(EntityFireball4, this.pos.x-20, this.pos.y+5, {flip: this.flip}, 1);
                            this.timer.reset();
                        }
                        else
                        {
                            if(this.flip)
                            {
                                this.currentAnim.flip.x = !this.flip;
                            }
                            ig.game.spawnEntity(EntityFireball4, this.pos.x, this.pos.y, {flip: !this.flip}, 1);
                            this.timer.reset();
                        }
                    }
                }
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
                    this.offset.x = this.flip ? 0 : 24;
                }
            },
            check: function( other ) {
                other.receiveDamage( 1, this );
            }
        });
    });
