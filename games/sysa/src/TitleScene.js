var TitleScene = cc.Layer.extend({
	id: 'TITLE SCENE',
	init: function() {
		this._super();
		this.winSize = cc.Director.getInstance().getWinSize();
		
		var bgLayer = cc.LayerColor.create(new cc.Color4B(255,255,255,255), this.winSize.width*2, this.winSize.height*2);
		bgLayer.setPosition(cc.p(0, 0));
		this.addChild(bgLayer);
		
		this.spriteFrameCache = cc.SpriteFrameCache.getInstance();
		this.spriteFrameCache.addSpriteFrames(plist_ScreensPack);
		
		var bgImgFrame = this.spriteFrameCache.getSpriteFrame("title_screen.png");
		var bgImgSprite = cc.Sprite.createWithSpriteFrame(bgImgFrame);
		bgImgSprite.setAnchorPoint(cc.p(0,0));
	    bgImgSprite.setPosition(cc.PointZero());
	    this.addChild(bgImgSprite);
	    
	    var pointsLabel = new PointsLabel();
	    pointsLabel.setPosition(cc.p(275, this.winSize.height*2-42));
	    this.addChild(pointsLabel);
	    
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
	
	preSelectedCharacter: null,
	preSelectCharacter: function (character) {
		AudioManager.playSfx('act');
		
		child = this.getChildByTag('chDescriptionLayer');
	    if (child != null) child.removeFromParent();
	    
	    var chDescriptionLayer = cc.Layer.create();
	    
	    var chDescriptionBgFrame = this.spriteFrameCache.getSpriteFrame("title_screen_00.png");
		var chDescriptionBgSprite = cc.Sprite.createWithSpriteFrame(chDescriptionBgFrame);
		chDescriptionBgSprite.setAnchorPoint(cc.p(0,0));
	    chDescriptionBgSprite.setPosition(cc.PointZero());
	    
	    chDescriptionLayer.addChild(chDescriptionBgSprite);
		
		var chDescriptionFrame = this.spriteFrameCache.getSpriteFrame("title_screen_0"+character+".png");
		var chDescriptionSprite = cc.Sprite.createWithSpriteFrame(chDescriptionFrame);
		chDescriptionSprite.setAnchorPoint(cc.p(0,0));
	    chDescriptionSprite.setPosition(cc.PointZero());
		
	    chDescriptionLayer.addChild(chDescriptionSprite, 1, 'chDescription');
	    
	    var isUnlocked = Number(ls.SYSA_Characters.split(',')[character-1]) == 1 ? true : false;
	    
	    var continueBtnBg = new ButtonBackground(400,70,0);
	    continueBtnBg.setPosition(cc.p(this.winSize.width+continueBtnBg.size.width*0.25, 50));

	    chDescriptionLayer.addChild(continueBtnBg, 2, 'continueBtnBg');
	    
	    var continueAction = this.goToRegions;
	    var cList = ls.SYSA_Cinematics.split(',');
	    if ( Number(cList[0]) == 0 ) {
			continueAction = this.showCinematic;
			cList[0] = 1;
			ls.SYSA_Cinematics = cList;
		}
	    
	    var continueBtn = cc.MenuItemFont.create("Continuar", continueAction);
	    var btnPos = cc.p(continueBtnBg.getPosition().x+continueBtnBg.size.width*0.5,continueBtnBg.getPosition().y+continueBtnBg.size.height*0.5);
	    continueBtn.setPosition(btnPos);
		continueBtn.setFontName("Arial");
        continueBtn.setColor(cc.c3b(0,0,0));
        continueBtn.setEnabled(isUnlocked ? true : false);

        if (!isUnlocked) {
			var unlockBtnBg = new ButtonBackground(400,70,0);
			unlockBtnBg.setPosition(cc.p(this.winSize.width-unlockBtnBg.size.width*1.25, 50));

			chDescriptionLayer.addChild(unlockBtnBg, 2, 'unlockBtnBg');
			
			var lockedCh = 0;
			var chList = ls.SYSA_Characters.split(',');
			for (var ch = 0; ch < chList.length; ch++) {
				if (Number(chList[ch]) == 0) lockedCh++;
			}
			var price = 10000 - (lockedCh-1)*2500;
			
			var unlockBtn = cc.MenuItemFont.create("Liberar x "+price+" Pts", 'unlockCharacter', this);
			unlockBtn.data = {
				ch: character,
				price: price
			};
			btnPos = cc.p(unlockBtnBg.getPosition().x+unlockBtnBg.size.width*0.5,unlockBtnBg.getPosition().y+unlockBtnBg.size.height*0.5);
			unlockBtn.setPosition(btnPos);
			unlockBtn.setFontName("Arial");
			unlockBtn.setColor(cc.c3b(0,0,0));
			
			if (price > Number(ls.SYSA_Points)) unlockBtn.setEnabled(false);
		}        
        
		var menu = cc.Menu.create(continueBtn, isUnlocked ? null : unlockBtn);
		menu.setPosition(cc.p(0,0));

	    chDescriptionLayer.addChild(menu, 3, 'chDescriptionMenu');

		this.addChild(chDescriptionLayer, this.getChildrenCount(), 'chDescriptionLayer');
		
		SYSA.SelectedCharacter = character;
	},
	
	showCinematic: function() {
		AudioManager.playSfx('act');
		SceneManager.LoadScene(Cinematic);
	},
	goToRegions: function() {
		AudioManager.playSfx('act');
		SceneManager.SetScene(RegionsScene);
	},
	unlockCharacter: function(btn) {
		AudioManager.playSfx('act');
		var characters = ls.SYSA_Characters.split(',');
		characters[btn.data.ch-1] = 1;
		ls.SYSA_Characters = characters;
		
		ls.SYSA_Points = Number(ls.SYSA_Points)-btn.data.price;
		
		this.preSelectCharacter(btn.data.ch);
	},
	
	onTouchesBegan: function(touches, event) {
		var click = touches[0].getLocation();
		if (click.y > 225 && click.y < 392) {
			if (click.x > 312 && click.x < 372) this.preSelectCharacter(CH_SIMON);
			if (click.x > 417 && click.x < 482) this.preSelectCharacter(CH_MANUELITA);
			if (click.x > 512 && click.x < 579) this.preSelectCharacter(CH_FRANCISCO);
			if (click.x > 608 && click.x < 674) this.preSelectCharacter(CH_MATEA);
			if (click.x > 703 && click.x < 770) this.preSelectCharacter(CH_CACIQUE);
		}
	},
	onTouchesMoved:function(touches, event){
	},
	onKeyDown:function(e){
	},
	onKeyUp:function(e){
	},
});

var ButtonBackground = cc.Sprite.extend({
	winSize:null,
	points:0,
	ctor:function(w, h, color){
		this._super();
		this.winSize = cc.Director.getInstance().getWinSize();
		
		var colors = [
			new cc.Color4B(255,102,0,255),		//naranja 	: 0
			new cc.Color4B(222,33,33,255),		//rojo 		: 1
			new cc.Color4B(27,136,238,255),		//azul 		: 2
			new cc.Color4B(228,223,24,255),		//amarillo 	: 3
			new cc.Color4B(24,184,85,255),		//verde 	: 4
			new cc.Color4B(200,200,200,255),	//gris 		: 5
		];
		this.color = colors[color];
		
		this.size = new cc.Size(w,h);
		
		this.scheduleUpdate(1/60);
	},
	draw: function() {
		cc.drawingUtil.drawSolidRect(cc.p(0,0),cc.p(this.size.width,this.size.height), new cc.Color4B(0,0,0,255));
        cc.drawingUtil.drawSolidRect(cc.p(4,4),cc.p(this.size.width-4,this.size.height-4), this.color);
	},
	myUpdate: function() {
	}
});

var PointsLabel = cc.Sprite.extend({
	points:0,
	ctor:function(){
		this._super();	
		this.points = Number(ls.SYSA_Points);		
		this.scheduleUpdate(1/60);
	},
	draw:function(){		
		if(this.label != null) this.label.removeFromParent();
		this.label = cc.LabelTTF.create(""+this.points, "Arial", 40);
        this.label.setPosition(cc.PointZero());
        this.label.setColor(new cc.Color3B(255,102,0));
        this.addChild(this.label);
	},
	update:function(){
		this.points = Number(ls.SYSA_Points);
	},
});
