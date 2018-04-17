var GameServer1 = new GameServer(80,40);

var lastid = 0;//счетчик id, число указывает на следующий id
var lastSpellId = 0;
var lastBuffId = 0;

const teleport = new Spell('Teleport','all',40,function(me,target){
	me.Coords=target;
	console.log('magic');
	//nowSemiTarget=null;
},0);

const vampire = new Spell('LifeSteal','unit',30,function(me,target) {
	target.addHp(-30);
	me.addHp(30);
	//nowSemiTarget=null;
},0);
