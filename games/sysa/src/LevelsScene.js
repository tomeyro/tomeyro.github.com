var LevelsScene = cc.Layer.extend({
	id: 'LEVELS SCENE',
	init: function() {
		this._super();
		this.winSize = cc.Director.getInstance().getWinSize();
		
		var bgLayer = cc.LayerColor.create(new cc.Color4B(255,255,255,255), this.winSize.width*2, this.winSize.height*2);
		bgLayer.setPosition(cc.p(0, 0));
		this.addChild(bgLayer);
		
		this.spriteFrameCache = cc.SpriteFrameCache.getInstance();
		this.spriteFrameCache.addSpriteFrames(plist_ScreensPack);
		
		var bgImgFrame = this.spriteFrameCache.getSpriteFrame("levels_screen_00.png");
		var bgImgSprite = cc.Sprite.createWithSpriteFrame(bgImgFrame);
		bgImgSprite.setAnchorPoint(cc.p(0,0));
	    bgImgSprite.setPosition(cc.PointZero());
	    this.addChild(bgImgSprite);
	    
	    var pointsLabel = new PointsLabel();
	    pointsLabel.setPosition(cc.p(275, this.winSize.height*2-42));
	    this.addChild(pointsLabel);
	    
	    var levelPreviewFrame = this.spriteFrameCache.getSpriteFrame("levels_screen_0"+SYSA.SelectedWorld+".png");
		var levelPreviewSprite = cc.Sprite.createWithSpriteFrame(levelPreviewFrame);
		levelPreviewSprite.setAnchorPoint(cc.p(0,0));
	    levelPreviewSprite.setPosition(cc.PointZero());
	    this.addChild(levelPreviewSprite);
	    
	    this.levels = new Array();
	    
	    this.createButton('NIVEL 1', 300, 70, 70*2, 150*2, 0, 1);
	    this.createButton('NIVEL 2', 300, 70, 240*2, 150*2, 0, 2);
	    this.createButton('NIVEL 3', 300, 70, 410*2, 150*2, 0, 3);
	    this.createButton('NIVEL 4', 300, 70, 580*2, 150*2, 0, 4);
	    
	    this.menu = cc.Menu.create(this.levels);
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
	    
	    var item = cc.MenuItemFont.create(txt, 'loadLevel', this);
	    var btnPos = cc.p(btnBg.getPosition().x+btnBg.size.width*0.5,btnBg.getPosition().y+btnBg.size.height*0.5);
	    item.setPosition(btnPos);
		item.setFontName("Arial");
        item.setColor(cc.c3b(0,0,0));
        item.level = target;
        
        if (item.level == 4) {
			var lvlList = ls.SYSA_Levels.split(',');
			var completed = true;
			for (var i = 1; i < 4; i++) {
				if (Number(lvlList[((4*(SYSA.SelectedWorld-1))+i)-1]) == 0) {
					completed = false;
				}
			}
			if (!completed) item.setEnabled(false); 
		}
        
        this.levels.push(item);
	},
	loadLevel: function(btn) {
		AudioManager.playSfx('act');
		SYSA.SelectedLevel = btn.level;
		SceneManager.LoadScene(GameScene);
	},
	goToRegions:function () {
		AudioManager.playSfx('act');
		SceneManager.SetScene(RegionsScene);
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
	paused: false,
	pause: function() {
		this.paused = !this.paused;
		this.menu.setEnabled(!this.paused);
	},
	
	onTouchesBegan: function(touches, event) {
		if (this.paused) return;
		var click = touches[0].getLocation();
		if (click.y > 43 && click.y < 99) {
			if (click.x > 90 && click.x < 145) this.goToRegions();
			if (click.x > 196 && click.x < 254) this.openMenu();
		}
	},
	onTouchesMoved:function(touches, event){
	},
	onKeyDown:function(e){
	},
	onKeyUp:function(e){
	},
});
