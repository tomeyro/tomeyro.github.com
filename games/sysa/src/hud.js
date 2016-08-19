// -
// inGameHud object
// -
var inGameHud = cc.Layer.extend({
	winSize:null,
	size:null,
	hud:null,
	level:null,
	init:function(level){
		this._super();
		this.winSize = cc.Director.getInstance().getWinSize();
		this.size = {width: this.winSize.width, height: 50};
		this.hud = cc.LayerColor.create(new cc.Color4B(0,0,0,200), this.size.width, this.size.height);
		this.hud.setPosition(cc.p(0, this.winSize.height-this.size.height));
		this.addChild(this.hud);
		
		this.level = level;
		
		this.lifeIndicator = new Array();
		for (i = 1; i <= this.level.player.life; i++) {
			var liSprite = new lifeSprite();
			liSprite.setPosition(cc.p(this.winSize.width-(40*i)-(5*i),this.winSize.height-25));
			liSprite.tag = i;
			this.addChild(liSprite);
			this.lifeIndicator.push(liSprite);
		}
		
		this.pointsIndicator = new Array();
		for (i = 1; i <= 5; i++) {
			var piSprite = new pointsSprite(this.level, i);
			piSprite.setPosition(cc.p((40*i)+(5*i),this.winSize.height-25));
			piSprite.tag = i;
			this.addChild(piSprite);
			this.pointsIndicator.push(piSprite);
		}
		
		var world = this.level.w;
		var level = this.level.l;
		var regions = ['AMAZONAS', 'ANDES', 'CARIBE', 'LLANOS'];
		var region = regions[world-1];
		
		this.worldIndicator = cc.LabelTTF.create(region, "Arial", 20);
		this.worldIndicator.setAnchorPoint(cc.p(0.5,0));
        this.worldIndicator.setPosition(cc.p(this.winSize.width/2, this.winSize.height-25));
        this.worldIndicator.setColor(new cc.Color3B(255,255,255));
        this.addChild(this.worldIndicator);
		
		this.levelIndicator = cc.LabelTTF.create("NIVEL "+level, "Arial", 20);
		this.levelIndicator.setAnchorPoint(cc.p(0.5,0));
        this.levelIndicator.setPosition(cc.p(this.winSize.width/2, this.winSize.height-45));
        this.levelIndicator.setColor(new cc.Color3B(255,255,255));
        this.addChild(this.levelIndicator);
		
		this.scheduleUpdate(1/60);
	},
	update:function(){
		this.updateLifeIndicator();
	},
	updateLifeIndicator:function(){
		var lifes = this.level.player.life;
		for (i = 0; i < this.lifeIndicator.length; i++) {
			if (this.lifeIndicator[i].tag > lifes) this.lifeIndicator[i].removeFromParent();
		}
	},
});

var lifeSprite = cc.Sprite.extend({
	winSize:null,
	color:null,
	ctor:function(){
		this._super();
		this.winSize = cc.Director.getInstance().getWinSize();
		
		this.ch = SYSA.SelectedCharacter;
		var spriteFrameCache = cc.SpriteFrameCache.getInstance();
		spriteFrameCache.addSpriteFrames(plist_HeadsPack);
		
		var frame = spriteFrameCache.getSpriteFrame("c_0"+this.ch+".png");
		this.sprite = cc.Sprite.createWithSpriteFrame(frame);
	    this.sprite.setPosition(cc.PointZero());
	},
	draw:function(){
		if (this.getChildByTag('sprite') == null)
			this.addChild(this.sprite, 0, 'sprite');		
	},
	myUpdate:function(){
	},
});

var pointsSprite = cc.Sprite.extend({
	winSize:null,
	points:0,
	ctor:function(parent, type){
		this._super();
		this.schedule(this.myUpdate,1/60);
		this.winSize = cc.Director.getInstance().getWinSize();
		this.parent = parent; 
		
		this.type = type-1;
		this.colors = [
			"rgba(200,200,200,255)",	//gris
			"rgba(222,33,33,255)",		//rojo
			"rgba(27,136,238,255)",		//azul
			"rgba(24,184,85,255)",		//verde
			"rgba(228,223,24,255)"		//amarillo
		];
		this.color = this.colors[type-1];
		
		this.scheduleUpdate(1/60);
	},
	draw:function(){
		cc.renderContext.fillStyle = this.color;
		cc.renderContext.strokeStyle = "rgba(0,0,0,0)";
		cc.drawingUtil.drawPoint(cc.PointZero(),20);
		
		if(this.pointsLabel != null) this.pointsLabel.removeFromParent();
		this.pointsLabel = cc.LabelTTF.create(""+this.points, "Arial", 20);
        this.pointsLabel.setPosition(cc.PointZero());
        this.pointsLabel.setColor(new cc.Color3B(0,0,0));
        this.addChild(this.pointsLabel);
	},
	myUpdate:function(){
		this.points = this.parent.points[this.type];
		
	},
});
