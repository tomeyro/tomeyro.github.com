var enemyFrames = new Array();
enemyFrames[0] = 8;
enemyFrames[1] = 4;
enemyFrames[2] = 8;
enemyFrames[3] = 6;
enemyFrames[4] = 2;
enemyFrames[5] = 1;

var IS_ENEMY = 'is_enemy';
var EN_HEAD = 'en_head';
var EN_BODY = 'en_body';

var TM_MORROCAU = 1;
var TM_GUSANOSO = 2;
var TM_CULEBRIN = 3;
var TM_ATON = 4;
var TM_MARRADO = 5;
var TM_LANDURO = 6;

// - //
// Enemy Class
// - //
var enemy = cc.Sprite.extend({
	
	// -
	// Variable declarations
	// -	
	sprite:null,
	animation:null,
	world:null,
	prevPos:null,
	pos:null,
	startingPos:null,
	left:null,
	right:null,
	type:null,
	id:null,
	velocity:null,
	body:null,
	life:null,
	
	// -
	// Constructor method
	// -
	ctor:function(world, parent, pos, object, id) {
		this._super();
		this.world = world;
		this.type = Number(object.type);
		this.left = object.left != null ? Number(object.left) : 0;
		this.right = object.right != null ? Number(object.right) : 0;
		this.id = Number(id);
		this.velocity = this.type != TM_LANDURO ? -3 : 0;
		this.life = (this.type == TM_LANDURO || this.type == TM_MARRADO) ? 2 : 1;
		this.parent = parent;
		
		var spriteFrameCache = cc.SpriteFrameCache.getInstance();
		spriteFrameCache.addSpriteFrames(plist_EnemiesPack);
		
		var frame = spriteFrameCache.getSpriteFrame("p2"+this.type+"_01.png");
		this.sprite = cc.Sprite.createWithSpriteFrame(frame);
		var spriteSize = this.sprite.getContentSize();
		this.pos = cc.p(pos.x+(spriteSize.width/2), pos.y+(spriteSize.height/2));
		this.startingPos = this.pos;
	    this.sprite.setPosition(this.pos);
	    
	    // - // create animation
        var animFrames = [];
        for (var i = 1; i <= enemyFrames[this.type-1]; i++) {
			var str = "p2"+this.type+"_0"+i+".png";
            //~ var frame = spriteFrameCache.getSpriteFrame(str);
            animFrames.push(spriteFrameCache.getSpriteFrame(str));
        }
        var animation = cc.Animation.create(animFrames, 0.15);        
        // - // Add an animation to the Cache
        cc.AnimationCache.getInstance().addAnimation(animation, "toggle");        
        var animCache = cc.AnimationCache.getInstance();
        var toggle_activation = animCache.getAnimation("toggle");
        toggle_activation.setRestoreOriginalFrame(false);
        this.animation = cc.Animate.create(toggle_activation);
        
        this.action = cc.RepeatForever.create(this.animation);
        this.action.setTag("anim");
        
        this.sprite.runAction(this.action);	
        
        // - // Creating the body
        // - // Body Definition
        var bodyDef = new b2BodyDef();
		bodyDef.type = b2Body.b2_dynamicBody;
		if (this.type == TM_ATON) bodyDef.type = b2Body.b2_kinematicBody;
		bodyDef.position.Set(this.pos.x/PTMratio,this.pos.y/PTMratio);
		bodyDef.userData = {
			type: IS_ENEMY,
			sprite: this.sprite,
			id: this.id,
			isDead: false,
		}
		bodyDef.allowSleep = true;
		bodyDef.fixedRotation = true;
		// - // Shape definition for main fixture
		var polygonShape = new b2PolygonShape();
		polygonShape.SetAsBox((spriteSize.width/PTMratio)*0.5,(spriteSize.height/PTMratio)*0.5);
		// - // Fixture definition
		var fixtureDef = new b2FixtureDef();
		fixtureDef.shape = polygonShape;
		fixtureDef.density = 5;
        fixtureDef.friction = 0.3;
        fixtureDef.restitution = 0;
        //~ if(this.type == TM_CULEBRIN) fixtureDef.restitution = 1;
        fixtureDef.isSensor = false;
        // - // Create static body		
		this.body = world.CreateBody(bodyDef);
		// - // Add main fixture
		var mainFixture = this.body.CreateFixture(fixtureDef);
		mainFixture.SetUserData(IS_ENEMY);
		
		// - // Shape definition for weak fixture
		var weakPolygonShape = new b2PolygonShape();
		var spriteRealWidth = ((spriteSize.width)/PTMratio);
		var weakSizeWidth = spriteRealWidth;
		var weakPosX = 0;
		var spriteRealHeight = ((spriteSize.height)/PTMratio);
		var weakSizeHeight = spriteRealHeight*0.8;
		var weakPosY = -spriteRealHeight*0.1;
		weakPolygonShape.SetAsOrientedBox((weakSizeWidth*0.5), (weakSizeHeight*0.5), new b2Vec2(weakPosX,weakPosY), 0);
		// - // Fixture definition
		var weakFixtureDef = new b2FixtureDef();
		weakFixtureDef.shape = weakPolygonShape;
		weakFixtureDef.density = 0;
		weakFixtureDef.isSensor = true;
		// - // Add weak sensor fixture
		var weakFixture = this.body.CreateFixture(weakFixtureDef);
		weakFixture.SetUserData(EN_BODY);
		
		// - // Shape definition for head fixture
		var headPolygonShape = new b2PolygonShape();
		var spriteRealWidth = ((spriteSize.width)/PTMratio);
		var headSizeWidth = spriteRealWidth;
		var headPosX = 0;
		var spriteRealHeight = ((spriteSize.height)/PTMratio);
		var headSizeHeight = 0.1;		
		var headPosY = spriteRealHeight*0.5;
		headPolygonShape.SetAsOrientedBox((headSizeWidth*0.5), (headSizeHeight*0.5), new b2Vec2(headPosX,headPosY), 0);
		// - // Fixture definition
		var headFixtureDef = new b2FixtureDef();
		headFixtureDef.shape = headPolygonShape;
		headFixtureDef.density = 0;
		headFixtureDef.isSensor = true;
		// - // Add head sensor fixture
		var headFixture = this.body.CreateFixture(headFixtureDef);
		headFixture.SetUserData(EN_HEAD);
		
		this.flip = object.flip;
		if (this.flip == 1) this.turn();
	},
	
	// -
	// Update method
	// -
	timer: 0,
	update:function(dt){
		if (!this.sprite.getActionByTag("anim"))
			this.sprite.runAction(this.action);
		
		for (var b = this.world.GetBodyList(); b; b = b.GetNext()) {
			if (b.GetUserData() != null) {
				if (b.GetUserData().type == IS_ENEMY && b.GetUserData().id == this.id) {
					if(!b.IsAwake()) b.SetAwake(true);
					
					if(this.velocity < 0 && b.GetPosition().x*PTMratio <= this.startingPos.x-(PTMratio*2*this.left)+(PTMratio*0.5))
						this.turn();
					if(this.velocity > 0 && b.GetPosition().x*PTMratio >= this.startingPos.x+(PTMratio*2*this.right)-(PTMratio*0.5))
						this.turn();
					
					var newV = new b2Vec2(this.velocity,b.GetLinearVelocity().y);
					b.SetLinearVelocity(newV);
					
					var myActor = b.GetUserData();
					this.prevPos = this.pos;
					this.pos = cc.p(b.GetPosition().x*PTMratio, b.GetPosition().y*PTMratio);
					myActor.sprite.setPosition(this.pos);
					if ((this.prevPos.x == this.pos.x) && (this.type != TM_LANDURO)) this.turn();
				}
			}			
        }
        
        if (this.type == TM_LANDURO && !this.dead()) {
			this.timer += dt;
			if (this.timer >= 4) {
				this.shoot();
				this.timer = 0;
			}
		}
	},
	
	// -
	// Methods
	// -
	turn:function(){
		this.velocity = -this.velocity;
		var flip = this.velocity < 0 ? false : true;
		this.sprite.runAction(cc.FlipX.create(flip));
	},
	hurt:function(damage){
		if (damage == null) damage = 1;
		this.life -= damage;
		AudioManager.playSfx('destroy');
		if (this.life <= 0) this.die();
	},
	die:function(){
		this.sprite.removeFromParent();
		var bodyUD = this.body.GetUserData();
		bodyUD.isDead = true;
		this.parent.scheduleItemCreation(getRandomInt(3,5), this.pos);
	},
	dead: function() {
		return this.body.GetUserData().isDead;
	},
	bulletList: new Array(),
	shoot: function() {
		var bulletId = "" + this.id + this.bulletList.length;
		var bulletVel = this.flip == 1 ? new b2Vec2(3,0) : new b2Vec2(-3,0);
		var aBullet = new bullet(this.parent, this.pos, bulletVel, 4, bulletId);
		aBullet.setPosition(this.pos);
		this.parent.objectsLayer.addChild(aBullet);
		this.bulletList.push(aBullet);
	},
	
	// -
    // Event handlers
    // -
	handleTouch:function(){
	},
	handleKeyDown:function(e){
	},
	handleKeyUp:function(e){
	},
	
	// -
    // Contact listener
    // -
    contactBegan:function(contact){
		var actorA = contact.GetFixtureA();
		var actorB = contact.GetFixtureB();
		if (actorA.GetUserData() == null || actorB.GetUserData() == null) return;
		if (actorA.GetBody().GetUserData().type == IS_ENEMY
			|| actorB.GetBody().GetUserData().type == IS_ENEMY) {
			var e = actorA.GetBody().GetUserData().type == IS_ENEMY ? actorA : actorB;
			var c = actorA.GetBody().GetUserData().type == IS_ENEMY ? actorB : actorA;
			if (c.GetBody().GetUserData().type == null) return;
			if (e.GetBody().GetUserData().id == this.id) {
				if (c.GetBody().GetUserData().type == IS_PLAYER) {
					if (e.GetUserData() == EN_BODY) {
						if (c.GetUserData() == PL_BODY) {
							if ((e.GetBody().GetLinearVelocity().x < 0
								&& c.GetBody().GetPosition().x < e.GetBody().GetPosition().x)
								|| (e.GetBody().GetLinearVelocity().x > 0
								&& c.GetBody().GetPosition().x > e.GetBody().GetPosition().x)) {
								this.turn();
							}
						}
					}
					if (e.GetUserData() == EN_HEAD) {
						if (c.GetUserData() == PL_FOOT) {
							this.hurt(c.GetBody().GetUserData().strength);
						}
					}
				}
				if (c.GetUserData() == IS_LAND) {
					if (this.type == TM_CULEBRIN) {
						var newV = new b2Vec2(this.body.GetLinearVelocity().x,7);
						this.body.SetLinearVelocity(newV);
					}
				}
			}
		} if (actorA.GetBody().GetUserData().type == IS_BULLET
			|| actorB.GetBody().GetUserData().type == IS_BULLET) {
			if (this.type == TM_LANDURO)
				for (var b=0; b<this.bulletList.length; b++) this.bulletList[b].contactBegan(contact);
		}
	},
	contactEnded:function(contact){
	},
	contactPreSolve:function(contact){
		var actorA = contact.GetFixtureA();
		var actorB = contact.GetFixtureB();
		if (actorA.GetUserData() == null || actorB.GetUserData() == null) return;
		
		if(actorA.GetBody().GetUserData().type == IS_ENEMY
			&& actorB.GetBody().GetUserData().type == IS_ENEMY) {
			if(actorA.GetBody().GetUserData().id == this.id
				|| actorB.GetBody().GetUserData().id == this.id)
				contact.SetEnabled(false);
		}
		
		if (actorA.GetBody().GetUserData().type == IS_ENEMY
			|| actorB.GetBody().GetUserData().type == IS_ENEMY) {
			var e = actorA.GetBody().GetUserData().type == IS_ENEMY ? actorA : actorB;
			var c = actorA.GetBody().GetUserData().type == IS_ENEMY ? actorB : actorA;
			if (c.GetBody().GetUserData().type == null) return;
			if (e.GetBody().GetUserData().id == this.id) {
				if (c.GetBody().GetUserData().type == IS_ITEM) {
					contact.SetEnabled(false);
				}
			}
		}
	},
});

// - //
// Bullet Class
// - //
var IS_BULLET = 'is_bullet';
var bullet = cc.Sprite.extend({
	winSize:null,
	ctor:function(parent, pos, vel, color, id){
		this._super();
		this.schedule(this.myUpdate,1/60);
		this.winSize = cc.Director.getInstance().getWinSize();
		this.parent = parent;
		this.world = this.parent.world;
		this.start = pos;
		this.pos = pos;
		this.vel = vel;
		this.size = 10;
		
		this.id = id;
		
		this.colors = [
			"rgba(200,200,200,255)",	//gris
			"rgba(222,33,33,255)",		//rojo
			"rgba(27,136,238,255)",		//azul
			"rgba(129,255,140,255)",	//verde
			"rgba(228,223,24,255)"		//amarillo
		];
		this.color = this.colors[color-1];
		
		// - // Creating the body
        // - // Body Definition
        var bodyDef = new b2BodyDef();
		bodyDef.type = b2Body.b2_kinematicBody;
		bodyDef.position.Set(this.pos.x/PTMratio, (this.pos.y/PTMratio)+0.5);
		bodyDef.userData = {
			type: IS_BULLET,
			isDead: false,
			id: this.id
		}
		bodyDef.allowSleep = true;
		bodyDef.fixedRotation = true;
		// - // Shape definition for main fixture
		var circleShape = new b2CircleShape();
		circleShape.SetRadius(this.size/PTMratio);
		// - // Fixture definition
		var fixtureDef = new b2FixtureDef();
		fixtureDef.shape = circleShape;
		fixtureDef.density = 1;
        fixtureDef.friction = 0.5;
        fixtureDef.restitution = 0;
        fixtureDef.isSensor = true;
        // - // Create dynamic body		
		this.body = this.world.CreateBody(bodyDef);
		// - // Add main fixture
		var mainFixture = this.body.CreateFixture(fixtureDef);
		mainFixture.SetUserData(IS_BULLET);
		
		this.body.SetLinearVelocity(vel);
		
		this.scheduleUpdate(1/60);		
	},
	draw:function(){
		cc.renderContext.fillStyle = this.color;
		cc.drawingUtil.drawPoint(cc.PointZero(),this.size);
	},
	myUpdate:function(){
		var b = this.body;
		if (b.IsAwake())
			this.pos = cc.p(b.GetPosition().x*PTMratio, b.GetPosition().y*PTMratio);
		this.setPosition(this.pos);
		
		var difX = Math.abs(this.start.x - this.pos.x);
		var difY = Math.abs(this.start.y - this.pos.y);
		
		if (difX > PTMratio*40 || difY > PTMratio*40) this.die();
	},
	
	die:function(){		
		this.removeFromParent();
		var bodyUD = this.body.GetUserData();
		bodyUD.isDead = true;
	},
	
	contactBegan: function(contact) {
		var actorA = contact.GetFixtureA();
		var actorB = contact.GetFixtureB();
		if (actorA.GetUserData() == null || actorB.GetUserData() == null) return;
		if (actorA.GetBody().GetUserData().type == IS_BULLET
			|| actorB.GetBody().GetUserData().type == IS_BULLET) {
			var b = actorA.GetBody().GetUserData().type == IS_BULLET ? actorA : actorB;
			var c = actorA.GetBody().GetUserData().type == IS_BULLET ? actorB : actorA;
			if (c.GetBody().GetUserData().type == null) return;
			if (b.GetBody().GetUserData().id == this.id) {
				if (c.GetBody().GetUserData().type == IS_PLAYER) {
					if (c.GetUserData() == PL_BODY) {
						this.die();
					}
				}
			}
		}
	},
});
