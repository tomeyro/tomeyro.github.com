if (localStorage.SYSA == null) {
	localStorage.SYSA = 0;
	
	localStorage.SYSA_IsBGMOn = 0;
	localStorage.SYSA_IsSFXOn = 1;
	
	localStorage.SYSA_Characters = [1, 1, 0, 0, 0];
	localStorage.SYSA_Levels = [
		[0,0,0,0],
		[0,0,0,0],
		[0,0,0,0],
		[0,0,0,0]
	];	
	localStorage.SYSA_Points = 0;
	
	localStorage.SYSA_Cinematics = [0, 0];
}

var ls = localStorage;
ls.SYSA = Number(ls.SYSA)+1;
console.log(ls);
