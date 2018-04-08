//Прикладные функции
function getId(id) {
	return document.getElementById(id);
}
function addClass(elem,classN) {
	const arr = elem.className.split(' ');
	var state = true;
	arr.forEach((obj)=>{
		if(obj==classN) state=false;
	});
	if(state) {
		arr.push(classN);
		elem.className=arr.join(' ');
	}
}
function removeClass(elem,classN) {
	const arr = elem.className.split(' ');
	arr.forEach((obj, index)=>{
		if(obj==classN) arr.splice(index,1);
	});
	elem.className=arr.join(' ');
}
function renderPole(x,y) {
	var string = `<div id="test" style="width:${x*10}px;height:${y*10}px"></div>`;
	getId('pole').innerHTML=string;
	maxX=x;
	maxY=y;
	return true;
}
function sleep(ms) {//Пример await sleep(500); в async function
	return new Promise(resolve => setTimeout(resolve, ms));
}
function genWalls() {
	for(var i = 0;i<maxX;i++) {
		new unitMaker('w',i,0);
	}
	for(var i = 1;i<maxY-1;i++) {
		new unitMaker('w',0,i);
		new unitMaker('w',maxX-1,i);
	}
	for(var i = 0;i<maxX;i++) {
		new unitMaker('w',i,maxY-1);
	}
}
function move({x:x=0,y:y=0}) {
	if(this.canMove) {
		if (x>1) x=1;
		if (y>1) y=1;
		if (x<-1) x=-1;
		if (y<-1) y=-1;
		const coords = this.getCoords();
		if((x==0&&y==0)||this.setCoords({x:coords.x+x-0,y:coords.y+y-0})) {
			this.steps++;
			checkStep();
		} else console.log('занято');
	} else {
		console.log('Цель обездвижена');
	}
}
function checkBlock({x:xx,y:yy}) {
	var state = true;
	elems.units.gamers.forEach((obj)=>{
		const coords = obj.getCoords();
		if(coords.x==xx&&coords.y==yy) {
			state=false;
		}
	});
	elems.units.others.forEach((obj)=>{
		const coords = obj.getCoords();
		if(coords.x==xx&&coords.y==yy) {
			state=false;
		}
	});
	elems.walls.forEach((obj)=>{
		const coords = obj.getCoords();
		if(coords.x==xx&&coords.y==yy) {
			state=false;
		}
	});
	return state;
}
function rand(min,max) {//включая оба предела
	return Math.floor(min+(max-min+1)*Math.random());
}
function checkStep() {
	if(vm.nowMainSelect.steps>=vm.nowMainSelect.maxSteps) {
		nextPlayer();
	}
}
function nextPlayer() {
	var state = true;
	var f;
	for(var i = 0;i<elems.units.gamers.length;i++) {
		if(elems.units.gamers[i].steps<elems.units.gamers[i].maxSteps) {
			//console.log('lvl2');
			//elems.units.gamers[i].selectThis();
			f=i;
			state=false;
			break;
		}
	}
	if(state) {
		elems.units.gamers.forEach((obj)=>{
			obj.steps=0;
		});
		vm.step++;
		//сюда функцию на баффы и дебаффы
		elems.units.gamers[0].selectThis();
	} else {
		elems.units.gamers[f].selectThis();
	}
}

//Классы

function unitMaker(x,y) {
	const self = this;
	this.id=lastid++;
	this.canMove=true;
	const block = document.createElement('div');
	block.className='unit';
	block.gameBlock=this;
	block.addEventListener('dblclick',()=>{
		self.selectThis();
	});

	block.addEventListener('click',()=>{
		if(self.id!=vm.nowMainSelect.id) self.semiSelectThis();
	});

	getId('test').appendChild(block);
	this.obj=block;

	this.semiSelectThis = function(bb) {
		if(nowSemiTarget) removeClass(nowSemiTarget.obj,'semiTarget');
		nowSemiTarget=this;
		addClass(this.obj,'semiTarget');
	}

	this.selectThis = function(bb) {
		if(vm.nowMainSelect) removeClass(vm.nowMainSelect.obj,'mainTarget');
		Vue.set(vm,'nowMainSelect',this);
		addClass(this.obj,'mainTarget');
		if(this.role=='Mage') nowPlayerIndex=elems.units.gamers.indexOf(this);
	}

	this.remove = function() {
		this.obj.remove();
		for(var i = 0;i<elems.units.length;i++) {
			if(elems.units.gamers[i].id==this.id) {
				elems.units.gamers.splice(i,1);
				break;
			}
		}
		for(var i = 0;i<elems.units.length;i++) {
			if(elems.units.others[i].id==this.id) {
				elems.units.others.splice(i,1);
				break;
			}
		}
		vm.nowMainSelect=undefined;
		getId('hid').style.display='none';
		delete this;
	}

	this.getCoords = function() {
		return {x:x,y:y};
	}

	this.setCoords = function({x:xx,y:yy}) {
		if(checkBlock({x:xx,y:yy})) {
			this.obj.style.left=`${xx*10}px`;
			this.obj.style.top=`${(maxY-yy-1)*10}px`;
			x= xx-0;
			y= yy-0;
			return true;
		} else return false;
	}

	this.setCoords({x:x,y:y});
	this.selectThis();
}

function Mage(team='default',name='default',x,y) {
	unitMaker.call(this,x,y);
	this.team=team;
	this.role='Mage';
	this.obj.style.backgroundColor='red';
	this.name=name;
	this.steps=0;
	this.stats = {
		hp: 100,
		hpMax: 100,
		hpMin: 0,
		mp: 100,
		mpMax: 100,
	}
	this.maxSteps=1;
	this.live=true;
	this.magic=elems.magic;
	nowPlayerIndex=elems.units.gamers.length;
	elems.units.gamers.push(this);

	this.addHp = function(hp) {
		if(this.live) {
			Vue.set(this.stats,'hp',this.stats.hp+hp);
			updateVue();
			//this.stats.hp+=hp;
			if(this.stats.hp>this.stats.hpMax) this.stats.hp=this.stats.hpMax;
			if(this.stats.hp<=this.stats.hpMin) {
				Vue.set(this.stats,'hp',0);
				updateVue();
				//this.hp=0;
				this.live=false;
				this.canMove=false;
			}
		} else {
			console.log('Цель мертва');
		}
	}

	this.move = move;

	this.addMp = function(mp) {
		if(this.live) {
			//this.stats.mp+=mp;
			Vue.set(this.stats,'mp',this.stats.mp+mp);
			updateVue();
			if(this.stats.mp>this.stats.mpMax) this.stats.mp=this.stats.mpMax;
			if(this.stats.mp<=0) {
				updateVue();
				Vue.set(this.stats,'mp',0);
			}
		} else {
			console.log('Цель мертва');
		}
	}

	this.preCast = function(id) {//при выборе заклинания выбираются кол-во целей итд

	}

	this.cast = function(id,target) {//сам каст
		elems.spells[id].cast(this,target);
	}

}

function Wall(x,y) {
	unitMaker.call(this,x,y);
	this.obj.style.backgroundColor='black';
	elems.walls.push(this);
}

function Spell(name,targets,manacost,callback,input=false) {
	this.id=lastSpellId++;
	this.name=name;
	this.targets=targets;
	this.manacost=manacost;
	this.input=input;
	this.cast=function(me, target=nowSemiTarget) {
		if(me.stats.mp>manacost) {
			console.log(this.manacost);
			if(this.input) inputs=getId('spellInput').value;
			callback.call(this, me, target, inputs);
			me.addMp(-manacost);
		}
		else console.log('Недостаточно маны');
	}
	elems.spells.push(this);
}

//Свойства

var maxX;
var maxY;
var elems = {
	units: {
		gamers: [],
		others: [],
	},//существа
	spells: [],//всевозможные заклинания
	walls: [],//стены
	activeMagic: [],//пущеные чары
	buffs: [],//баффы
	debuffs: [],//дебаффы
	bottles: [],//склянки/хилки возможные
	activeBottles: [],//склянки/хилки на поле

};//массив всех элементов
var lastid = 0;//счетчик id, число указывает на следующий id
var lastSpellId = 0;
var nowPlayerIndex=0;
var nowSemiTarget;


//тестовое заклинание

const teleport = new Spell('Teleport','all',40,function(me,target,inputs){
	inputs=inputs.split(' ');
	me.setCoords({x:inputs[0],y:inputs[1]});
	console.log('magic');
	//nowSemiTarget=null;
},true);

const vampire = new Spell('LifeSteal','all',30,function(me,target) {
	target.addHp(-30);
	me.addHp(30);
	//nowSemiTarget=null;
});

//Действия

renderPole(80,40);

//vue


const vm = new Vue({
	el: '#hid',
	data: {
		nowMainSelect: null,//выбранный в данный момент юнит
		spells: elems.spells,
		step: 0,
		update: false,//костыль
		spellId: '',
	},
	methods: {

	},
	computed: {

	},
});

function updateVue() {
	Vue.set(vm,'update',!vm.update);//Лютый костыль
}

Vue.component('manabar', {
	props: ['mp','mpMax','width','height'],

	template: `<div :style=style1>
					<span :style=style3>{{mp}}</span>
					<div :style=style2>
					</div>
				</div>`,
	computed: {
		style1: function() {
			return `background-color:lightblue;text-align:center;width:${this.width};height:${this.height};line-height:${this.height};`;
		},
		style2: function() {
			return `background-color:blue;width:${(this.mp!=undefined)?this.mp/this.mpMax*100+"%":"100%"};height:${this.height}`;
		},
		style3: function() {
			return `position:absolute;width:${this.width};left:0;`
		}
	}
});

Vue.component('healthbar', {
	props: ['hp','hpMax','width','height'],

	template: `<div :style=style1>
					<span :style=style3>{{hp}}</span>
					<div :style=style2>
					</div>
				</div>`,
	computed: {
		style1: function() {
			return `background-color:lightgreen;text-align:center;width:${this.width};height:${this.height};line-height:${this.height};`;
		},
		style2: function() {
			return `background-color:green;width:${(this.hp!=undefined)?this.hp/this.hpMax*100+"%":"100%"};height:${this.height}`;
		},
		style3: function() {
			return `position:absolute;width:${this.width};left:0;`
		}
	}
});


//Дзадания


async function m(N) {//отступ между границами
	var dirs = [{x:-1},{y:-1},{x:1},{y:1}];
	var m = 1;
	for(var i = 0;i<2*N-1;i++) {
		for(var j = 0;j<N-m;j++) {
			vm.nowMainSelect.move(dirs[i%4]);
			console.log(dirs[i%4]);
			await sleep(500);
		}
		if(i%4==2||(i%2==0&&i!=0)) m++;
	}
}