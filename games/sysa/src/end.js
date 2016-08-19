var IS_END = 'is_end';

var ending = cc.Sprite.extend({
	winSize:null,
	ctor:function(parent, o){
		this._super();
		this.winSize = cc.Director.getInstance().getWinSize();
		this.pos = cc.p(o.x, o.y);
		this.world = parent.world;

		var spriteFrameCache = cc.SpriteFrameCache.getInstance();
		spriteFrameCache.addSpriteFrames(plist_ElementsPack);
		
		var frame = spriteFrameCache.getSpriteFrame("e_04.png");
		this.sprite = cc.Sprite.createWithSpriteFrame(frame);
	    this.sprite.setPosition(cc.PointZero());
	    var spriteSize = this.sprite.getContentSize();
	    
	    this.action = cc.RepeatForever.create(cc.RotateBy.create(1.5,360));
		
		// - // Creating the body
        // - // Body Definition
        var bodyDef = new b2BodyDef();
		bodyDef.type = b2Body.b2_staticBody;
		bodyDef.position.Set(this.pos.x/PTMratio, this.pos.y/PTMratio);
		bodyDef.userData = {
			type: IS_END,
			sprite: this.sprite,
		}
		bodyDef.allowSleep = true;
		bodyDef.fixedRotation = true;
		// - // Shape definition for main fixture
		var polygonShape = new b2PolygonShape();
		polygonShape.SetAsBox((spriteSize.width/PTMratio)*0.5,(spriteSize.height/PTMratio)*0.5);
		// - // Fixture definition
		var fixtureDef = new b2FixtureDef();
		fixtureDef.shape = polygonShape;
		fixtureDef.density = 0;
        fixtureDef.friction = 0;
        fixtureDef.restitution = 0;
        fixtureDef.isSensor = true;
        // - // Create dynamic body		
		this.body = this.world.CreateBody(bodyDef);
		// - // Add main fixture
		var mainFixture = this.body.CreateFixture(fixtureDef);
		mainFixture.SetUserData(IS_END);
		
		this.scheduleUpdate(1/60);
	},
	draw:function(){
		if (this.getChildByTag('sprite') == null) {
			this.addChild(this.sprite, 0, 'sprite');
			this.runAction(this.action);
		}
	},
	update:function(){
		var b = this.body;
		if (b.IsAwake())
			this.pos = cc.p(b.GetPosition().x*PTMratio, b.GetPosition().y*PTMratio);
		this.setPosition(this.pos);
	},
});
