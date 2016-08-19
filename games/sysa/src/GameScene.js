var PTMratio = 32;

var IS_WORLD = 'is_world';
var IS_WATER = 'is_water';
var IS_LAND = 'is_land';

var GAME_SCALE = 0.75;

// -
// Level class
// -
var GameScene = cc.Layer.extend({
	
	id: 'GAME SCENE',
		
	// -
	// Variable declaration
	// -
	winSize: null,
	
	backgroundLayer: null,
	gameLayer: null,
	mapLayer: null,
	objectsLayer: null,
	infoLayer: null,
	hud: null,
	
	w: null,
	l: null,
	
	map: null,
	mapSize: null,
	
	world: null,
	
	player: null,
	enemies: new Array(),
	
	boxes: new Array(),
	toggles: new Array(),
	signs: new Array(),
	
	pauseLayer: null,
	paused: false,
	
	// -
	// Initialization method
	// -
	init: function() {
		this._super();
		
		this.winSize = cc.Director.getInstance().getWinSize();
		
		this.gameLayer = cc.Layer.create();
		this.tmxLayer = cc.Layer.create();
		this.objectsLayer = cc.Layer.create();
		this.infoLayer = cc.Layer.create();
		
		this.w = SYSA.SelectedWorld;
		this.l = SYSA.SelectedLevel;
		
		this.map = new cc.TMXTiledMap;
		var tmx = this.w == 0 && this.l == 0 ? training_map : tmx_map[this.w-1][this.l-1];
		this.map.initWithTMXFile(tmx);
		this.mapSize = this.map.getContentSize();
		
		var mapProperties = this.map.getProperties();
		var bgColor = mapProperties[0] != null ? mapProperties[0].RGB.split(",") : [0,128,128];
		var R = Number(bgColor[0]);
		var G = Number(bgColor[1]);
		var B = Number(bgColor[2]);
		
		this.backgroundLayer = cc.LayerColor.create(new cc.Color4B(R,G,B,255), this.winSize.width, this.winSize.height);
		this.backgroundLayer.setPosition(cc.p(0,0));
		this.addChild(this.backgroundLayer);
		
		this.tmxLayer.addChild(this.map);
		this.tmxLayer.setPosition(cc.p(0,0));
		
		this.world = new b2World(new b2Vec2(0,-10), true);
		
		var objectGroups = this.map.getObjectGroups();		
		for (var i=0; i < objectGroups.length; i++){
			var groupName = objectGroups[i].getGroupName();
			var objects = objectGroups[i].getObjects();
			if (groupName == "border")			
				this.createWorld(objects, false);
			if (groupName == "water")
				this.createWorld(objects, true);
			if (groupName == "logic")
				this.createLogicObjects(objects);
			if (groupName == "info")
				this.createSigns(objects);
			if (groupName == "end")
				this.setEnd(objects);
			if (groupName == "enemies")
				this.createEnemies(objects);
			if (groupName == "boss")
				this.createBoss(objects);
			if (groupName == "player")
				this.createPlayer(objects);
		}
		
		if (this.l == 4) {
			this.showToggles(false);
			this.showEnd(false);
		}

		this.objectsLayer.setPosition(cc.p(0,0));
		
		this.setContactListener();
		
		this.gameLayer.addChild(this.tmxLayer);
		this.gameLayer.addChild(this.objectsLayer);
		this.gameLayer.setPosition(cc.p(0,0));
		this.gameLayer.setScale(GAME_SCALE);
		
		this.points = [0,0,0,0,0];
		this.hud = new inGameHud();
		this.hud.init(this);

		this.addChild(this.gameLayer);
		this.addChild(this.hud);
		this.setPosition(cc.p(0,0));
		
		this.addChild(this.infoLayer);
		
		this.pauseLayer = new menu();
		this.pauseLayer.init(pauseOptions, this);
		
		this.setTouchEnabled(true);
		this.setKeyboardEnabled(true);
		this.scheduleUpdate(1/60);
		
		AudioManager.playBgm(Bgm[Number(SYSA.SelectedWorld)]);
		
		if (this.l == 4) this.bossStartMenu();		
		if (this.w == 0 && this.l == 0) this.createInfo("Para moverte y saltar, usa las flechas. Para leer los carteles, usa la barra espaciadora. Para pausar el juego, usa la tecla 'p'.");
	},
	
	// -
	// Update method
	// -
	update: function(dt) {

		if (this.paused) return;		
		
		var velocityIterations = 8;
        var positionIterations = 3;
        this.world.Step(dt, velocityIterations, positionIterations);
        this.world.ClearForces();
        
        this.player.update(dt);		
		for (var e=0; e<this.enemies.length; e++) this.enemies[e].update(dt);
		for (var b=0; b<this.boxes.length; b++)
			if (this.boxes[b].type == IS_EXPLOSIVE) this.boxes[b].update(dt);
		
		var playerPos = this.player.body.GetUserData().sprite.getPosition();
		var newX = this.gameLayer.getPosition().x;
		var newY = this.gameLayer.getPosition().y;
		if (playerPos.x > (this.winSize.width*0.5) && playerPos.x < (this.mapSize.width-(this.winSize.width*0.5)))
			newX = ((this.winSize.width*0.5)*GAME_SCALE - playerPos.x*GAME_SCALE);
		if (playerPos.y > (this.winSize.height*0.5) && playerPos.y < (this.mapSize.height-(this.winSize.height*0.5)))
			newY = ((this.winSize.height*0.5)*GAME_SCALE - playerPos.y*GAME_SCALE);
		this.gameLayer.setPosition(cc.p(newX,newY));

		if (this.itemsToCreate > 0)
			this.createItem();

        var b = this.world.GetBodyList();
        while(b) {
			if (b.GetUserData() == null) {
				b = b.GetNext();
				continue;
			}
			if (b.GetUserData().isDead) {
				if (b.GetUserData().type == IS_ITEM) this.pickUpItem(b.GetUserData());
				var imDead = b;
				b = b.GetNext();
				this.world.DestroyBody(imDead);
			} else {
				b = b.GetNext();
			}
		}
		
		if (this.resetingLogic) this.createLogicObjects(this.logicObjects);
	},
	
	// -
    // Class specific methods
    // -
    createWorld: function(objects, isWater) {
		for(var j=0; j < objects.length; j++) {
			var o = objects[j].polyline ? objects[j].polyline : null;
			if (o != null) {
				var fX = objects[j].x;
				var fY = objects[j].y;
				var type = objects[j].type;
				for(var k = 1; k < o.length; k++) {
					var p1 = o[k-1], p2 = o[k];
					this.createBorder(
						new b2Vec2((parseInt(fX)+parseInt(p1.x))/PTMratio, (parseInt(fY)-parseInt(p1.y))/PTMratio),
						new b2Vec2((parseInt(fX)+parseInt(p2.x))/PTMratio, (parseInt(fY)-parseInt(p2.y))/PTMratio),
						type, isWater
					);
				}
			}
		}
	},
	createBorder:function(x,y, type, isWater){
		var fixDef = new b2FixtureDef;
        fixDef.density = 1.0;
        fixDef.friction = 1;
        if ((y.y > x.y+0.25 || y.y < x.y-0.25)) fixDef.friction = 0;
		if (type == 1) fixDef.friction = 0;
        fixDef.restitution = 0;
		var bodyDef = new b2BodyDef();
		bodyDef.position.Set(0, 0);
		bodyDef.userData = {
			type: IS_WORLD,
		}
		fixDef.shape = new b2PolygonShape();
		fixDef.shape.SetAsEdge(x, y);
		if (isWater) fixDef.isSensor = true;
		var border = this.world.CreateBody(bodyDef).CreateFixture(fixDef);
		if (isWater) border.SetUserData(IS_WATER);
		else border.SetUserData(IS_LAND);
	},
	logicObjects: new Array(),
	createLogicObjects: function(objects) {
		var boxesList = new Array();
		for (var j=0; j < objects.length; j++) {
			var logic = null;
			if (objects[j].type == 0) {
				logic = new logicToggle(this, objects[j]);
				this.toggles.push(logic);
			} else if (objects[j].type == 1) {
				boxesList.push(objects[j]);
				logic = new logicBox(this, objects[j]);
				this.boxes.push(logic);
			}
			if (logic != null) this.objectsLayer.addChild(logic.sprite);
		}
		this.logicObjects = boxesList;
		if (this.resetingLogic) this.resetingLogic = false;
	},
	resetingLogic: false,
	resetLogicObjects: function() {
		for (var b = 0; b <= 5; b++) this.removeLogicObjects(b, false);
		this.boxes = new Array();
		for (var t = 0; t < this.toggles.length; t++) this.toggles[t].resetToggle();
		this.resetingLogic = true;
	},
	removeLogicObjects:function(color, toggles){
		var list = toggles ? this.toggles : this.boxes;
		for(var l=0; l<list.length; l++) {
			if(list[l].remove(color)) {
				var new_list = new Array();
				for(var nl=0; nl<list.length; nl++) {
					if (nl != l) new_list.push(list[nl]);
				}
				list = new_list;
				l--;
			}
		}
		if (toggles) this.toggles = list;
		else this.boxes = list;
	},
	showToggles: function(show) {
		if (show == null) show = true;
		for(var t = 0; t < this.toggles.length; t++) {
			this.toggles[t].sprite.setVisible(show);
		}
	},
	createSigns: function(objects) {
		for (var j=0; j < objects.length; j++) {
			if(objects[j].type == 1) {
				var sign = new infoSign(this, objects[j], j);
				this.objectsLayer.addChild(sign.sprite);
				this.signs.push(sign);
			}
		}
	},
	end: null,
	setEnd: function(objects) {
		for (var j=0; j < objects.length; j++) {
			if(objects[j].type == 0) {
				this.end = new ending(this, objects[j]);
				this.objectsLayer.addChild(this.end);
			}
		}
	},
	showEnd: function(show) {
		if (show == null) show = true;
		this.end.sprite.setVisible(show);
	},
	createEnemies: function(objects) {
		for (var j=0; j < objects.length; j++) {
			var o = objects[j];
			var e = new enemy(this.world, this, cc.p(o.x,o.y), o, j);
			this.objectsLayer.addChild(e.sprite);
			this.enemies.push(e);
		}
	},
	items: new Array(),
	itemsToCreate: 0,
	itemsPosition: 0,
	scheduleItemCreation: function(number, position) {
		this.itemsToCreate += number;
		this.itemsPosition = position;
	},
	createItem: function() {
		var randomNumber = getRandomInt(1,10);
		var newItem = new item(randomNumber, this.itemsPosition, this.world);
		this.objectsLayer.addChild(newItem);
		this.items.push(newItem);
		this.itemsToCreate--;
	},
	scheduleItemPickUp: function(itemUD, pm) {
		itemUD.isDead = true;
		itemUD.sprite.removeFromParent();
		this.pointsMul = pm;
	},
	pickUpItem: function(itemUD) {
		this.addPoints(itemUD.color);
		AudioManager.playSfx('pickup');
	},
	points: null,
	pointsMul: 1,
	addPoints: function(type) {
		var category = Math.ceil(type/2)-1;
		this.points[category] += this.pointsMul;
	},
	boss: null,
	createBoss: function(objects) {
		var posList = new Array();
		for (var j=0; j < objects.length; j++) {
			var o = objects[j];
			if (o.type != 0) {
				var b = Boss.create(this, o);
				this.objectsLayer.addChild(b);
				this.boss = b;
			} else {
				posList.push(o);
			}
		}
		this.boss.setStartingPos(posList);
	},
	createPlayer: function(objects) {
		for (var j=0; j < objects.length; j++) {
			if (objects[j].type == 0) {
				var playerPos = cc.p(objects[j].x,objects[j].y);
				this.player = new player(this, SYSA.SelectedCharacter, playerPos);
				this.objectsLayer.addChild(this.player.sprite);
			}
		}
	},
	setContactListener: function() {	
		var thePlayer = this.player;
		var enemies = this.enemies;
		var boss = this.boss;
		var toggles = this.toggles;
		var boxes = this.boxes;
		var signs = this.signs;
		var items = this.items;
		
		var contactListener = new b2ContactListener();
		
		contactListener.BeginContact = function(contact){
			thePlayer.contactBegan(contact);
			for (var e=0; e<enemies.length; e++) enemies[e].contactBegan(contact);
			for (var t=0; t<toggles.length; t++) toggles[t].contactBegan(contact);
			for (var s=0; s<signs.length; s++) signs[s].contactBegan(contact);
			for (var b=0; b<boxes.length; b++)
				if (boxes[b].type == IS_EXPLOSIVE) boxes[b].contactBegan(contact);
			if (boss != null) boss.contactBegan(contact);
		}
		contactListener.EndContact = function(contact){
			thePlayer.contactEnded(contact);
			for (var e=0; e<enemies.length; e++) enemies[e].contactEnded(contact);
			for (var t=0; t<toggles.length; t++) toggles[t].contactEnded(contact);
			for (var s=0; s<signs.length; s++) signs[s].contactEnded(contact);
		}
		contactListener.PreSolve = function(contact, oldManifold){
			for (var e=0; e<enemies.length; e++) enemies[e].contactPreSolve(contact);
			for (var b=0; b<boxes.length; b++)
				if (boxes[b].type == IS_EXPLOSIVE) boxes[b].contactPreSolve(contact);
			if (boss != null) boss.contactPreSolve(contact);
		}
		contactListener.PostSolve = function(contact, impulse){
		}
		
		this.world.SetContactListener(contactListener);
	},
	
	createInfo:function(text){
		var info = new Info(text);
		this.addChild(info);
		this.paused = true;
	},
	removeInfo:function(){
		var info = this.getChildByTag('info');
		this.removeChild(info);
		this.paused = false;
	},
	
	pause: function() {
		this.paused = !this.paused;
		if (this.paused) this.addChild(this.pauseLayer);
		else this.pauseLayer.removeFromParent();
	},
	finishLevel: function() {
		this.openEndingMenu();
	},
	openEndingMenu: function() {
		this.paused = true;
		var endingLevelMenu = new menu();
		endingLevelMenu.init(endingLevelOptions, this);
		this.addChild(endingLevelMenu);
		SYSA.Points = this.points;
	},
	gameOver: function() {
		this.paused = true;
		var gameOverMenu = new menu();
		gameOverMenu.init(gameOverOptions, this);
		this.addChild(gameOverMenu);
	},
	bossStartMenu: function() {
		this.paused = true;
		var bossMenu = new menu();
		bossMenu.init(bossStartOptions, this);
		this.addChild(bossMenu);
	},

    onTouchesBegan:function(touches, event){
		this.player.handleTouch();
	},
	onTouchesMoved:function(touches, event){
	},
	onKeyDown:function(e){
		this.player.handleKeyDown(e);
		for (var t=0; t<this.toggles.length; t++) this.toggles[t].handleKeyDown(e);
		for (var s=0; s<this.signs.length; s++) this.signs[s].handleKeyDown(e);
		if (e == cc.KEY.l) this.showToggles(true);
		
		if ((this.w == 0 && this.l == 0) && (this.getChildByTag('info') != null))
			this.removeInfo();
	},
	onKeyUp:function(e){
		if (e == cc.KEY.p) this.pause();
		this.player.handleKeyUp(e);
		for (var t=0; t<this.toggles.length; t++) this.toggles[t].handleKeyUp(e);
		for (var s=0; s<this.signs.length; s++) this.signs[s].handleKeyUp(e);
	},
});
