var INTRO_CINEMATIC = {id:1, length:8};
var OUTRO_CINEMATIC = {id:2, length:4};

var Cinematic = cc.Layer.extend({
	id: 'CINEMATIC',
	
	cinematic: null,
	frames: null,
	voice: null,
	
	frameCount: null,
	currentFrame: null,
	nextFrame: null,
	
	transitionEnded: null,
	
	init: function() {
		this._super();
		this.winSize = cc.Director.getInstance().getWinSize();
		
		var bgLayer = cc.LayerColor.create(new cc.Color4B(255,255,255,255), this.winSize.width, this.winSize.height);
		bgLayer.setPosition(cc.p(0, 0));
		this.addChild(bgLayer);
		
		this.spriteFrameCache = cc.SpriteFrameCache.getInstance();
		this.spriteFrameCache.addSpriteFrames(plist_MovPack);
		
		var cList = ls.SYSA_Cinematics.split(',');
		if (Number(cList[0]) == 1) {
			this.cinematic = INTRO_CINEMATIC;
			cList[0] = -1;
		}
		else if (Number(cList[1]) == 1) {
			this.cinematic = OUTRO_CINEMATIC;
			cList[1] = -1;
		}
		ls.SYSA_Cinematics = cList;
		
		this.frames = new Array();
		for (var i = 1; i <= this.cinematic.length; i++) {
			var frame = this.spriteFrameCache.getSpriteFrame("mov_0"+this.cinematic.id+"_0"+i+".png");
			this.frames.push(frame);
		}
		this.frameCount = 0;
	    
	    if (SYSA.SelectedCharacter == CH_SIMON || SYSA.SelectedCharacter == CH_FRANCISCO || SYSA.SelectedCharacter == CH_CACIQUE)
			this.voice = Male[this.cinematic.id-1];
		else if (SYSA.SelectedCharacter == CH_MANUELITA || SYSA.SelectedCharacter == CH_MATEA)
			this.voice = Female[this.cinematic.id-1];
	    
	    this.transitionEnded = true;
	    
	    this.setScale(1);
	    this.setAnchorPoint(cc.p(0,0));
	    this.setPosition(cc.p(0,0));
	    
	    this.setTouchEnabled(true);
		this.setKeyboardEnabled(true);
		this.scheduleUpdate(1/60);
		
		AudioManager.playBgm(Bgm[0]);
	},
	
	update: function() {
		if (!this.transitionEnded) return;

		if (!AudioManager.isNarrationPlaying(this.voice)) {
			if (this.frameCount < this.voice.length)
				this.setNextFrame();
			else
				SceneManager.SetScene(RegionsScene);
		}
	},
	
	setNextFrame: function() {
		this.transitionEnded = false;
		
		this.nextFrame = cc.LayerColor.create(new cc.Color4B(27,136,238,255), this.winSize.width*2, this.winSize.height*2);
		
		var sprite = cc.Sprite.createWithSpriteFrame(this.frames[this.frameCount]);
		sprite.setAnchorPoint(cc.PointZero());
	    sprite.setPosition(cc.PointZero());
	    
	    this.nextFrame.addChild(sprite);
	    
	    this.nextFrame.setScale(0.5);
	    this.nextFrame.setAnchorPoint(cc.p(0,0));
	    this.nextFrame.setPosition(cc.p(this.winSize.width,0));
	    
	    this.addChild(this.nextFrame);
	    
	    this.nextFrame.runAction(
			cc.Sequence.create(
				cc.MoveTo.create( 1.5, cc.p(0,0) ),
				cc.CallFunc.create(this.removeOldFrameAndStartNarration, this)
			)
		);
	},
	
	removeOldFrameAndStartNarration: function(e) {
		var me = e != null ? e.getParent() : this;
		
		if (me.currentFrame != null)
			me.currentFrame.removeFromParent();
			
		me.currentFrame = me.nextFrame;
		
		AudioManager.playNarration(me.voice[me.frameCount]);
		
		me.frameCount++;
		me.transitionEnded = true;
	}
});
