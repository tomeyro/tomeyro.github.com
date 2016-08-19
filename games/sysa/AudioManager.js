var BgmDir = "res/bgm/";
var Bgm = [
	{id:"msc00", src:"msc00_GreenTown"},	// 0
	{id:"msc01", src:"msc01_BoringCavern"},	// 1
	{id:"msc02", src:"msc02_StarryIsland"},	// 2
	{id:"msc03", src:"msc03_CoconutLand"},	// 3
	{id:"msc04", src:"msc04_StableBoy"}		// 4
];

var SfxDir = "res/sfx/";
var Sfx = [
	{id:"act", 		src:"sfx_act"},			// 0
	{id:"destroy", 	src:"sfx_destroy"},		// 1
	{id:"finish", 	src:"sfx_finish"},		// 2
	{id:"hurt", 	src:"sfx_hurt"},		// 3
	{id:"jump", 	src:"sfx_jump"},		// 4
	{id:"pickup", 	src:"sfx_pickup"}		// 5
];

var VoicesDir = "res/voices/";

var Female = new Array();
Female[0] = [
	{id:"female_01_01",	src:"female_01_01"},	// 0
	{id:"female_01_02",	src:"female_01_02"},	// 1
	{id:"female_01_03",	src:"female_01_03"},	// 2
	{id:"female_01_04",	src:"female_01_04"},	// 3
	{id:"female_01_05",	src:"female_01_05"},	// 4
	{id:"female_01_06",	src:"female_01_06"},	// 5
	{id:"female_01_07",	src:"female_01_07"},	// 6
	{id:"female_01_08",	src:"female_01_08"},	// 7
];
Female[1] = [
	{id:"female_02_01",	src:"female_02_01"},	// 0
	{id:"female_02_02",	src:"female_02_02"},	// 1
	{id:"female_02_03",	src:"female_02_03"},	// 2
	{id:"female_02_04",	src:"female_02_04"},	// 3
];

var Male = new Array();
Male[0] = [
	{id:"male_01_01",	src:"male_01_01"},		// 0
	{id:"male_01_02",	src:"male_01_02"},		// 1
	{id:"male_01_03",	src:"male_01_03"},		// 2
	{id:"male_01_04",	src:"male_01_04"},		// 3
	{id:"male_01_05",	src:"male_01_05"},		// 4
	{id:"male_01_06",	src:"male_01_06"},		// 5
	{id:"male_01_07",	src:"male_01_07"},		// 6
	{id:"male_01_08",	src:"male_01_08"},		// 7
];
Male[1] = [
	{id:"male_02_01",	src:"male_02_01"},		// 0
	{id:"male_02_02",	src:"male_02_02"},		// 1
	{id:"male_02_03",	src:"male_02_03"},		// 2
	{id:"male_02_04",	src:"male_02_04"},		// 3
];

var AudioManager = {
	
	bgm: null,
	isPlaying: false,
	
	init: function() {
		this.attach(Bgm, BgmDir, true);
		this.attach(Sfx, SfxDir, false);
		this.attach(Female[0], VoicesDir, false);
		this.attach(Female[1], VoicesDir, false);
		this.attach(Male[0], VoicesDir, false);		
		this.attach(Male[1], VoicesDir, false);
		console.log('Audio Manager Initialized');
	},
	attach: function(list, dir, loop) {
		for (var i=0; i < list.length; i++) {
			loop = loop ? 'loop' : '';
			var audio = "<audio id='"+list[i].id+"' "+loop+">";
			audio += "<source src='"+dir+list[i].src+".mp3' type='audio/mpeg'/>";
			audio += "<source src='"+dir+list[i].src+".ogg' type='audio/ogg'/>";
			audio += "</audio>";
			document.write(audio);
		}
	},
	
	selectBgm: function(a) {
		var id = a.id || a;
		
		if (this.bgm != null) {
			if (this.bgm.id == id)
				return(0);
			else
				this.stopBgm();
		}
		
		this.bgm = document.getElementById(id);
	},
	playBgm: function(a, force) {
		if (a != null) this.selectBgm(a);
		force = force != null ? force : false;
		
		if (Number(ls.SYSA_IsBGMOn) == 0 && !force) return('BGM is Off');
		
		this.bgm.play();
		this.isPlaying = true;
		return(1);
	},	
	stopBgm: function() {
		this.bgm.pause();
		this.bgm.currentTime = 0;
		this.isPlaying = false;
		return(1);
	},
	isBgmPlaying: function() {
		return(this.isPlaying);
	},
	
	playSfx: function(a) {
		if (Number(ls.SYSA_IsSFXOn) == 0) return('SFX are Off');
		var id = a.id || a;
		var sfx = document.getElementById(id);
		sfx.currentTime = 0;
		sfx.play();
		return(1);
	},
	
	playNarration: function(a) {
		var id = a.id || a;
		var audio = document.getElementById(id);
		audio.currentTime = 0;
		audio.play();
	},
	isNarrationPlaying: function(list) {
		list = list != null ? list : new Array();
		for	(i = 0; i < list.length; i++) {
			var audio = document.getElementById(list[i].id);
			if (audio.currentTime == audio.duration) {
				audio.pause();
				audio.currentTime = 0;					
			}
			if (!audio.paused) {
				return (true);
			}
		}
		return (false);
	},
};

AudioManager.init();
