var IS_ITEM = 'is_item';

var item = cc.Sprite.extend({
	winSize:null,
	ctor:function(type, pos, world){
		this._super();
		this.winSize = cc.Director.getInstance().getWinSize();
		this.pos = pos;
		this.size = 10;
		this.world = world;
		
		this.type = type;
		var spriteFrameCache = cc.SpriteFrameCache.getInstance();
		spriteFrameCache.addSpriteFrames(plist_CollectiblesPack);
		
		var number = this.type < 10 ? "0"+this.type : ""+this.type;
		var frame = spriteFrameCache.getSpriteFrame("c"+number+".png");
		this.sprite = cc.Sprite.createWithSpriteFrame(frame);
	    this.sprite.setPosition(cc.PointZero());
	    this.sprite.setScale(0.75);
		
		// - // Creating the body
        // - // Body Definition
        var bodyDef = new b2BodyDef();
		bodyDef.type = b2Body.b2_dynamicBody;
		bodyDef.position.Set(this.pos.x/PTMratio, this.pos.y/PTMratio);
		bodyDef.userData = {
			type: IS_ITEM,
			isDead: false,
			sprite: this.sprite,
			color: this.type,
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
        // - // Create dynamic body		
		this.body = this.world.CreateBody(bodyDef);
		// - // Add main fixture
		var mainFixture = this.body.CreateFixture(fixtureDef);
		mainFixture.SetUserData(IS_ITEM);
		
		this.scheduleUpdate(1/60);
	},
	draw:function(){
		if (this.getChildByTag('sprite') == null && this.body.GetUserData().isDead == false)
			this.addChild(this.sprite, 0, 'sprite');
	},
	moved: false,
	update:function(){
		var b = this.body;
		if (b.IsAwake())
			this.pos = cc.p(b.GetPosition().x*PTMratio, b.GetPosition().y*PTMratio);
		this.setPosition(this.pos);
		if (!this.moved) {
			var newV = new b2Vec2(getRandomInt(-5,5), b.GetLinearVelocity().y);
			b.SetLinearVelocity(newV);
			this.moved = true;
		}
	},
});
