// - //
// Menu Class
// - //
var menu = cc.Layer.extend({
	init: function(options, parent) {
		this._super();
		this.parent = parent;
		this.winSize = cc.Director.getInstance().getWinSize();
		
		this.backgroundLayer = cc.LayerColor.create(new cc.Color4B(0,0,0,200), this.winSize.width, this.winSize.height);
		this.backgroundLayer.setPosition(cc.p(0,0));
		this.addChild(this.backgroundLayer);
		
		this.items = new Array();
		for (var i = 0; i < options.length; i++) {
			this.createBtn(options[i].title, options[i].target, options.length, i);
		}
		var menu = cc.Menu.create(this.items);
		menu.setAnchorPoint(cc.PointZero());
		menu.setPosition(cc.PointZero());
		this.addChild(menu);
		
		this.setTouchEnabled(true);
	},
	createBtn: function(title, target, length, i) {
		if (title === 'SFX') title = Number(ls.SYSA_IsSFXOn) == 1 ? 'SONIDOS: SI' : 'SONIDOS: NO';
		if (title === 'BGM') title = Number(ls.SYSA_IsBGMOn) == 1 ? 'MÚSICA: SI' : 'MÚSICA: NO';
		var btn = cc.MenuItemFont.create(title, target, this);
		btn.setFontName("Arial");
		btn.setFontSize(40);
		btn.setColor(cc.c3b(255,255,255));
		var btnX = this.winSize.width*0.5;
		var btnY = this.winSize.height*0.5 - 40*((i-length)+(1+i));
		btn.setPosition(cc.p(btnX,btnY));
		this.items.push(btn);
	},
	
	test: function() {
	},
	doNothing: function() {
	},
	
	close: function() {
		AudioManager.playSfx('act');
		this.parent.pause();
		this.removeFromParent();
	},
	
	toggleSound: function(btn) {
		AudioManager.playSfx('act');
		ls.SYSA_IsSFXOn = Number(ls.SYSA_IsSFXOn) == 1 ? 0 : 1;
		var txt = Number(ls.SYSA_IsSFXOn) == 1 ? 'SONIDOS: SI' : 'SONIDOS: NO';
		var label = cc.LabelTTF.create(txt, "Arial", 40);
		btn.setLabel(label);
	},
	toggleMusic: function(btn) {
		AudioManager.playSfx('act');
		ls.SYSA_IsBGMOn = Number(ls.SYSA_IsBGMOn) == 1 ? 0 : 1;
		if (Number(ls.SYSA_IsBGMOn) == 0 && AudioManager.isBgmPlaying()) AudioManager.stopBgm();
		if (Number(ls.SYSA_IsBGMOn) == 1 && !AudioManager.isBgmPlaying()) AudioManager.playBgm();
		var txt = Number(ls.SYSA_IsBGMOn) == 1 ? 'MÚSICA: SI' : 'MÚSICA: NO';
		var label = cc.LabelTTF.create(txt, "Arial", 40);
		btn.setLabel(label);
	},
	
	goToRegions: function() {
		AudioManager.playSfx('act');
		SceneManager.SetScene(RegionsScene);
	},
	
	goToHelp: function() {
		SYSA.SelectedWorld = 0;
		SYSA.SelectedLevel = 0;
		SceneManager.LoadScene(GameScene);
	},
	
	restartLevel: function() {
		SceneManager.LoadScene(GameScene);
	},
	
	showRecyclingScreen: function() {
		AudioManager.playSfx('act');
		var recyclingLayer = new RecyclingScreen();
		recyclingLayer.init();
		recyclingLayer.setScale(0.5);
		recyclingLayer.setAnchorPoint(cc.p(0,0));
		recyclingLayer.setPosition(cc.p(0,0));
		this.parent.addChild(recyclingLayer);
		this.removeFromParent();
	},
	
	startBoss: function() {
		AudioManager.playSfx('act');
		this.removeFromParent();
		this.parent.paused = false;		
	},
});

var pauseOptions = [
	{title: 'CONTINUAR EL JUEGO', target: 'close'},
	{title: 'SFX', target: 'toggleSound'},
	{title: 'BGM', target: 'toggleMusic'},
	{title: 'VOLVER A LAS REGIONES', target: 'goToRegions'},
];

var mainMenuOptions = [
	{title: 'CERRAR MENÚ', target: 'close'},
	{title: 'SFX', target: 'toggleSound'},
	{title: 'BGM', target: 'toggleMusic'},
	{title: 'INSTRUCCIONES', target: 'goToHelp'},
];

var gameOverOptions = [
	{title: '¡ NIVEL NO COMPLETADO !', target: 'doNothing'},
	{title: 'Reintentar', target: 'restartLevel'},
	{title: 'Volver a las Regiones', target: 'goToRegions'},
];

var endingLevelOptions = [
	{title: '¡ NIVEL COMPLETADO !', target: 'doNothing'},
	{title: 'Continuar', target: 'showRecyclingScreen'},
];

var bossStartOptions = [
	{title: '¡ DRAGÓN DEL CARIBE !', target: 'doNothing'},
	{title: 'Click aquí para empezar el nivel', target: 'startBoss'},
];
