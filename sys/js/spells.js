const teleport = new Spell('Teleport','all',40,function(me,target,inputs){
	me.Coords=target;
	console.log('magic');
	//nowSemiTarget=null;
},false);

const vampire = new Spell('LifeSteal','unit',30,function(me,target) {
	target.addHp(-30);
	me.addHp(30);
	//nowSemiTarget=null;
});