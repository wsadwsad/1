ig.module(
	'game.entities.player'
)
	.requires(
		'impact.entity',
		'game.entities.fireball',
		'game.entities.fireball2',
		'game.entities.fireball3'
	)

	.defines(function(){

		EntityPlayer = ig.Entity.extend({
            name: "player",
            gamename: playername,
            currentanimation: 0,
			size: {x: 32, y: 40},
			maxVel: {x: 400, y: 800},

			type: ig.Entity.TYPE.A, // Player friendly group
			checkAgainst: ig.Entity.TYPE.NONE,
			collides: ig.Entity.COLLIDES.PASSIVE,

			animSheet: new ig.AnimationSheet( 'media/player.png', 38, 41 ),

			sfxHurt: new ig.Sound( 'media/sounds/hurt2.*' ),
			sfxreload: new ig.Sound( 'media/sounds/reload.*' ),
			sfxDie: new ig.Sound( 'media/sounds/Blood_Squirt.*' ),

			health: 3,
			flip: false,
			move: 200,
			jump: 450,
			maxHealth: 3,

			coins: 0,

			init: function( x, y, settings ) {
				this.parent( x, y, settings );

				this.addAnim( 'idle', 1, [5] );
				this.addAnim( 'run', 0.18, [0,1,2,3,4,2] );
				this.addAnim( 'jump', 0.1, [12,13,14] );
				this.addAnim( 'fall', 0.4, [4], true );
				this.addAnim( 'pain', 0.3, [15], true );

				ig.game.player = this;
                socket.emit('initializeplayer', this.gamename);
			},

			update: function() {
				var move = this.move;
				if( ig.input.state('left') ) {
					this.vel.x = -move;
					this.flip = true;
				}
				else if( ig.input.state('right') ) {
					this.vel.x = move;
					this.flip = false;
				}
				else {
					this.vel.x = 0;
				}

				if( this.standing && ig.input.pressed('jump') ) {
					this.vel.y = -this.jump;
				}

				if( ig.input.pressed('shoot') ) {
					if (this.coins < 2){
						ig.game.spawnEntity( EntityFireball, this.pos.x+10, this.pos.y+10, {flip:this.flip} );
					}
					else if (this.coins >= 5){
						ig.game.spawnEntity( EntityFireball3, this.pos.x+5, this.pos.y+10, {flip:this.flip} );
					}
					else if (this.coins >= 2){
						ig.game.spawnEntity( EntityFireball2, this.pos.x+10, this.pos.y+10, {flip:this.flip} );
					}
				}

				if(this.currentAnim == this.anims.pain &&
					this.currentAnim.loopCount < 1
				) {
					if( this.health <= 0 ) {
						var dec = (1/this.currentAnim.frameTime) * ig.system.tick;
						this.currentAnim.alpha = (this.currentAnim.alpha - dec).limit(0,1);
					}
				}
				else if( this.health <= 0 ) {
					this.kill();
				}
				else if( this.vel.y < 0 ) {
					this.currentAnim = this.anims.jump;
                    currentanimation = 1;
				}
				else if( this.vel.y > 0 ) {
					if( this.currentAnim != this.anims.fall ) {
						this.currentAnim = this.anims.fall.rewind();
                        currentanimation = 2;
					}
				}
				else if( this.vel.x != 0 ) {
					this.currentAnim = this.anims.run;
                    currentanimation = 3;
				}
				else {
					this.currentAnim = this.anims.idle;
                    currentanimation = 4;
				}

				this.currentAnim.flip.x = this.flip;
                socket.emit('recievedata', this.pos.x, this.pos.y, currentanimation, this.gamename);
				this.parent();
			},

			kill: function() {

				this.sfxDie.play();

				this.parent();

				ig.game.reloadLevel();

			},

			giveCoins: function( amount ) {
				this.coins += amount;
				if (this.coins == 2)
				{
					this.sfxreload.play();
				}
				else if (this.coins == 5)
				{
					this.sfxreload.play();
				}
			},


			receiveDamage: function( amount, from ) {
				if( this.currentAnim == this.anims.pain ) {
					return;
				}
				this.health -= amount;
				if(this.coins > 1)
				{
					this.coins -= 2;
				}
				this.currentAnim = this.anims.pain.rewind();

				this.vel.x = (from.pos.x > this.pos.x) ? -400 : 400;
				this.vel.y = -300;
				this.sfxHurt.play();
			}
		});

		EntityOtherplayer = ig.Entity.extend({
            name: "otherplayer",
            gamename: "",
            animation: 0,
			size: {x: 32, y: 40},
			maxVel: {x: 400, y: 800},

			type: ig.Entity.TYPE.A, // Player friendly group
			checkAgainst: ig.Entity.TYPE.NONE,
			collides: ig.Entity.COLLIDES.PASSIVE,

			health: 3,
			flip: false,
			move: 200,
			jump: 450,
			maxHealth: 3,
			coins: 0,

            animSheet: new ig.AnimationSheet( 'media/player.png', 38, 41 ),

            sfxHurt: new ig.Sound( 'media/sounds/hurt2.*' ),
            sfxreload: new ig.Sound( 'media/sounds/reload.*' ),
            sfxDie: new ig.Sound( 'media/sounds/Blood_Squirt.*' ),



			init: function( x, y, settings ) {
				this.parent( x, y, settings );

				this.addAnim( 'idle', 1, [5] );
				this.addAnim( 'run', 0.18, [0,1,2,3,4,2] );
				this.addAnim( 'jump', 0.1, [12,13,14] );
				this.addAnim( 'fall', 0.4, [4], true );
				this.addAnim( 'pain', 0.3, [15], true );

				ig.game.player = this;
			},
            // place the new player
            netmoveplayer: function() {
                this.pos.x = positionx;
                this.pos.y = positiony;
            },
			update: function() {
                switch (this.animation) {
                    case 1:
                        this.currentAnim = this.anims.jump;
                        break;
                    case 2:
                        this.currentAnim = this.anims.down;
                        break;
                    case 3:
                        this.currentAnim = this.anims.fall;
                        break;
                    case 4:
                        this.currentAnim = this.anims.idle;
                        break;

                }
                this.parent();
            }
		});
	});