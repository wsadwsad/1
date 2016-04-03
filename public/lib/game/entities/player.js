ig.module (
    'game.entities.player'      // name of file
)

.requires(
    'impact.entity'
)
.defines(function(){
    var ismove = 0;
/*  impactjs.com/documentation/class_reference/entity#checkAgainst
    must be EntityPlayer or EntityEnemy,
    3. Set size
    4. Set type*/
    EntityPlayer = ig.Entity.extend({
        size: {x: 32, y: 48},
        direction: 1,
        type: ig.Entity.TYPE.A,
		messagebox: "",
		messageboxtimer: 100,
        nettimer: 10,
        name: "player",
        gamename: playername,
        speed: 100,
        checkAgainst: ig.Entity.TYPE.NONE,
        collides: ig.Entity.COLLIDES.PASSIVE,
		
	    // 1. animation sheet where the animation resides. Size of each animation. 
        animSheet: new ig.AnimationSheet( 'media/player.png', 32, 48 ),
        
        init: function( x, y, settings ) {
            this.parent( x, y, settings );  // 5. must have this for app to work
            this.health = 100;

            // 2. Add the animations. Specify speed and then location in the animation sheet.
            this.addAnim( 'up', .21, [9,10,11] );
            this.addAnim( 'down', .21, [0,1,2] );
            this.addAnim( 'left', .21, [3,4,5] );
            this.addAnim( 'right', .21, [6,7,8] );
            this.addAnim( 'idleup', 0.1, [10] );
            this.addAnim( 'idledown', 0.1, [1] );
            this.addAnim( 'idleleft', 0.1, [4] );
            this.addAnim( 'idleright', 0.1, [7] );

            //this.currentAnim = this.anims.idledown;
            socket.emit('initializeplayer', this.gamename);
	    },

		update: function() {    		// 6. Update function
            if( ig.input.state('left') && ismove != 1 && ismove != 2 && ismove != 4) {
				this.vel.x = -this.speed;
                ismove = 3;
                this.direction = 3;
		        //this.currentAnim = this.anims.left;
			}
			else if( ig.input.state('right')  && ismove != 1 && ismove != 3 && ismove != 4) {
				this.vel.x = +this.speed;
				ismove = 2;
				this.direction = 2;
				//this.currentAnim = this.anims.right;
			}
			else if( ig.input.state('up')  && ismove != 3 && ismove != 2 && ismove != 4) {
				this.vel.y = -this.speed;
				ismove = 1;
				this.direction = 1;
				this.messagebox = this.messagebox + "you pressed up \n";
				//this.currentAnim = this.anims.up;
			}
			else if( ig.input.state('down')  && ismove != 1 && ismove != 2 && ismove != 3) {
				this.vel.y = +this.speed;
				ismove = 4;
				this.direction = 4;
				//this.currentAnim = this.anims.down;
			}
			else {
				this.vel.x = 0;
				this.vel.y = 0;
				ismove = 0;
			}

            // animate
            if( this.vel.y < 0 ) {
                this.currentAnim = this.anims.up;
                currentanimation = 1;
            }
            else if( this.vel.y > 0 ) {
                this.currentAnim = this.anims.down;
                currentanimation = 2;
            }
            else if( this.vel.x > 0 ) {
                this.currentAnim = this.anims.right;
                currentanimation = 4;
            }
            else if( this.vel.x < 0 ) {
                this.currentAnim = this.anims.left;
                currentanimation = 3;
            }
            else {
                if( this.direction == 4 ) {
                    this.currentAnim = this.anims.idledown;
                    currentanimation = 6;
                }
                if( this.direction == 3 ) {
                    this.currentAnim = this.anims.idleleft;
                    currentanimation = 7;
                }
                if( this.direction == 2 ) {
                    this.currentAnim = this.anims.idleright;
                    currentanimation = 8;
                }
                if( this.direction == 1 ) {
                    this.currentAnim = this.anims.idleup;
                    currentanimation = 5;
                }
            }
        // set timer to decrease the number of packets sent
        if(this.nettimer < 1) {
            this.nettimer = 5;
            socket.emit('recievedata', this.pos.x, this.pos.y, currentanimation, this.gamename);
        }
        this.nettimer = this.nettimer - 1;

        this.parent();  		// 7. Very Important!
        }
    });

    ///////////////////////////////Enemy Other Players////////////////////////////////
    EntityOtherplayer = ig.Entity.extend({
        size: {x: 32, y: 48},
        type: ig.Entity.TYPE.B,
        name: "otherplayer",
        gamename: "",
        animation: 1,
        collides: ig.Entity.COLLIDES.PASSIVE,

        animSheet: new ig.AnimationSheet( 'media/player.png', 32, 48 ),

        init: function( x, y, settings ) {
            this.parent( x, y, settings );
            this.health = 100;

            // Add the animations
            this.addAnim( 'up', .21, [9,10,11] );
            this.addAnim( 'down', .21, [0,1,2] );
            this.addAnim( 'left', .21, [3,4,5] );
            this.addAnim( 'right', .21, [6,7,8] );
            this.addAnim( 'idleup', 0.1, [10] );
            this.addAnim( 'idledown', 0.1, [1] );
            this.addAnim( 'idleleft', 0.1, [4] );
            this.addAnim( 'idleright', 0.1, [7] );
        },
        // place the new player
        netmoveplayer: function() {
            this.pos.x = positionx;
            this.pos.y = positiony;
        },

        update: function() {
            switch(this.animation)
            {
                case 1:
                    this.currentAnim = this.anims.up;
                    break;
                case 2:
                    this.currentAnim = this.anims.down;
                    break;
                case 3:
                    this.currentAnim = this.anims.left;
                    break;
                case 4:
                    this.currentAnim = this.anims.right;
                    break;
                case 5:
                    this.currentAnim = this.anims.idleup;
                    break;
                case 6:
                    this.currentAnim = this.anims.idledown;
                    break;
                case 7:
                    this.currentAnim = this.anims.idleleft;
                    break;
                case 8:
                    this.currentAnim = this.anims.idleright;
                    break;
            }
        }
    });
})