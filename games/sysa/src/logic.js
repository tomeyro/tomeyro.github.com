var IS_LOGICBOX = "is_logicbox";
var IS_LOGICTOGGLE = "is_logictoggle";
var IS_EXPLOSIVE = "is_explosive";

// - //
// LogicBox Object
// - //
var logicBox = cc.Sprite.extend({
	
	// -
	// Variable declarations
	// -	
	sprite:null,
	world:null,
	pos:null,
	color:null,
	body:null,
	
	// -
	// Constructor method
	// -
	ctor:function(parent, o){
		this._super();
		this.parent = parent;
		this.world = parent.world;
		this.pos = cc.p(o.x,o.y);
		this.color = o.color;
		this.type = this.color != 0 ? IS_LOGICBOX : IS_EXPLOSIVE;
		
		var spriteFrameCache = cc.SpriteFrameCache.getInstance();
		spriteFrameCache.addSpriteFrames(plist_ElementsPack);
		
		var frame = spriteFrameCache.getSpriteFrame("e_02_0"+this.color+".png");
		this.sprite = cc.Sprite.createWithSpriteFrame(frame);
		var spriteSize = this.sprite.getContentSize();
		this.pos = cc.p(this.pos.x+(spriteSize.width/2), this.pos.y+(spriteSize.height/2));
	    this.sprite.setPosition(this.pos);
        
        // - // Creating the body
        // - // Body Definition
        var bodyDef = new b2BodyDef();
		bodyDef.type = this.type == IS_LOGICBOX ? b2Body.b2_staticBody : b2Body.b2_dynamicBody;
		bodyDef.position.Set(this.pos.x/PTMratio,this.pos.y/PTMratio);
		bodyDef.userData = {
			type: this.type,
			isDead: false,
		}
		// - // Shape definition for main fixture
		var polygonShape = new b2PolygonShape();
		polygonShape.SetAsBox((spriteSize.width/PTMratio)*0.5,(spriteSize.height/PTMratio)*0.5);
		// - // Fixture definition
		var fixtureDef = new b2FixtureDef();
		fixtureDef.shape = polygonShape;
		fixtureDef.density = 1;
        fixtureDef.friction = 0;
        fixtureDef.restitution = 0;
        // - // Create static body		
		this.body = this.world.CreateBody(bodyDef);
		// - // Add main fixture
		var mainFixture = this.body.CreateFixture(fixtureDef);
		mainFixture.SetUserData({
			type: this.type,
			sprite: this.sprite,
		});
	},
	
	// -
	// Update method
	// -
	update:function(){
		var b = this.body;
		if (b.IsAwake())
			this.pos = cc.p(b.GetPosition().x*PTMratio, b.GetPosition().y*PTMratio);
		this.sprite.setPosition(this.pos);
	},
	
	// -
	// Methods
	// -
	die: function() {
		this.sprite.removeFromParent();
		var bodyUD = this.body.GetUserData();
		bodyUD.isDead = true;
	},
	
	remove:function(color){
		if(this.color == color) {
			this.die();
			return true;
		}
		return false;
	},
	
	explode:function(){
		AudioManager.playSfx('act');
		this.parent.removeLogicObjects(this.color);
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
		var actorA = contact.GetFixtureA(),
			actorB = contact.GetFixtureB();
		if (actorA.GetUserData() == null || actorB.GetUserData() == null) return;
		if (actorA.GetBody().GetUserData().type == IS_EXPLOSIVE 
			|| actorB.GetBody().GetUserData().type == IS_EXPLOSIVE) {
			var e = actorA.GetBody().GetUserData().type == IS_EXPLOSIVE ? actorA : actorB;
			var c = actorA.GetBody().GetUserData().type == IS_EXPLOSIVE ? actorB : actorA;
			if (c.GetBody().GetUserData().type == null) return;
			if (c.GetBody().GetUserData().type == IS_WORLD) {
				if (c.GetUserData() == IS_WATER)
					this.explode();
			}
			if (c.GetBody().GetUserData().type == IS_BOSS) {
				if (c.GetBody().GetUserData().object.isWeak)
					this.explode();
			}
		}
	},
	contactEnded:function(contact){
	},
	contactPreSolve:function(contact){
		var actorA = contact.GetFixtureA(),
			actorB = contact.GetFixtureB();
		if (actorA.GetUserData() == null || actorB.GetUserData() == null) return;
		if (actorA.GetBody().GetUserData().type == IS_EXPLOSIVE 
			|| actorB.GetBody().GetUserData().type == IS_EXPLOSIVE) {
			var e = actorA.GetBody().GetUserData().type == IS_EXPLOSIVE ? actorA : actorB;
			var c = actorA.GetBody().GetUserData().type == IS_EXPLOSIVE ? actorB : actorA;
			if (c.GetBody().GetUserData().type == null) return;
			if (c.GetBody().GetUserData().type == IS_PLAYER) {
				contact.SetEnabled(false);
			}
			if (c.GetBody().GetUserData().type == IS_BOSS) {
				if (!c.GetBody().GetUserData().object.isWeak)
					contact.SetEnabled(false);
			}
			if (c.GetBody().GetUserData().type == IS_WORLD) {
				if (c.GetUserData() == IS_LAND)
					contact.SetEnabled(false);
			}
		}
		
	},
	
});

// - //
// LogicToggle Object
// - //
var logicToggle = cc.Sprite.extend({
	
	// -
	// Variable declarations
	// -	
	sprite:null,
	world:null,
	pos:null,
	color:null,
	animation:null,
	action:null,
	
	// -
	// Constructor method
	// -
	ctor:function(parent, o){
		this._super();
		this.parent = parent;
		this.world = parent.world;
		this.pos = cc.p(o.x,o.y);
		this.color = o.color;
		
		var spriteFrameCache = cc.SpriteFrameCache.getInstance();
		spriteFrameCache.addSpriteFrames(plist_ElementsPack);
		
		this.frame = spriteFrameCache.getSpriteFrame("e_01_0"+this.color+"_01.png");	
		this.sprite = cc.Sprite.createWithSpriteFrame(this.frame);
		var spriteSize = this.sprite.getContentSize();
		this.pos = cc.p(this.pos.x+(spriteSize.width/2), this.pos.y+(spriteSize.height/2));
	    this.sprite.setPosition(this.pos);
	    
	    // - // create animation "toggle"
        var animFrames = [];
        for (var i = 1; i < 4; i++) {
			var str = "e_01_0"+this.color+"_0"+i+".png";
            //~ var frame = spriteFrameCache.getSpriteFrame(str);
            animFrames.push(spriteFrameCache.getSpriteFrame(str));
        }
        var animation = cc.Animation.create(animFrames, 0.1);        
        // - // Add an animation to the Cache
        cc.AnimationCache.getInstance().addAnimation(animation, "toggle");        
        var animCache = cc.AnimationCache.getInstance();
        var toggle_activation = animCache.getAnimation("toggle");
        toggle_activation.setRestoreOriginalFrame(false);
        this.animation = cc.Animate.create(toggle_activation);
        
        // - // Creating the body
        // - // Body Definition
        var bodyDef = new b2BodyDef();
		bodyDef.type = b2Body.b2_staticBody;
		bodyDef.position.Set(this.pos.x/PTMratio,this.pos.y/PTMratio);
		bodyDef.userData = {
			type: IS_LOGICTOGGLE,
		}
		// - // Shape definition for main fixture
		var polygonShape = new b2PolygonShape();
		polygonShape.SetAsBox((spriteSize.width/PTMratio)*0.5,(spriteSize.height/PTMratio)*0.5);
		// - // Fixture definition
		var fixtureDef = new b2FixtureDef();
		fixtureDef.shape = polygonShape;
		fixtureDef.density = 1;
        fixtureDef.friction = 0.3;
        fixtureDef.restitution = 0;
        fixtureDef.isSensor = true;
        // - // Create static body		
		this.body = this.world.CreateBody(bodyDef);
		// - // Add main fixture
		var mainFixture = this.body.CreateFixture(fixtureDef);
		mainFixture.SetUserData({
			type: IS_LOGICTOGGLE,
			color: this.color,
		});		
	},
	
	// -
	// Update method
	// -
	update:function(){
	},
	
	// -
	// Methods
	// -
	activated:false,
	activateToggle:function(){
		if (!this.sprite.isVisible()) return;
		AudioManager.playSfx('act');
		this.activated = true;
		this.sprite.runAction(this.animation);
		this.parent.removeLogicObjects(this.color, false);
	},
	resetToggle: function() {
		this.activated = false;
		this.sprite.setDisplayFrame(this.frame);
	},
	
	die: function() {
		this.sprite.removeFromParent();
		var bodyUD = this.body.GetUserData();
		bodyUD.isDead = true;
	},
	
	remove:function(color){
		if(this.color == color) {
			this.die();
			return true;
		}
		return false;
	},
	
	// -
    // Event handlers
    // -
	handleTouch:function(){	
	},
	handleKeyDown:function(e){
	},
	handleKeyUp:function(e){
		if (e == cc.KEY.e || e == cc.KEY.space || e == cc.KEY.enter) {
			if(this.onFocus && !this.activated) this.activateToggle();
		}
	},
	
	// -
    // Contact listener
    // -
    onFocus:false,
    contactBegan:function(contact){
		var actorA = contact.GetFixtureA().GetUserData(),
			actorB = contact.GetFixtureB().GetUserData();
		if (actorA != null && actorB != null){
			if (actorA.type == IS_LOGICTOGGLE || actorB.type == IS_LOGICTOGGLE) {
				if (actorA.color == this.color || actorB.color == this.color) {
					if (actorA == PL_BODY || actorB == PL_BODY) {
						this.onFocus = true;
					}
				}
			}
		}
	},
	contactEnded:function(contact){
		var actorA = contact.GetFixtureA().GetUserData(),
			actorB = contact.GetFixtureB().GetUserData();
		if (actorA != null && actorB != null){
			if (actorA.type == IS_LOGICTOGGLE || actorB.type == IS_LOGICTOGGLE) {
				if (actorA.color == this.color || actorB.color == this.color) {
					if (actorA == PL_BODY || actorB == PL_BODY) {
						this.onFocus = false;
					}
				}
			}
		}
	},
	contactPreSolve:function(contact){
	},
	
});
