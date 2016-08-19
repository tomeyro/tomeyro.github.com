var IS_SIGN = 'is_sign';

// - //
// Sign Object
// - //
var infoSign = cc.Sprite.extend({
	
	// -
	// Variable declarations
	// -	
	sprite:null,
	world:null,
	pos:null,
	text:null,
	
	// -
	// Constructor method
	// -
	ctor:function(parent, o, id){
		this._super();
		this.parent = parent;
		this.world = this.parent.world;
		this.pos = cc.p(o.x, o.y);
		this.text = o.text;
		this.id = id;
		
		var spriteFrameCache = cc.SpriteFrameCache.getInstance();
		spriteFrameCache.addSpriteFrames(plist_ElementsPack);
		
		var frame = spriteFrameCache.getSpriteFrame("e_03.png");
		this.sprite = cc.Sprite.createWithSpriteFrame(frame);
		var spriteSize = this.sprite.getContentSize();
		this.pos = cc.p(this.pos.x+(spriteSize.width/2), this.pos.y+(spriteSize.height/2));
	    this.sprite.setPosition(this.pos);
        
        // - // Creating the body
        // - // Body Definition
        var bodyDef = new b2BodyDef();
		bodyDef.type = b2Body.b2_staticBody;
		bodyDef.position.Set(this.pos.x/PTMratio,this.pos.y/PTMratio);
		bodyDef.userData = {
			type: IS_SIGN,
			id: this.id,
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
		var body = this.world.CreateBody(bodyDef);
		// - // Add main fixture
		var mainFixture = body.CreateFixture(fixtureDef);
		mainFixture.SetUserData({
			type: IS_SIGN,
			id: this.id,
		});	
	},
	
	// -
	// Update method
	// -
	update:function(){
	},
	
	// -
    // Event handlers
    // -
    activated:false,
	handleTouch:function(){	
	},
	handleKeyDown:function(e){
	},
	handleKeyUp:function(e){
		if (e == cc.KEY.e || e == cc.KEY.space || e == cc.KEY.enter) {
			if(this.onFocus) {
				if(!this.activated) {
					this.parent.createInfo(this.text);
					this.activated = true;
				} else {
					this.parent.removeInfo();
					this.activated = false;
				}
			}
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
			if (actorA.type == IS_SIGN || actorB.type == IS_SIGN) {
				if (actorA.id == this.id || actorB.id == this.id) {
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
			if (actorA.type == IS_SIGN || actorB.type == IS_SIGN) {
				if (actorA.id == this.id || actorB.id == this.id) {
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

// - //
// InfoHub Object
// - //
var Info = cc.Layer.extend({
	text:null,
	size:null,
	ctor: function(text) {
		this._super();
		this.winSize = cc.Director.getInstance().getWinSize();
		
		this.text = text;
		this.size = {width: 600, height: 300};
		
		var spriteFrameCache = cc.SpriteFrameCache.getInstance();
		spriteFrameCache.addSpriteFrames(plist_ElementsPack);
		
		var bgImgFrame = spriteFrameCache.getSpriteFrame("e_03_full.png");
		var bgImgSprite = cc.Sprite.createWithSpriteFrame(bgImgFrame);
		bgImgSprite.setAnchorPoint(cc.p(0,0));
		bgImgSprite.setPosition(cc.p((this.winSize.width-this.size.width)*0.5,(this.winSize.height-this.size.height)*0.5));
		this.addChild(bgImgSprite);
		
		var label = cc.LabelTTF.create(this.text, "Arial", 30, new cc.Size(350,null), cc.TEXT_ALIGNMENT_CENTER);
        label.setAnchorPoint(cc.p(0.5,0.5));
        label.setPosition(cc.p(this.winSize.width*0.5,(this.winSize.height+this.size.height)*0.5-100));
		this.addChild(label);
		
		this.setTag('info');
	},
});
