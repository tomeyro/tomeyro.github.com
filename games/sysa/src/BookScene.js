var BOOK_PAGES = [
'REGIÓN DEL AMAZONAS',	'FLORA DEL AMAZONAS',	'FAUNA DEL AMAZONAS',	'EL RECICLAJE',
'REGIÓN DE LOS ANDES',	'FLORA DE LOS ANDES',	'FAUNA DE LOS ANDES',	'BENEFICIOS DEL RECICLAJE',
'REGIÓN DEL CARIBE',	'FLORA DEL CARIBE',		'FAUNA DEL CARIBE',		'CLASIFICACION DE DESECHOS',
'REGIÓN DE LOS LLANOS',	'FLORA DE LOS LLANOS',	'FAUNA DE LOS LLANOS',	'PASOS PARA EL RECICLAJE'
];

var BookScene = cc.Layer.extend({
	id: 'BOOK SCENE',
	init: function() {
		this._super();
		this.winSize = cc.Director.getInstance().getWinSize();
		
		var bgLayer = cc.LayerColor.create(new cc.Color4B(255,255,255,255), this.winSize.width*2, this.winSize.height*2);
		bgLayer.setPosition(cc.p(0, 0));
		this.addChild(bgLayer);
		
		this.spriteFrameCache = cc.SpriteFrameCache.getInstance();
		this.spriteFrameCache.addSpriteFrames(plist_BookPack);
		
		var bgImgFrame = this.spriteFrameCache.getSpriteFrame("pag00_00.png");
		var bgImgSprite = cc.Sprite.createWithSpriteFrame(bgImgFrame);
		bgImgSprite.setAnchorPoint(cc.p(0,0));
	    bgImgSprite.setPosition(cc.PointZero());
	    this.addChild(bgImgSprite);
	    
	    var pointsLabel = new PointsLabel();
	    pointsLabel.setPosition(cc.p(275, this.winSize.height*2-42));
	    this.addChild(pointsLabel); 
		
		this.menuLayer = cc.Layer.create();
		this.pages = new Array();
		
		this.createButton('Reciclaje', 	150*2, 35*2, 70, 		267+35+30, 	0, 1, 4);
		this.createButton('Amazonas', 	150*2, 35*2, 230, 		267+35+30, 	4, 1, 1);
		this.createButton('Flora', 		150*2, 35*2, 70+350, 	267+35+30, 	4, 1, 2);
		this.createButton('Fauna', 		150*2, 35*2, 230+350,	267+35+30, 	4, 1, 3);
		
		this.createButton('Beneficios', 	150*2, 35*2, 70, 		267+10,		0, 2, 4);
		this.createButton('Andes', 		150*2, 35*2, 230, 		267+10,		2, 2, 1);
		this.createButton('Flora', 		150*2, 35*2, 70+350,	267+10,		2, 2, 2);
		this.createButton('Fauna', 		150*2, 35*2, 230+350, 	267+10,		2, 2, 3);
		
		this.createButton('Clasificación', 	150*2, 35*2, 70,		161+35+20, 	0, 3, 4);
		this.createButton('Caribe', 	150*2, 35*2, 230,		161+35+20, 	1, 3, 1);
		this.createButton('Flora', 		150*2, 35*2, 70+350,	161+35+20, 	1, 3, 2);
		this.createButton('Fauna', 		150*2, 35*2, 230+350,	161+35+20, 	1, 3, 3);
		
		this.createButton('Pasos', 	150*2, 35*2, 70,		161, 		0, 4, 4);
		this.createButton('Llanos', 	150*2, 35*2, 230,		161, 		3, 4, 1);
		this.createButton('Flora', 		150*2, 35*2, 70+350,	161, 		3, 4, 2);
		this.createButton('Fauna', 		150*2, 35*2, 230+350,	161, 		3, 4, 3);
	    
	    this.menu = cc.Menu.create(this.pages);
		this.menu.setPosition(cc.p(0,0));
		this.menuLayer.addChild(this.menu);
		
		this.addChild(this.menuLayer);
	    
	    this.setScale(0.5);
	    this.setAnchorPoint(cc.p(0,0));
	    this.setPosition(cc.p(0,0));
	    
	    this.setTouchEnabled(true);
		this.setKeyboardEnabled(true);
		this.scheduleUpdate(1/60);
		
		AudioManager.playBgm(Bgm[0]);
	},
	
	createButton: function(txt, w, h, x, y, color, chapter, page) {
		x = x*2;
		y = y*2;
		var btnBg = new ButtonBackground(w, h, color);
	    btnBg.setPosition(cc.p(x, y));
	    this.menuLayer.addChild(btnBg);
	    
	    var item = cc.MenuItemFont.create(txt, 'goToPage', this);
	    var btnPos = cc.p(btnBg.getPosition().x+btnBg.size.width*0.5,btnBg.getPosition().y+btnBg.size.height*0.5);
	    item.setPosition(btnPos);
		item.setFontName("Arial");
        item.setColor(cc.c3b(0,0,0));
        item.data = {chapter: chapter, page: page};
        
        var lvlList = ls.SYSA_Levels.split(',');
		var lvl = ((4*(chapter-1))+page)-1;
		if (Number(lvlList[lvl]) != 1)
		 item.setEnabled(false);
        
        this.pages.push(item);
	},
	goToPage: function(btn) {
		AudioManager.playSfx('act');
		this.chapter = btn.data.chapter;
		this.page = btn.data.page;
		
		this.pageLayer = cc.Layer.create();
		
		var page = "pag0"+this.chapter+"_0"+this.page+".png";
		var pageFrame = this.spriteFrameCache.getSpriteFrame(page);
		var pageSprite = cc.Sprite.createWithSpriteFrame(pageFrame);
		pageSprite.setAnchorPoint(cc.p(0,0));
	    pageSprite.setPosition(cc.PointZero());
	    this.pageLayer.addChild(pageSprite);
	    
	    this.menuLayer.removeFromParent();
	    this.addChild(this.pageLayer);
	    
	    this.inPage = true;
	},
	goToIndex: function() {
		AudioManager.playSfx('act');
		this.chapter = null;
		this.page = null;
		this.pageLayer.removeFromParent();
		this.addChild(this.menuLayer);
		this.pageLayer = null;
		this.inPage = false;
	},
	
	showing: false,
	showPic: function(pic) {
		AudioManager.playSfx('act');
		this.bgLayer = cc.LayerColor.create(new cc.Color4B(0,0,0,200), this.winSize.width*2, this.winSize.height*2);
		this.bgLayer.setPosition(cc.p(0,0));
		this.addChild(this.bgLayer);
		
		this.bigPic = new cc.SpriteCanvas();
		this.bigPic.initWithFile(pics[this.chapter-1][this.page-1][pic-1].src);
		this.bigPic.setAnchorPoint(cc.p(0.5,0.5));
	    this.bigPic.setPosition(cc.p(this.winSize.width,this.winSize.height));
	    this.bigPic.setScale(1.5);
	    this.addChild(this.bigPic);
	    
	    this.picTitle = new PictureTitle(pics[this.chapter-1][this.page-1][pic-1].title);
	    this.addChild(this.picTitle);
	    
	    this.showing = true;
	},
	removePic: function() {
		AudioManager.playSfx('act');
		this.bgLayer.removeFromParent();
		this.bigPic.removeFromParent();
		this.picTitle.removeFromParent();
		this.showing = false;
	},
	
	goToRegions: function() {
		AudioManager.playSfx('act');
		SceneManager.SetScene(RegionsScene);
	},
	askQuestion: function() {
		AudioManager.playSfx('act');
	},
	
	onTouchesBegan: function(touches, event) {
		if (this.paused) return;
		
		if (this.showing) {
			this.removePic();
			return;
		}
		
		var click = touches[0].getLocation();
		
		if (click.y >= 23 && click.y <= 79) {
			if (click.x >= 313 && click.x <= 370) {
				if (!this.inPage)
					this.goToRegions();
				else
					this.goToIndex();
			}
			if (click.x >= 433 && click.x <= 490) this.askQuestion();
		}
		
		if (this.inPage) {
			if (click.y >= 267 && click.y <= 367) {
				if (click.x >= 70 && click.x <= 220) this.showPic(1);
				if (click.x >= 230 && click.x <= 380) this.showPic(2);
			}
			if (click.y >= 161 && click.y <= 261) {
				if (click.x >= 70 && click.x <= 220) this.showPic(3);
				if (click.x >= 230 && click.x <= 380) this.showPic(4);
			}
		}		
	},
});

var PictureTitle = cc.Sprite.extend({
	ctor:function(title){
		this._super();
		this.size = cc.p(345*2,90*2);
		
		this.title = title || "'SIN TITULO' - De: SIN ORIGEN - Por: SIN AUTOR";
		
		this.setAnchorPoint(cc.p(0,0));
		this.setPosition(cc.p(228*2,0));
	},
	draw:function(){
		cc.drawingUtil.drawSolidRect(cc.p(0,0), this.size, new cc.Color4B(0,0,0,255));
		
		if(this.titleLabel != null) this.titleLabel.removeFromParent();
		this.titleLabel = cc.LabelTTF.create(this.title, "Arial", 35, new cc.Size(this.size.x-40,null), cc.TEXT_ALIGNMENT_CENTER);
		this.titleLabel.setAnchorPoint(cc.p(0,0));
        this.titleLabel.setPosition(cc.p(20, this.size.y-20));
        this.titleLabel.setColor(new cc.Color3B(255,255,255));
        this.addChild(this.titleLabel);
	}
});
