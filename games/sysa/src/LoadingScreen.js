var LoadingScreen = cc.Sprite.extend({
	winSize:null,
	ctor:function(scene){
		this._super();
		this.winSize = cc.Director.getInstance().getWinSize();
		
		this.bgLayer = new BackgroundSprite(this.winSize.width*2, this.winSize.height*2);
		this.bgLayer.setPosition(cc.p(0,0));
		this.bgLayer.setOpacity(0);
		this.addChild(this.bgLayer);
		
		var spriteFrameCache = cc.SpriteFrameCache.getInstance();
		spriteFrameCache.addSpriteFrames(plist_ScreensPack);
		
		var bgImgFrame = spriteFrameCache.getSpriteFrame("loading_screen_00.png");
		this.bgImgSprite = cc.Sprite.createWithSpriteFrame(bgImgFrame);
		this.bgImgSprite.setAnchorPoint(cc.p(0,0));
		this.bgImgSprite.setPosition(cc.PointZero());
		this.bgImgSprite.setOpacity(0);
		this.addChild(this.bgImgSprite);
	
		this.setScale(1);
	    this.setAnchorPoint(cc.p(0,0));
	    this.setPosition(cc.p(0,0));
	    
	    this.bgLayer.runAction(cc.FadeIn.create(2));
	    this.bgImgSprite.targetScene = scene;
	    this.bgImgSprite.runAction(
			cc.Sequence.create(
				cc.FadeIn.create(2), cc.CallFunc.create(this.goToScene)
			)
		);
	},
	goToScene: function(o) {
		SceneManager.SetScene(o.targetScene);
	},
});

var BackgroundSprite = cc.Sprite.extend({
	ctor:function(w,h){
		this._super();
		this.size = new cc.Size(w,h);
	},
	draw:function(){		
		cc.drawingUtil.drawSolidRect(cc.p(0,0),cc.p(this.size.width,this.size.height), new cc.Color4B(255,255,255,255));
	}
});
