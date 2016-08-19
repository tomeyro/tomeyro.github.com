// - GLOBAL CONSTANTS - //

var IS_BOSS = 'is_boss';

var BOSS_PLANT	= 1;
var BOSS_YETI	= 2;
var BOSS_DRAGON	= 3;
var BOSS_FROG	= 4;

var monsterFrames = new Array();
monsterFrames[0] = 5;
monsterFrames[1] = 4;
monsterFrames[2] = 4;
monsterFrames[3] = 4;

// - FINAL BOSS CLASS - //

var FinalBoss = cc.Sprite.extend({
	
	parent: null,
	world: null,
	type: null,
	
	currentStep: null,
	waitingDuration: null,
	
	targetPos: null,
	
	isMoving: null,
	isMovingUp: null,
	isMovingDown: null,
	movesCounter: null,
	vel: null,
	
	lifes: null,
	isWeak: null,
	
	isShooting: null,
	timer: null,
	bulletCounter: null,
	bulletList: null,
	
	ctor: function(parent, o) {
		this._super();
		
		this.parent = parent;
		this.world = this.parent.world;
		this.type = o.type;
		
		this.currentStep = 0;
		this.waitingDuration = 2;
		
		this.isMoving = false;
		this.isMovingUp = false;
		this.isMovingDown = false;
		this.movesCounter = 0;
		this.vel = 7.5;
		
		this.lifes = 3;
		this.isWeak = false;
		
		this.isShooting = false;
		this.timer = 0;
		this.bulletCounter = 0;
		this.bulletList = new Array();
		
		var spriteFrameCache = cc.SpriteFrameCache.getInstance();
		spriteFrameCache.addSpriteFrames(plist_MonsterPack);
		
		this.basicFrame = spriteFrameCache.getSpriteFrame("m_0"+this.type+"_01.png");
		this.sprite = cc.Sprite.createWithSpriteFrame(this.basicFrame);
	    this.sprite.setPosition(cc.PointZero());
	    
	    this.attackFrame = spriteFrameCache.getSpriteFrame("m_0"+this.type+"_10.png");	    
	    this.hurtFrame = spriteFrameCache.getSpriteFrame("m_0"+this.type+"_11.png");
	    this.finalFrame = spriteFrameCache.getSpriteFrame("m_0"+this.type+"_0"+monsterFrames[this.type-1]+".png");
	    
	    // - // create animation
        var animFrames = [];
        for (var i = 1; i <= monsterFrames[this.type-1]; i++) {
			var str = "m_0"+this.type+"_0"+i+".png";
            animFrames.push(spriteFrameCache.getSpriteFrame(str));
        }
        var animation = cc.Animation.create(animFrames, 0.15);
        // - // Add an animation to the Cache
        cc.AnimationCache.getInstance().addAnimation(animation, "moving");        
        var animCache = cc.AnimationCache.getInstance();
        var moving = animCache.getAnimation("moving");
        moving.setRestoreOriginalFrame(true);
        var action = cc.Animate.create(moving);
        
        this.animation = action;
        this.animation.setTag("moving");
	    
	    var spriteSize = this.sprite.getContentSize();	    
	    this.pos = cc.p(o.x+(spriteSize.width*0.5), o.y+(spriteSize.height*0.5));
	    this.initialPos = this.pos;
	    this.setPosition(this.pos);
	    this.spriteSize = spriteSize;
	    
	     // - // Creating the body
        // - // Body Definition
        var bodyDef = new b2BodyDef();
        bodyDef.type = b2Body.b2_kinematicBody;
		bodyDef.position.Set(this.pos.x/PTMratio,this.pos.y/PTMratio);
		bodyDef.userData = {
			type: IS_BOSS,
			sprite: this.sprite,
			isDead: false,
			object: this,
		}
		bodyDef.allowSleep = true;
		bodyDef.fixedRotation = true;
		// - // Shape definition for main fixture
		var polygonShape = new b2PolygonShape();
		polygonShape.SetAsBox((spriteSize.width/PTMratio)*0.5,(spriteSize.height/PTMratio)*0.5);
		// - // Fixture definition
		var fixtureDef = new b2FixtureDef();
		fixtureDef.shape = polygonShape;
		fixtureDef.density = 5;
        fixtureDef.friction = 1;
        fixtureDef.restitution = 1;
        fixtureDef.isSensor = false;
        // - // Create body
		this.body = this.world.CreateBody(bodyDef);
		// - // Add main fixture
		var mainFixture = this.body.CreateFixture(fixtureDef);
		mainFixture.SetUserData(IS_BOSS);
		
		this.scheduleUpdate(1/60);
	},
	
	draw: function() {
		if (this.getChildByTag('sprite') == null)
			this.addChild(this.sprite, 0, 'sprite');
	},
	
	running: false,
	update: function(dt) {
	},
	
	// -
	// Methods
	// -
	startingPos: null,
	setStartingPos: function(p) {
		this.startingPos = p;
	},
	
	setVelocity: function(xVel, yVel) {
		var body = this.body;
		var newVel = new b2Vec2(xVel, yVel);					
		body.SetAwake(true);
		body.SetLinearVelocity(newVel);
	},
	
	shoot: function(e, start, target) {
		var me = e != null ? e : this;
		
		var bulletId = "" + me.type + me.bulletList.length;
		
		var targetPos = target != null ? target : me.parent.player.pos;
		var bulletPos = start != null ? start : cc.p(me.pos.x, me.pos.y);
		var dX = (targetPos.x-bulletPos.x);
		var dY = (targetPos.y-bulletPos.y);		
		var d = Math.sqrt(Math.pow(dX,2)+Math.pow(dY,2));
		var v = 3;
		var time = d/v;		
		var vX = dX/time;
		var vY = dY/time;				
		var bulletVel = new b2Vec2(vX, vY);
		
		var aBullet = new bullet(me.parent, bulletPos, bulletVel, 4, bulletId);
		me.parent.objectsLayer.addChild(aBullet);
		me.bulletList.push(aBullet);
	},
	
	die: function() {
		this.currentStep = 0;
		
		this.parent.showEnd(true);
		for (var i = 1; i < 10; i += 2) {
			for (j = 0; j < 27; j++)
			{
				this.parent.addPoints(i);
			}			
		}
	},
	
	// -
    // Contact listener
    // -
    contactBegan:function(contact){
		var actorA = contact.GetFixtureA(),
			actorB = contact.GetFixtureB();
		if (actorA.GetUserData() == null || actorB.GetUserData() == null) return;
		if (actorA.GetBody().GetUserData().type == IS_BOSS 
			|| actorB.GetBody().GetUserData().type == IS_BOSS) {
			var b = actorA.GetBody().GetUserData().type == IS_BOSS ? actorA : actorB;
			var c = actorA.GetBody().GetUserData().type == IS_BOSS ? actorB : actorA;
			if (c.GetBody().GetUserData().type == null) return;
			if (c.GetBody().GetUserData().type == IS_EXPLOSIVE) {
				if (this.isWeak)
					this.goToStep1();
			}
		} if (actorA.GetBody().GetUserData().type == IS_BULLET
			|| actorB.GetBody().GetUserData().type == IS_BULLET) {
			for (var b=0; b<this.bulletList.length; b++) this.bulletList[b].contactBegan(contact);
		}
	},
	contactEnded:function(contact){
	},
	contactPreSolve:function(contact){
		var actorA = contact.GetFixtureA(),
			actorB = contact.GetFixtureB();
		if (actorA.GetUserData() == null || actorB.GetUserData() == null) return;
		if (actorA.GetBody().GetUserData().type == IS_BOSS 
			|| actorB.GetBody().GetUserData().type == IS_BOSS) {
			var b = actorA.GetBody().GetUserData().type == IS_BOSS ? actorA : actorB;
			var c = actorA.GetBody().GetUserData().type == IS_BOSS ? actorB : actorA;
			if (c.GetBody().GetUserData().type == null) return;
			if (c.GetBody().GetUserData().type == IS_EXPLOSIVE) {
				if (!this.isWeak)
					contact.SetEnabled(false);
			}
		}		
	},
});

// - BOSSES - //

var Boss = {};

Boss.create = function(parent, o) {
	if (o.type == BOSS_PLANT)
		return (new Boss.Plant(parent, o));
	if (o.type == BOSS_YETI)
		return (new Boss.Yeti(parent, o));
	if (o.type == BOSS_DRAGON)
		return (new Boss.Dragon(parent, o));
	if (o.type == BOSS_FROG)
		return (new Boss.Frog(parent, o));
}

// - PLANT - //

Boss.Plant = FinalBoss.extend({
		
	update: function(dt) {
		if (this.parent.paused) return;
		
		if (!this.running) {
			this.step1();
			this.running = true;
		}
		
		if (this.isMovingUp) {
			if (this.pos.y < this.parent.mapSize.height*0.5-this.spriteSize.height*(1-1/6)) {
				this.setVelocity(0,5);
			} else {
				this.setVelocity(0,0);
				this.isMovingUp = false;
				if (this.movesCounter == 5-this.lifes)
					this.step4();
				else
					this.step1();
			}
		}
		
		if (this.isMovingDown) {
			if (this.pos.y > this.parent.mapSize.height*0.5-this.spriteSize.height*2.5) {
				this.setVelocity(0,-5);
			} else {
				this.setVelocity(0,0);
				this.isMovingDown = false;
				this.step3();
			}
		}
		
		if (this.isShooting) {
			this.timer = this.timer + dt;
			
			var start = cc.p(this.pos.x-(this.spriteSize.width*(1/4)), this.pos.y+(this.spriteSize.height*(1/4)));
			var target = this.parent.player.pos;
			
			if (this.currentStep == 1) {
				if (this.timer >= this.waitingDuration) {
					this.timer = 0;
					
					var target2 = target.x > this.pos.x ? cc.p(target.x+40, target.y-40) : cc.p(target.x+40, target.y+40);
					var target3 = target.x > this.pos.x ? cc.p(target.x-40, target.y+40) : cc.p(target.x-40, target.y-40);
					this.shoot(this, start, target);
					this.shoot(this, start, target2);
					this.shoot(this, start, target3);
					
					this.bulletCounter++;
					if (this.bulletCounter == 5-this.lifes)
						this.step2();
				}
			} else {				
				if (this.timer >= 1.5) {
					this.timer = 0;
					
					this.shoot(this, start, target);
					
					this.bulletCounter++;					
					if (this.bulletCounter == 7-this.lifes)
						this.parent.showToggles(true);
				}
			}		
		}
				
		var b = this.body;
		if (b.IsAwake())
			this.pos = cc.p(b.GetPosition().x*PTMratio, b.GetPosition().y*PTMratio);
		this.setPosition(this.pos);
	},
	
	// 'PLANT STEP 1'
	step1: function(e) {
		var me = e != null ? e : this; 
		
		me.currentStep = 1;
		
		if (me.sprite.getActionByTag("moving"))
			me.sprite.stopAllActions();
		
		me.sprite.setDisplayFrame(me.attackFrame);
		me.spriteSize = me.sprite.getContentSize();
		
		me.bulletCounter = 0;
		me.isShooting = true;
	},
	
	// 'PLANT STEP 2'
	step2: function(e) {
		this.currentStep = 2;
		
		this.movesCounter++;
		
		var action = cc.RepeatForever.create(this.animation);
		action.setTag("moving");
		if (!this.sprite.getActionByTag("moving"))
			this.sprite.runAction(action);
		
		this.isShooting = false;
		this.isMovingDown = true;
	},
	
	// 'PLANT STEP 3'
	step3: function() {
		this.currentStep = 3;
		
		var random = getRandomInt(0, this.startingPos.length-1);
		var o = this.startingPos[random];
		
		if (this.movesCounter == 5-this.lifes)
			this.pos = cc.p(this.initialPos.x, this.pos.y);
		else
			this.pos = cc.p(o.x+(this.spriteSize.width*0.5), this.pos.y);
		
		var pos = cc.p(this.pos.x/PTMratio, this.pos.y/PTMratio);
		
		this.body.SetPositionAndAngle(pos, 0);
		
		this.isMovingUp = true;
	},
	
	// 'PLANT STEP 4'
	step4: function() {
		this.currentStep = 4;		
		
		this.movesCounter = 0;
		
		if (this.sprite.getActionByTag("moving"))
			this.sprite.stopAllActions();
		
		this.sprite.setDisplayFrame(this.attackFrame);
		this.spriteSize = this.sprite.getContentSize();
		
		this.bulletCounter = 0;
		this.isShooting = true;
		
		this.isWeak = true;
	},
	
	// 'PLANT GO TO STEP 1'
	goToStep1: function() {
		this.currentStep = 5;
		
		this.parent.resetLogicObjects();
		this.parent.showToggles(false);
		
		this.isWeak = false;
		this.isShooting = false;
		this.bulletCounter = 0;
		
		this.lifes--;
		this.sprite.setDisplayFrame(this.hurtFrame);
		this.spriteSize = this.sprite.getContentSize();
		
		if (this.lifes > 0) {
			this.runAction(
				cc.Sequence.create(
					cc.DelayTime.create(this.waitingDuration),
					cc.CallFunc.create(this.step1)
				)
			);
		} else
			this.die();	
	}
});

// - YETI - //

Boss.Yeti = FinalBoss.extend({
		
	update: function(dt) {		
		if (this.parent.paused) return;
		
		if (!this.running) {
			this.step1();
			this.running = true;
		}
		
		if (this.isMovingUp) {
			if (this.pos.y < this.parent.mapSize.height) {
				this.setVelocity(0,8);
			} else {
				this.setVelocity(0,0);
				this.isMovingUp = false;
				this.runAction(
					cc.Sequence.create(
						cc.DelayTime.create(this.waitingDuration),
						cc.CallFunc.create(this.step3)
					)
				);
			}
		}
		
		if (this.isMovingDown) {
			if (this.pos.y > this.initialPos.y) {
				this.setVelocity(0,-8);
			} else {
				this.setVelocity(0,0);
				this.isMovingDown = false;
				if (this.movesCounter == 5-this.lifes)
					this.step4();
				else
					this.step1();
			}
		}
		
		if (this.isShooting) {
			this.timer = this.timer + dt;
			
			var start = cc.p(this.pos.x, this.pos.y+(this.spriteSize.height*(1/8)));
			var target = this.parent.player.pos;
			
			if (this.currentStep == 1) {
				if (this.timer >= this.waitingDuration+1) {
					this.timer = 0;
					
					var target2 = target.x > this.pos.x ? cc.p(target.x+40, target.y-40) : cc.p(target.x+40, target.y+40);
					var target3 = target.x > this.pos.x ? cc.p(target.x-40, target.y+40) : cc.p(target.x-40, target.y-40);
					this.shoot(this, start, target);
					this.shoot(this, start, target2);
					this.shoot(this, start, target3);
					
					this.bulletCounter++;
					if (this.bulletCounter == 5-this.lifes)
						this.step2();
				}
			} else {				
				if (this.timer >= 1.75) {
					this.timer = 0;
					
					this.shoot(this, start, target);
					
					this.bulletCounter++;					
					if (this.bulletCounter == 7-this.lifes)
						this.parent.showToggles(true);
				}
			}		
		}
				
		var b = this.body;
		if (b.IsAwake())
			this.pos = cc.p(b.GetPosition().x*PTMratio, b.GetPosition().y*PTMratio);
		this.setPosition(this.pos);
	},
	
	// 'YETI STEP 1'
	step1: function(e) {
		var me = e != null ? e : this; 
		
		me.currentStep = 1;
		
		if (me.sprite.getActionByTag("moving"))
			me.sprite.stopAllActions();
		
		me.sprite.setDisplayFrame(me.attackFrame);
		me.spriteSize = me.sprite.getContentSize();
		
		me.bulletCounter = 0;
		me.isShooting = true;
	},
	
	// 'YETI STEP 2'
	step2: function() {
		this.currentStep = 2;
		
		this.movesCounter++;
		
		this.isShooting = false;
		this.bulletCounter = 0;
		
		this.sprite.setDisplayFrame(this.finalFrame);
		this.spriteSize = this.sprite.getContentSize();
		
		if (!this.sprite.getActionByTag("moving"))
			this.sprite.runAction(this.animation);
		
		this.isMovingUp = true;
	},
	
	// 'YETI STEP 3'
	step3: function(e) {
		var me = e != null ? e : this;
		
		me.currentStep = 3;
		
		var random = getRandomInt(0, me.startingPos.length-1);
		if (me.movesCounter == 5-me.lifes && random == 1) {
			while (random == 1) {
				random = getRandomInt(0, me.startingPos.length-1);
			}
		}	
		
		var o = me.startingPos[random];
		
		me.pos = cc.p(o.x+(me.spriteSize.width*0.5), me.pos.y);
		
		var pos = cc.p(me.pos.x/PTMratio, me.pos.y/PTMratio);
		
		me.body.SetPositionAndAngle(pos, 0);
		
		me.isMovingDown = true;
	},
	
	// 'YETI STEP 4'
	step4: function() {
		this.currentStep = 4;
		
		this.movesCounter = 0;
		
		if (this.sprite.getActionByTag("moving"))
			this.sprite.stopAllActions();
		
		this.sprite.setDisplayFrame(this.attackFrame);
		this.spriteSize = this.sprite.getContentSize();
		
		this.bulletCounter = 0;
		this.isShooting = true;
		
		this.isWeak = true;
	},
	
	// 'YETI GO TO STEP 1'
	goToStep1: function() {
		this.currentStep = 5;
		
		this.parent.resetLogicObjects();
		this.parent.showToggles(false);
		
		this.isWeak = false;
		this.isShooting = false;
		this.bulletCounter = 0;
		
		this.lifes--;
		this.sprite.setDisplayFrame(this.hurtFrame);
		this.spriteSize = this.sprite.getContentSize();
			
		if (this.lifes > 0) {
			this.runAction(
				cc.Sequence.create(
					cc.DelayTime.create(this.waitingDuration),
					cc.CallFunc.create(this.step1)
				)
			);
		} else
			this.die();	
	}
});

// - DRAGON - //

Boss.Dragon = FinalBoss.extend({
		
	update: function(dt) {
		if (this.parent.paused) return;
		
		if (!this.running) {
			this.step1();
			this.running = true;
		}		
		
		if (this.isMoving) {
			if ( (this.pos.x < this.parent.mapSize.width+this.spriteSize.width*0.5 && this.vel > 0)
				|| (this.pos.x > -this.spriteSize.width*0.5 && this.vel < 0) ) {
				
				if (this.vel < 0) this.sprite.runAction(cc.FlipX.create(true));
				else this.sprite.runAction(cc.FlipX.create(false));
				
				this.setVelocity(this.vel,0);
				
			} else {
				this.setVelocity(0,0);					
				if (this.movesCounter < 7-this.lifes) this.step1();
				else this.step3();
			}
		}
		
		if (this.isMovingUp) {
			this.sprite.runAction(cc.FlipX.create(false));
			if (this.pos.y < this.parent.mapSize.height*0.5-this.spriteSize.height*0.85) {
				this.setVelocity(0,7.5);
			} else {
				this.setVelocity(0,0);
				this.step5();
			}
		}
		
		if (this.isMovingDown) {
			this.sprite.runAction(cc.FlipX.create(false));
			if (this.pos.y > this.parent.mapSize.height*0.5-this.spriteSize.height*2) {
				this.setVelocity(0,-7.5);
			} else {
				this.setVelocity(0,0);
				this.isMovingDown = false;
				this.step1();
			}
		}
		
		if (this.isShooting) {
			this.timer = this.timer + dt;
			if (this.timer >= 1.75) {
				this.timer = 0;
				var start = cc.p(this.pos.x+(this.spriteSize.width*0.5), this.pos.y+(this.spriteSize.height*(3/8)));
				var target = this.parent.player.pos;
				this.shoot(this, start, target);
				this.bulletCounter++;					
				if (this.bulletCounter == 7-this.lifes)
					this.parent.showToggles(true);
			}				
		}
				
		var b = this.body;
		if (b.IsAwake())
			this.pos = cc.p(b.GetPosition().x*PTMratio, b.GetPosition().y*PTMratio);
		this.setPosition(this.pos);
	},
	
	// 'DRAGON STEP 1'
	step1: function() {
		this.currentStep = 1;
		
		this.isMoving = false;
		
		this.sprite.setDisplayFrame(this.basicFrame);
		this.spriteSize = this.sprite.getContentSize();
		
		var action = cc.RepeatForever.create(this.animation);
		action.setTag("moving");
		if (!this.sprite.getActionByTag("moving"))
			this.sprite.runAction(action);
		
		var random = getRandomInt(0, this.startingPos.length-1);
		var o = this.startingPos[random];
		this.pos = cc.p(o.x+(this.spriteSize.width*0.5), o.y+(this.spriteSize.height*0.5));
		if (this.pos.x <= 0+(this.spriteSize.width*0.5)) this.pos.x = this.pos.x-this.spriteSize.width;
		else this.pos.x = this.pos.x+(1*PTMratio);
		var pos = cc.p(this.pos.x/PTMratio, this.pos.y/PTMratio);
		this.body.SetPositionAndAngle(pos, 0);
		
		
		if (this.pos.x <= 0) this.vel = Math.abs(this.vel);
		else this.vel = -Math.abs(this.vel);
		
		this.runAction(
			cc.Sequence.create(
				cc.DelayTime.create(this.waitingDuration),
				cc.CallFunc.create(this.step2)
			)
		);
	},
	
	// 'DRAGON STEP 2'
	step2: function(e) {
		e.currentStep = 2;
		
		e.isMoving = true;
		e.movesCounter++;	
	},
	
	// 'DRAGON STEP 3'
	step3: function() {
		this.currentStep = 3;
		
		this.isMoving = false;
		
		if (this.sprite.getActionByTag("moving"))
			this.sprite.stopAllActions();
		
		this.sprite.setDisplayFrame(this.attackFrame);
		this.spriteSize = this.sprite.getContentSize();
		
		var angle = cc.DEGREES_TO_RADIANS(90);
		var pos = this.body.GetPosition();
		pos = cc.p(
			/* x */ (this.parent.mapSize.width*0.5)/PTMratio ,
			/* y */ (this.parent.mapSize.height*0.5-this.spriteSize.height*2)/PTMratio
			);
		this.body.SetPositionAndAngle(pos, angle);
		
		this.runAction(
			cc.Sequence.create(
				cc.DelayTime.create(this.waitingDuration),
				cc.CallFunc.create(this.step4)
			)
		);	
	},
	
	// 'DRAGON STEP 4'
	step4: function(e) {
		e.currentStep = 4;
		
		e.isMovingUp = true;
		e.movesCounter = 0;
	},
	
	// 'DRAGON STEP 5'
	step5: function() {
		this.currentStep = 5;
		
		this.isMovingUp = false;
		this.isWeak = true;		
		this.isShooting = true;	
	},
	
	// 'DRAGON GO TO STEP 1'
	goToStep1: function() {
		this.currentStep = 6;
		
		this.parent.resetLogicObjects();
		this.parent.showToggles(false);
		
		this.isWeak = false;
		this.isShooting = false;
		this.bulletCounter = 0;
		this.timer = 0;
		
		this.lifes--;
		this.sprite.setDisplayFrame(this.hurtFrame);
		this.spriteSize = this.sprite.getContentSize();
		
		if (this.lifes > 0) {
			if (this.lifes == 2) this.waitingDuration -= 2;
			if (this.lifes == 1) this.vel = Math.abs(this.vel)+4;
			this.isMovingDown = true;
		} else
			this.die();	
	}	
});

// - FROG - //

Boss.Frog = FinalBoss.extend({
		
	update: function(dt) {
		if (this.parent.paused) return;
		
		if (!this.running) {
			this.step1();
			this.running = true;
			this.waitingDuration++;
		}
		
		if (this.isMoving) {		
			this.setVelocity(this.vel, 0);
			
			if ( (this.vel < 0 && this.pos.x <= this.targetPos.x) ||
				(this.vel > 0 && this.pos.x >= this.targetPos.x) ) {
				
				this.setVelocity(0,0);
				this.isMoving = false;
				
				if (this.movesCounter == 5-this.lifes)
					this.step3();
				else
					this.step1();
			}
		}
		
		if (this.isShooting) {
			this.timer = this.timer + dt;
			
			var start = cc.p(this.pos.x, this.pos.y-(this.spriteSize.height*(1/8)));
			var target = this.parent.player.pos;
			
			if (this.currentStep == 1) {
				if (this.timer >= this.waitingDuration) {
					this.timer = 0;
					
					var target2 = cc.p(target.x+50, target.y);
					var target3 = cc.p(target.x-50, target.y);
					this.shoot(this, start, target);
					this.shoot(this, start, target2);
					this.shoot(this, start, target3);
					
					this.bulletCounter++;
					if (this.bulletCounter == 5-this.lifes)
						this.step2();
				}
			} else {				
				if (this.timer >= this.waitingDuration-0.25) {
					this.timer = 0;
					
					this.shoot(this, start, target);
					
					this.bulletCounter++;					
					if (this.bulletCounter == 7-this.lifes)
						this.parent.showToggles(true);
				}
			}		
		}
				
		var b = this.body;
		if (b.IsAwake())
			this.pos = cc.p(b.GetPosition().x*PTMratio, b.GetPosition().y*PTMratio);
		this.setPosition(this.pos);
	},
	
	// 'FROG STEP 1'
	step1: function(e) {
		var me = e != null ? e : this; 
		
		me.currentStep = 1;
		
		me.sprite.setDisplayFrame(me.basicFrame);
		me.spriteSize = me.sprite.getContentSize();
		
		var action = cc.RepeatForever.create(me.animation);
		action.setTag("moving");
		if (!me.sprite.getActionByTag("moving"))
			me.sprite.runAction(action);		
		
		me.bulletCounter = 0;
		me.isShooting = true;
	},
	
	// 'FROG STEP 2'
	step2: function() {
		this.currentStep = 2;
		
		this.movesCounter++;
		
		this.isShooting = false;
		this.bulletCounter = 0;
		
		var random = getRandomInt(0, this.startingPos.length-1);		
		var o = this.startingPos[random];		
		this.targetPos = cc.p(o.x+(this.spriteSize.width*0.5), this.pos.y);
		
		if (this.pos.x < this.targetPos.x)
			this.vel = 3.5;
		else
			this.vel = -3.5;
		
		this.isMoving = true;
	},
	
	// 'FROG STEP 3'
	step3: function(e) {
		var me = e != null ? e : this;
		
		this.currentStep = 3;
		
		this.movesCounter = 0;
		
		this.bulletCounter = 0;
		this.isShooting = true;
		
		this.isWeak = true;
	},
	
	// 'FROG GO TO STEP 1'
	goToStep1: function() {
		this.currentStep = 4;
		
		this.parent.resetLogicObjects();
		this.parent.showToggles(false);
		
		this.isWeak = false;
		this.isShooting = false;
		this.bulletCounter = 0;
		
		this.lifes--;
		if (this.sprite.getActionByTag("moving"))
			this.sprite.stopAllActions();
		this.sprite.setDisplayFrame(this.hurtFrame);
		this.spriteSize = this.sprite.getContentSize();
			
		if (this.lifes > 0) {
			this.waitingDuration -= 0.5;
			this.runAction(
				cc.Sequence.create(
					cc.DelayTime.create(this.waitingDuration),
					cc.CallFunc.create(this.step1)
				)
			);
		} else
			this.die();	
	}	
});
