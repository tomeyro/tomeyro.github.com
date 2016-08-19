var SceneManager = {
	
	currentScene: null,
	
	Scene: cc.Scene.extend({
		ctor: function(layer) {
			this._super();			
			this.layer = layer != null ? new layer() : new TitleScene();
		},
		onEnter: function() {
			this._super();
			
			this.layer.init();
			this.addChild(this.layer);
			
			SceneManager.currentScene  = this.layer;
		},
		onExit: function() {
			this.clear();
			this.removeFromParent();
		},
		clear: function() {
			var children = this.layer.getChildren();
			for (var i = 0; i < children.length; i++)
				children[i].removeFromParent();
			this.layer.removeFromParent();
		},
	}),
	
	SetScene: function(scene) {
		cc.AnimationCache.purgeSharedAnimationCache();
		cc.SpriteFrameCache.purgeSharedSpriteFrameCache();
		
		var sceneWithTransition = cc.TransitionFade.create(1, new this.Scene(scene));
		cc.Director.getInstance().replaceScene(sceneWithTransition);
	},
	
	GetScene: function() {
		console.log(this.currentScene.id);
		return(this.currentScene);
	},
	
	LoadScene: function(scene) {
		var loadingScreen = new LoadingScreen(scene);
		
		var scale = this.currentScene.getScale() == 1 ? 0.5 : 1;
		loadingScreen.setScale(scale);
		loadingScreen.setAnchorPoint(cc.p(0,0));
		loadingScreen.setPosition(cc.p(0,0));
		
		this.currentScene.addChild(loadingScreen, this.currentScene.getChildrenCount(), 'loadingScreen');
	},
	
};
