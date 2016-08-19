var RecyclingScreen = cc.Layer.extend({
	init: function() {
		this._super();
		this.winSize = cc.Director.getInstance().getWinSize();
		
		this.bgLayer = new BackgroundSprite(this.winSize.width*2, this.winSize.height*2);
		this.bgLayer.setPosition(cc.p(0,0));
		this.bgLayer.setOpacity(0);
		this.addChild(this.bgLayer);
		
		var spriteFrameCache = cc.SpriteFrameCache.getInstance();
		spriteFrameCache.addSpriteFrames(plist_ScreensPack);
		
		var bgImgFrame = spriteFrameCache.getSpriteFrame("recycling_screen_00.png");
		this.bgImgSprite = cc.Sprite.createWithSpriteFrame(bgImgFrame);
		this.bgImgSprite.setAnchorPoint(cc.p(0,0));
		this.bgImgSprite.setPosition(cc.PointZero());
		this.bgImgSprite.setOpacity(0);
		this.addChild(this.bgImgSprite);
		
		this.buttons = new Array();
		
		this.createButton('Orgánicos', 1, 115*2, 35*2, 62.5*2, 150*2, 5);
		this.createButton('Plásticos', 2, 115*2, 35*2, 202.5*2, 150*2, 1);
		this.createButton('Papel/Cartón', 3, 115*2, 35*2, 342.5*2, 150*2, 2);
		this.createButton('Vidrios', 4, 115*2, 35*2, 482.5*2, 150*2, 4);
		this.createButton('Metales', 5, 115*2, 35*2, 622.5*2, 150*2, 3);
		
		this.menu = cc.Menu.create(this.buttons);
		this.menu.setPosition(cc.p(0,0));
		this.addChild(this.menu);
		
		this.setScale(1);
	    this.setAnchorPoint(cc.p(0,0));
	    this.setPosition(cc.p(0,0));
	    
	    this.bgLayer.runAction(cc.FadeIn.create(2));
	    this.bgImgSprite.runAction(cc.FadeIn.create(2));
	    
	    this.updatePoints();
	    this.newItem();
	},
	
	createButton: function(txt, category, w, h, x, y, color) {
		var btnBg = new ButtonBackground(w, h, color);
	    btnBg.setPosition(cc.p(x, y));
	    this.addChild(btnBg);
	    
	    var item = cc.MenuItemFont.create(txt, 'recycle', this);
	    var btnPos = cc.p(btnBg.getPosition().x+btnBg.size.width*0.5,btnBg.getPosition().y+btnBg.size.height*0.5);
	    item.setPosition(btnPos);
		item.setFontName("Arial");
        item.setColor(cc.c3b(0,0,0));
        item.category = category;
        
        this.buttons.push(item);
	},
	
	newItem: function() {		
		this.removeItem();
		
		this.currentItem = getRandomInt(1,10);
		this.itemCategory = Math.ceil(this.currentItem/2);
		
		var spriteFrameCache = cc.SpriteFrameCache.getInstance();
		spriteFrameCache.addSpriteFrames(plist_CollectiblesPack);
		
		var number = this.currentItem < 10 ? "0"+this.currentItem : ""+this.currentItem;
		var frame = spriteFrameCache.getSpriteFrame("c"+number+".png");
		this.itemSprite = cc.Sprite.createWithSpriteFrame(frame);
		this.itemSprite.setScale(2);
		this.itemSprite.setAnchorPoint(cc.p(0.5,0));
	    this.itemSprite.setPosition(cc.p(this.winSize.width,45*2));
	    
	    this.addChild(this.itemSprite);
	},
	removeItem: function() {
		if (this.itemSprite != null) this.itemSprite.removeFromParent();
	},
	
	recycle: function(b) {
		AudioManager.playSfx('act');
		
		if (this.counter == null) this.counter = 0;
		if (this.counter < 10) {
			this.counter++;
			this.updatePoints(this.itemCategory == b.category);
		}
		if (this.counter >= 10) {
			this.removeItem();
			this.finishRecycling();
			return;
		}
				
		if (this.label != null) this.label.removeFromParent();		
		var labelTxt = (this.itemCategory == b.category) ? '¡ CORRECTO !' : '¡ INCORRECTO !';
		this.label = cc.LabelTTF.create(labelTxt, "Arial", 50);
		this.label.setAnchorPoint(cc.p(0,0));
        this.label.setPosition(cc.p(535*2, 80*2));
        this.label.setColor(new cc.Color3B(255,102,0));
        this.addChild(this.label);
        
		this.newItem();		
	},
	
	updatePoints: function(isCorrect) {	
		if (this.points == null) this.points = 0;
		if (isCorrect) this.points += 1;
		
		if (this.pointLabel != null) this.pointLabel.removeFromParent();
		this.pointLabel = cc.LabelTTF.create(this.points, "Arial", 50);
		this.pointLabel.setAnchorPoint(cc.p(0,0));
        this.pointLabel.setPosition(cc.p(535*2 + 200, 25*2));
        this.pointLabel.setColor(new cc.Color3B(255,102,0));
        this.addChild(this.pointLabel);	
	},
	
	finishRecycling: function() {
		SYSA.Bonus = this.points;
		
		this.runAction(
			cc.Sequence.create(
				cc.DelayTime.create(1), cc.CallFunc.create(this.showPoints)
			)
		);
	},
	
	showPoints: function() {
		SceneManager.LoadScene(PointsScene);
	},
});
