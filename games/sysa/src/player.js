var CH_SIMON = 1;
var CH_MANUELITA = 2;
var CH_FRANCISCO = 3;
var CH_MATEA = 4;
var CH_CACIQUE = 5;

var IS_PLAYER = 'is_player';
var PL_BODY = 'pl_body';
var PL_FOOT = 'pl_foot';
var PL_WEAK = 'pl_weak';

var toRight = 1;
var toLeft = -1;

var player = cc.Sprite.extend({
	
	// -
	// Variable declarations
	// -
	sprite:null,
	animation:null,
	frame:null,
	jumpingFrame:null,
	world:null,
	ch:null,
	pos:null,
	numFootContacts:0,
	action:null,
	
	life:0,
	accel:0,
	maxVel:0,
	maxJumps:0,
	pointsMul:0,
	strength:0,	
	
	// -
	// Constructor method
	// -
	ctor:function(parent, ch, pos){
		this._super();
		this.parent = parent;
		this.world = parent.world;
		this.ch = ch;
		this.pos = pos;
		
		this.life = this.ch == CH_SIMON ? 4 : 3;
		this.accel = this.ch == CH_MANUELITA ? 3 : 2;
		this.maxVel = this.ch == CH_MANUELITA ? 7 : 5;
		this.maxJumps = this.ch == CH_FRANCISCO ? 3 : 2;
		this.pointsMul = this.ch == CH_MATEA ? 2 : 1;
		this.strength = this.ch == CH_CACIQUE ? 2 : 1;
		
		var spriteFrameCache = cc.SpriteFrameCache.getInstance();
		spriteFrameCache.addSpriteFrames(plist_CharacterPack);
		
		// - // create animation "ch_walking"
        var animFrames = [];
        var frame;
        var str = "";
        for (var i = 1; i < 9; i++) {
            str = "p0"+ch+"_0" + i + ".png";
            frame = spriteFrameCache.getSpriteFrame(str);
            animFrames.push(frame);
        }

        var animation = cc.Animation.create(animFrames, 0.1);
        
        // - // Add an animation to the Cache
        cc.AnimationCache.getInstance().addAnimation(animation, "ch_walking");
        
        var animCache = cc.AnimationCache.getInstance();

        var ch_walking = animCache.getAnimation("ch_walking");
        ch_walking.setRestoreOriginalFrame(true);

        var animS = cc.Animate.create(ch_walking);

        this.animation = cc.Sequence.create(animS);

        this.frame = spriteFrameCache.getSpriteFrame("p0"+ch+".png");
        this.jumpingFrame = spriteFrameCache.getSpriteFrame("p0"+ch+"_01.png");
        this.sprite = cc.Sprite.createWithSpriteFrame(this.frame);
        var spriteSize = this.sprite.getContentSize();
        this.pos = cc.p(pos.x+(spriteSize.width/2), pos.y+(spriteSize.height/2));
        this.sprite.setPosition(this.pos);
        
        this.action = cc.RepeatForever.create(this.animation);
		this.action.setTag("anim");
        
        // - // Creating the body
        // - // Body Definition
        var bodyDef = new b2BodyDef();
		bodyDef.type = b2Body.b2_dynamicBody;
		bodyDef.position.Set(this.pos.x/PTMratio, (this.pos.y)/PTMratio);
		bodyDef.userData = {
			type: IS_PLAYER,
			sprite: this.sprite,
			strength: this.strength,
		}
		bodyDef.allowSleep = true;
		bodyDef.fixedRotation = true;
		// - // Shape definition for main fixture
		var polygonShape = new b2PolygonShape();
		polygonShape.SetAsBox((spriteSize.width/PTMratio)*0.5,(spriteSize.height/PTMratio)*0.5);
		// - // Fixture definition
		var fixtureDef = new b2FixtureDef();
		fixtureDef.shape = polygonShape;
		fixtureDef.density = 1;
        fixtureDef.friction = 0.4;
        fixtureDef.restitution = 0;
        // - // Create dynamic body		
		this.body = this.world.CreateBody(bodyDef);
		// - // Add main fixture
		var mainFixture = this.body.CreateFixture(fixtureDef);
		mainFixture.SetUserData(PL_BODY);
		
		// - // Shape definition for weak fixture
		var weakPolygonShape = new b2PolygonShape();
		var spriteRealWidth = ((spriteSize.width)/PTMratio);
		var weakSizeWidth = spriteRealWidth;
		var weakPosX = 0;
		var spriteRealHeight = ((spriteSize.height)/PTMratio);
		var weakSizeHeight = spriteRealHeight*0.9;
		var weakPosY = spriteRealHeight*0.05;
		weakPolygonShape.SetAsOrientedBox((weakSizeWidth*0.5), (weakSizeHeight*0.5), new b2Vec2(weakPosX,weakPosY), 0);
		// - // Fixture definition
		var weakFixtureDef = new b2FixtureDef();
		weakFixtureDef.shape = weakPolygonShape;
		weakFixtureDef.density = 0;
		weakFixtureDef.isSensor = true;
		// - // Add weak sensor fixture
		var weakFixture = this.body.CreateFixture(weakFixtureDef);
		weakFixture.SetUserData(PL_WEAK);
		
		// - // Shape definition for foot fixture
		var footPolygonShape = new b2PolygonShape();
		var spriteRealWidth = ((spriteSize.width)/PTMratio);
		var footSizeWidth = ((spriteSize.width*0.8)/PTMratio);
		var footPosX = 0;
		var spriteRealHeight = ((spriteSize.height)/PTMratio);
		var footSizeHeight = 0.1;
		var footPosY = -spriteRealHeight*0.5;
		footPolygonShape.SetAsOrientedBox((footSizeWidth*0.5), (footSizeHeight*0.5), new b2Vec2(footPosX,footPosY), 0);
		// - // Fixture definition
		var footFixtureDef = new b2FixtureDef();
		footFixtureDef.shape = footPolygonShape;
		footFixtureDef.density = 0;
		footFixtureDef.isSensor = true;
		// - // Add foot sensor fixture
		var footFixture = this.body.CreateFixture(footFixtureDef);
		footFixture.SetUserData(PL_FOOT);
		
		this.body.SetUserMassData(4);
	},
	
	// -
	// Update method
	// -
	update:function(dt){		
		var b = this.body;
		if (b.IsAwake()) {
			var actor = b.GetUserData();
			this.pos = cc.p(b.GetPosition().x*PTMratio, b.GetPosition().y*PTMratio);
			actor.sprite.setPosition(this.pos);
		}		
        if (this.isWalking) {
			if (this.numFootContacts > 0){
				if (!this.sprite.getActionByTag("anim"))
					this.sprite.runAction(this.action);
			} else {
				this.sprite.setDisplayFrame(this.jumpingFrame);
			}
			
			var currentVel = b.GetLinearVelocity();
			var newVel = new b2Vec2(this.maxVel*this.moving, currentVel.y);
			//~ if (newVel.x > this.maxVel) newVel.x = this.maxVel;
			//~ if (newVel.x < -this.maxVel) newVel.x = -this.maxVel;					
			b.SetAwake(true);
			b.SetLinearVelocity(newVel);
			
			var flip = this.lookingRight ? false : true;
			this.sprite.runAction(cc.FlipX.create(flip));
		} else {
			var currentVel = b.GetLinearVelocity();
			var newVel = new b2Vec2(0, currentVel.y);
			b.SetLinearVelocity(newVel);
			if (this.numFootContacts > 0) {				
				if (this.sprite.getActionByTag("anim"))
					this.sprite.stopAllActions();
				this.sprite.setDisplayFrame(this.frame);
			} else {
				this.sprite.setDisplayFrame(this.jumpingFrame);
			}
		}
	},
	
	// -
    // Methods
    // -
	remove:function(){
	},
	moving:0,
	isWalking:false,
	lookingRight:true,
	walk:function(flag, direction){
		if (flag) {
			this.isWalking = true;
			this.moving = direction;			
			this.lookingRight = direction == toRight ? true : false;
		} else
			this.isWalking = false;
	},
	jumpCounter:0,
	jump:function(){
		if (this.jumpCounter < this.maxJumps) {
			var y = this.jumpCounter == 0 ? 7 : 7;
			
			//~ var force = new b2Vec2(0,y);
			//~ this.body.ApplyImpulse(force, this.body.GetWorldCenter());
			//~ this.jumpCounter++;
			
			var currentVel = this.body.GetLinearVelocity();
			var newVel = new b2Vec2(currentVel.x, 8.5);			
			this.body.SetAwake(true);
			this.body.SetLinearVelocity(newVel);
			
			this.jumpCounter++;
			
			AudioManager.playSfx('jump');
		}
	},
	hurt:function(){
		AudioManager.playSfx('hurt');
		this.life--;
		if (this.life == 0) this.die();		
	},
	die:function(){
		var ud = this.body.GetUserData();
		ud.isDead = true;
		this.parent.gameOver();
	},
	
	// -
    // Event handlers
    // -
	handleTouch:function(){
	},	
	handleKeyDown:function(e){
		if (e == cc.KEY.w || e == cc.KEY.up)
			this.jump();
		if (e == cc.KEY.d || e == cc.KEY.right)
			this.walk(true, toRight);
		if (e == cc.KEY.a || e == cc.KEY.left)
			this.walk(true, toLeft);
	},
	handleKeyUp:function(e){
		if (e == cc.KEY.d || e == cc.KEY.right || e == cc.KEY.a || e == cc.KEY.left)
			this.walk(false);
	},
	
	// -
    // Contact listener
    // -
    contactBegan:function(contact){
		var actorA = contact.GetFixtureA(),
			actorB = contact.GetFixtureB();
		if (actorA.GetUserData() == null || actorB.GetUserData() == null) return;
		if (actorA.GetBody().GetUserData().type == IS_PLAYER 
			|| actorB.GetBody().GetUserData().type == IS_PLAYER) {
			var p = actorA.GetBody().GetUserData().type == IS_PLAYER ? actorA : actorB;
			var c = actorA.GetBody().GetUserData().type == IS_PLAYER ? actorB : actorA;
			if (c.GetBody().GetUserData().type == null) return;
			if (c.GetBody().GetUserData().type == IS_WORLD) {
				if (c.GetUserData() == IS_WATER) {
					this.die();
				}
				if (c.GetUserData() == IS_LAND) {
					if (p.GetUserData() == PL_FOOT) {
						this.numFootContacts++;
						if (this.jumpCounter > 0) this.jumpCounter = 0;
					}
				}
			}
			if (c.GetBody().GetUserData().type == IS_ENEMY) {
				if (c.GetUserData() == EN_HEAD) {
					if (p.GetUserData() == PL_FOOT) {
						var newV = new b2Vec2(p.GetBody().GetLinearVelocity().x,5);
						p.GetBody().SetLinearVelocity(newV);
					}
				}
				if (c.GetUserData() == EN_BODY) {
					if (p.GetUserData() == PL_WEAK) {
						var x = p.GetBody().GetPosition().x < c.GetBody().GetPosition().x ? -10 : 10;
						var newV = new b2Vec2(x, p.GetBody().GetLinearVelocity().y);
						p.GetBody().SetLinearVelocity(newV);
						this.hurt();
					}					
				}
			}
			if (c.GetBody().GetUserData().type == IS_BULLET) {
				if (p.GetUserData() == PL_BODY) {
					var x = p.GetBody().GetPosition().x < c.GetBody().GetPosition().x ? -10 : 10;
					var newV = new b2Vec2(x, p.GetBody().GetLinearVelocity().y);
					p.GetBody().SetLinearVelocity(newV);
					this.hurt();
				}
			}
			if (c.GetBody().GetUserData().type == IS_BOSS) {
					this.hurt();
			}
			if (c.GetBody().GetUserData().type == IS_ITEM) {
				contact.SetEnabled(false);
				var itemUD = c.GetBody().GetUserData();
				this.parent.scheduleItemPickUp(itemUD, this.pointsMul);
			}
			if (c.GetBody().GetUserData().type == IS_END) {
				if (p.GetUserData() == PL_WEAK) {
					if (c.GetBody().GetUserData().sprite.isVisible())
						this.parent.finishLevel();
				}
			}
		}		
	},
	contactEnded:function(contact){
		var actorA = contact.GetFixtureA(),
			actorB = contact.GetFixtureB();
		if (actorA.GetUserData() == null || actorB.GetUserData() == null) return;
		if (actorA.GetBody().GetUserData().type == IS_PLAYER 
			|| actorB.GetBody().GetUserData().type == IS_PLAYER) {
			var p = actorA.GetBody().GetUserData().type == IS_PLAYER ? actorA : actorB;
			var c = actorA.GetBody().GetUserData().type == IS_PLAYER ? actorB : actorA;
			if (c.GetBody().GetUserData().type == null) return;
			if (c.GetBody().GetUserData().type == IS_WORLD) {
				if (c.GetUserData() == IS_WATER) {
				}
				if (c.GetUserData() == IS_LAND) {
					if (p.GetUserData() == PL_FOOT) {
						this.numFootContacts--;
					}
				}
			}
			if (c.GetBody().GetUserData().type == IS_ENEMY) {
				if (c.GetUserData() == EN_HEAD) {
				}
				if (c.GetUserData() == EN_BODY) {	
				}
			}
		}
	},
	contactPreSolve:function(contact, oldManifold){
	},
	contactPostSolve:function(contact, impulse){
	},
	
});
