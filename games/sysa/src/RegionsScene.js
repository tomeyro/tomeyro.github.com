var RegionsScene = cc.Layer.extend({
	id: 'REGIONS SCENE',
	init: function() {
		this._super();
		this.winSize = cc.Director.getInstance().getWinSize();
		
		var bgLayer = cc.LayerColor.create(new cc.Color4B(255,255,255,255), this.winSize.width*2, this.winSize.height*2);
		bgLayer.setPosition(cc.p(0, 0));
		this.addChild(bgLayer);
		
		this.spriteFrameCache = cc.SpriteFrameCache.getInstance();
		this.spriteFrameCache.addSpriteFrames(plist_ScreensPack);
		
		var bgImgFrame = this.spriteFrameCache.getSpriteFrame("regions_screen_00.png");
		var bgImgSprite = cc.Sprite.createWithSpriteFrame(bgImgFrame);
		bgImgSprite.setAnchorPoint(cc.p(0,0));
	    bgImgSprite.setPosition(cc.PointZero());
	    this.addChild(bgImgSprite);
	    
	    var pointsLabel = new PointsLabel();
	    pointsLabel.setPosition(cc.p(275, this.winSize.height*2-42));
	    this.addChild(pointsLabel);
	    
	    this.regions = new Array();
	    
	    this.createButton('CARIBE', 400, 70, 75, 625, 1, 3);
	    this.createButton('ANDES', 400, 70, 100, 525, 2, 2);
	    this.createButton('LLANOS', 400, 70, 75, 425, 3, 4);
	    this.createButton('AMAZONAS', 400, 70, 100, 325, 4, 1);
	    
	    this.menu = cc.Menu.create(this.regions);
		this.menu.setPosition(cc.p(0,0));
		this.addChild(this.menu);
	    
	    this.setScale(0.5);
	    this.setAnchorPoint(cc.p(0,0));
	    this.setPosition(cc.p(0,0));
	    
	    this.setTouchEnabled(true);
		this.setKeyboardEnabled(true);
		this.scheduleUpdate(1/60);
		
		AudioManager.playBgm(Bgm[0]);
	},
	
	update: function() {
		
	},
	
	createButton: function(txt, w, h, x, y, color, target) {
		var btnBg = new ButtonBackground(w, h, color);
	    btnBg.setPosition(cc.p(x, y));
	    this.addChild(btnBg);
	    
	    var item = cc.MenuItemFont.create(txt, 'goToLevels', this);
	    var btnPos = cc.p(btnBg.getPosition().x+btnBg.size.width*0.5,btnBg.getPosition().y+btnBg.size.height*0.5);
	    item.setPosition(btnPos);
		item.setFontName("Arial");
        item.setColor(cc.c3b(0,0,0));
        item.region = target;
        
        this.regions.push(item);
	},
	goToLevels: function(btn) {
		AudioManager.playSfx('act');
		SYSA.SelectedWorld = btn.region;
		SceneManager.SetScene(LevelsScene);
	},
	goToTitle: function() {
		AudioManager.playSfx('act');
		SceneManager.SetScene(TitleScene);
	},
	openMenu: function() {
		AudioManager.playSfx('act');
		this.pause();
		this.menuLayer = new menu();
		this.menuLayer.init(mainMenuOptions, this);
		this.menuLayer.setScale(2);
		this.menuLayer.setAnchorPoint(cc.p(0,0));
		this.menuLayer.setPosition(cc.p(0,0));
		this.addChild(this.menuLayer);
	},
	goToBook: function() {
		AudioManager.playSfx('act');
		SceneManager.SetScene(BookScene);
	},
	paused: false,
	pause: function() {
		this.paused = !this.paused;
		this.menu.setEnabled(!this.paused);
	},
	
	onTouchesBegan: function(touches, event) {
		if (this.paused) return;
		var click = touches[0].getLocation();
		if (click.y > 43 && click.y < 99) {
			if (click.x > 90 && click.x < 145) this.goToTitle();
			if (click.x > 196 && click.x < 254) this.openMenu();
			if (click.x > 300 && click.x < 357) this.goToBook();
		}
	},
	onTouchesMoved:function(touches, event){
	},
	onKeyDown:function(e){
	},
	onKeyUp:function(e){
	},
});
