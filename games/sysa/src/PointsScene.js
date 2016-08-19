var PointsScene = cc.Layer.extend({
	id: 'POINTS SCENE',
	init: function() {
		this._super();
		this.winSize = cc.Director.getInstance().getWinSize();
		
		this.bgLayer = new BackgroundSprite(this.winSize.width*2, this.winSize.height*2);
		this.bgLayer.setPosition(cc.p(0,0));
		this.addChild(this.bgLayer);
		
		var spriteFrameCache = cc.SpriteFrameCache.getInstance();
		spriteFrameCache.addSpriteFrames(plist_ScreensPack);
		
		var bgImgFrame = spriteFrameCache.getSpriteFrame("points_screen_00.png");
		this.bgImgSprite = cc.Sprite.createWithSpriteFrame(bgImgFrame);
		this.bgImgSprite.setAnchorPoint(cc.p(0,0));
		this.bgImgSprite.setPosition(cc.PointZero());
		this.addChild(this.bgImgSprite);
		
		var black = new cc.Color3B(0,0,0);
		var orange = new cc.Color3B(255,102,0);
		var white = new cc.Color3B(255,255,255);
		
		var cpMul = 15;
		var bpMul = 50;
		
		var cp = 0;
		for (var i = 0; i < SYSA.Points.length; i++)
			cp += SYSA.Points[i];
		var cpTotal = cp * cpMul;
		
		var bp = SYSA.Bonus;
		var bpTotal = bp * bpMul;
		
		this.createLabel(cp, 380*2, 340*2, black);
		this.createLabel(cpMul, 500*2, 340*2, black);
		this.createLabel(cpTotal+' Pts', 650*2, 340*2, black);
		
		this.createLabel(bp, 380*2, 290*2, black);
		this.createLabel(bpMul, 500*2, 290*2, black);
		this.createLabel(bpTotal+' Pts', 650*2, 290*2, black);
		
		this.totalPoints = cpTotal + bpTotal;
		
		this.createLabel(this.totalPoints+' Pts', 650*2, 210*2, orange);
		
		this.saveProgress();
		
		var page = BOOK_PAGES[((4*(SYSA.SelectedWorld-1))+SYSA.SelectedLevel)-1];
		this.createLabel(page, 390*2, 125*2, white);
		
		var btn = this.createButton('Continuar', 200*2, 35*2, 1100, 65, 0);
		
		var menu = cc.Menu.create(btn);
		menu.setPosition(cc.p(0,0));
		this.addChild(menu);
	
		this.setScale(0.5);
	    this.setAnchorPoint(cc.p(0,0));
	    this.setPosition(cc.p(0,0));	    
	},
	
	saveProgress: function() {
		ls.SYSA_Points = Number(ls.SYSA_Points)+this.totalPoints;
		
		var lvlList = ls.SYSA_Levels.split(',');
		var currentLvl = ((4*(SYSA.SelectedWorld-1))+SYSA.SelectedLevel)-1;
		lvlList[currentLvl] = 1;
		ls.SYSA_Levels = lvlList;
	},
	
	createLabel: function(txt, x, y, color) {
		var label = cc.LabelTTF.create(txt, "Arial", 40);
		label.setAnchorPoint(cc.p(0,0));
        label.setPosition(cc.p(x,y));
        label.setColor(color);
        this.addChild(label);
	},
	
	createButton: function(txt, w, h, x, y, color) {
		var btnBg = new ButtonBackground(w, h, color);
	    btnBg.setPosition(cc.p(x, y));
	    this.addChild(btnBg);
	    
	    var item = cc.MenuItemFont.create(txt, 'goToRegions', this);
	    var btnPos = cc.p(btnBg.getPosition().x+btnBg.size.width*0.5,btnBg.getPosition().y+btnBg.size.height*0.5);
	    item.setPosition(btnPos);
		item.setFontName("Arial");
        item.setColor(cc.c3b(0,0,0));
        
        return(item);
	},
	
	goToRegions: function() {
		SceneManager.SetScene(RegionsScene);
	},
});
