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

		maxVel: {x: 400, y: 800},

		type: ig.Entity.TYPE.A, // Player friendly group
		checkAgainst: ig.Entity.TYPE.NONE,
		collides: ig.Entity.COLLIDES.PASSIVE,
		//checkAgainst: ig.Entity.TYPE.B,


		friction: {x: 600, y: 0},

		size: {x: 32, y: 40},
		sfxHurt: new ig.Sound( 'media/sounds/hurt2.*' ),
		sfxreload: new ig.Sound( 'media/sounds/reload.*' ),
		sfxDie: new ig.Sound( 'media/sounds/Blood_Squirt.*' ),


		health: 3,
		flip: false,
		move: 200,
		jump: 450,
		maxHealth: 3,

		coins: 0,

		animSheet: new ig.AnimationSheet( 'media/player.png', 38, 41 ),

		handlesInput: true,

		init: function( x, y, settings ) {

			this.parent( x, y, settings );
			ig.merge(this, settings);

			this.addAnim( 'idle', 1, [5] );
			this.addAnim( 'run', 0.18, [0,1,2,3,4,2] );
			this.addAnim( 'jump', 0.1, [12,13,14] );
			this.addAnim( 'fall', 0.4, [4], true );
			this.addAnim( 'pain', 0.3, [15], true );

			this.remoteAnim = "idle";


			ig.game.player = this;

		},

		update: function() {
			this.parent();

			if(this.handlesInput){
				this.initKeys();
			}

		},

		broadcastPosition: function(){
			ig.game.gamesocket.send('move', {
				pos: this.pos,
				remoteAnim: this.remoteAnim,
				remoteId: this.remoteId,
				flip: this.flip
			});
		},

		initKeys: function(){

			if( ig.input.pressed('jump') ) {
				this.vel.y = -this.jump;
			}

			if( ig.input.pressed('shoot') ) {
				if (this.coins < 2){
					ig.game.spawnEntity( EntityFireball, this.pos.x+10, this.pos.y+10, {flip:this.flip} );
					ig.game.gamesocket.send('spawnSimpleEntity', {
						ent: "EntityFireball",
						x: this.pos.x+10,
						y: this.pos.y+10,
						settings: {flip: this.flip}})
				}

				else if (this.coins >= 5){
					ig.game.spawnEntity( EntityFireball3, this.pos.x+5, this.pos.y+10, {flip:this.flip} );
					ig.game.gamesocket.send('spawnSimpleEntity', {
						ent: "EntityFireball3",
						x: this.pos.x+5,
						y: this.pos.y+10,
						settings: {flip: this.flip}})
				}
				else if (this.coins >= 2){
					ig.game.spawnEntity( EntityFireball2, this.pos.x+10, this.pos.y+10, {flip:this.flip} );
					ig.game.gamesocket.send('spawnSimpleEntity', {
						ent: "EntityFireball2",
						x: this.pos.x+10,
						y: this.pos.y+10,
						settings: {flip: this.flip}})
				}
			}

			var move = this.move;
			if(ig.input.state('left') ){
				this.vel.x = -move;
				this.flip = true;
			}else if(ig.input.state('right') ){
				this.vel.x = move;
				this.flip = false;
			}else{
				this.vel.x = 0;
			}

			// animations
			if(this.currentAnim == this.anims.pain &&
				this.currentAnim.loopCount < 1
			) {
				this.broadcastPosition();
				this.remoteAnim = 'pain';
				if( this.health <= 0 ) {
					var dec = (1/this.currentAnim.frameTime) * ig.system.tick;
					this.currentAnim.alpha = (this.currentAnim.alpha - dec).limit(0,1);

				}
			}
			else if( this.health <= 0 ) {
				this.kill();
				this.broadcastPosition();
			}
			else if( this.vel.y < 0 ) {
				this.currentAnim = this.anims.jump;
				this.broadcastPosition();
				this.remoteAnim = 'jump';

			}
			else if( this.vel.y > 0 ) {
				if( this.currentAnim != this.anims.fall ) {
					this.currentAnim = this.anims.fall;
					this.broadcastPosition();
					this.remoteAnim = 'fall';

				}
				else{
					this.currentAnim = this.anims.fall;
					this.broadcastPosition();
					this.remoteAnim = 'fall';
				}
			}
			else if( this.vel.x != 0 ) {
				this.currentAnim = this.anims.run;
				this.broadcastPosition();
				this.remoteAnim = 'run';

			}
			else {
				this.currentAnim = this.anims.idle;
				this.broadcastPosition();
				this.remoteAnim = 'idle';

			}

			this.currentAnim.flip.x = this.flip;
		},

		kill: function(){
			this.pos.x = 40;
			this.pos.y = 64;
			ig.game.gamesocket.announce({text: this.remoteId+" got killed!"});
			this.parent();

		},

		handleMovementTrace: function( res ) {
			this.parent(res);
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
});