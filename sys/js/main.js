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
		this.setCoords({x:coords.x+x,y:coords.y+y});
	} else {
		console.log('Цель обездвижена');
	}
}
function checkBlock({x:xx,y:yy}) {
	var state = true;
	elems.units.forEach((obj)=>{
		const coords = obj.getCoords();
		if(coords.x==xx&&coords.y==yy) state=false;
	});
	elems.walls.forEach((obj)=>{
		const coords = obj.getCoords();
		if(coords.x==xx&&coords.y==yy) state=false;
	});
	return state;
}
function rand(min,max) {//включая оба предела
	return Math.floor(min+(max-min+1)*Math.random());
}

//Классы

function unitMaker(x,y) {
	const self = this;
	this.id=lastid++;
	this.canMove=true;
	const block = document.createElement('div');
	block.className='unit';
	block.style.top=`${y*10}px`;
	block.style.left=`${x*10}px`;
	block.gameBlock=this;
	block.addEventListener('dblclick',()=>{
		self.selectThis();
	});
	getId('test').appendChild(block);
	this.obj=block;

	this.selectThis = function(bb) {
		if(vm.nowMainSelect) removeClass(vm.nowMainSelect.obj,'mainTarget');
		vm.nowMainSelect=this;
		addClass(this.obj,'mainTarget');
	}

	this.remove = function() {
		this.obj.remove();
		for(var i = 0;i<elems.units.length;i++) {
			if(elems.units[i].id==this.id) elems.units.splice(i,1);
		}
		vm.nowMainSelect=undefined;
		getId('hid').style.display='none';
		delete this;
	}

	this.move = move;

	this.getCoords = function() {
		return {x:x,y:y};
	}

	this.setCoords = function({x:xx,y:yy}) {
		if(checkBlock({x:xx,y:yy})) {
			this.obj.style.left=`${xx*10}px`;
			this.obj.style.top=`${yy*10}px`;
			x=xx;
			y=yy;
		} else console.log('занято');
	}

	this.selectThis();
}

function Mage(team='default',name='default',x,y) {
	unitMaker.call(this,x,y);
	this.team=team;
	this.obj.style.backgroundColor='red';
	this.name=name;
	this.hpMax=100;
	this.mpMax=100;
	this.hpMin=0;
	this.hp=100;
	this.mp=100;
	this.live=true;
	this.magic=elems.magic;
	elems.units.push(this);

	this.addHp = function(hp) {
		if(this.live) {
			this.hp+=hp;
			if(this.hp>this.hpMax) this.hp=this.hpMax;
			if(this.hp<=this.hpMin) {
				this.hp=0;
				this.live=false;
				this.canMove=false;
			}
		} else {
			console.log('Цель мертва');
		}
	}

	this.addMp = function(mp) {
		if(this.live) {
			this.mp+=mp;
			if(this.mp>this.mpMax) this.mp=this.mpMax;
		} else {
			console.log('Цель мертва');
		}
	}

	this.cast = function(id,targets) {
		magic[id](this,targets);
	}

}

function Wall(x,y) {
	unitMaker.call(this,x,y);
	this.obj.style.backgroundColor='black';
	elems.walls.push(this);
}
//Свойства

var maxX;
var maxY;
var elems = {
	units: [],//существа
	magic: [],//всевозсожные заклинания
	walls: [],//стены
	activeMagic: [],//пущеные чары
	buffs: [],//баффы
	debuffs: [],//дебаффы
	bottles: [],//склянки/хилки возможные
	activeBottles: [],//склянки/хилки на поле

};//массив всех элементов
var lastid = 0;//счетчик id, число указывает на следующий id
var step = 0;



//Действия

renderPole(80,40);

//vue


const vm = new Vue({
	el: '#hid',
	data: {
		nowMainSelect: undefined,//выбранный в данный момент юнит
	},
	methods: {
		
	},
	computed: {

	}
});


Vue.component('bar', {
	props: ['color1','color2','num','numof','width','height'],

	template: `<div :style=style1>
					<span :style=style3>{{num}}</span>
					<div :style=style2>
					</div>
				</div>`,
	// технически, data является функцией, так что Vue
	// не будет жаловаться, но при каждом вызове эта функция
	// возвращает ссылку на один и тот же объект компонента
	computed: {
		cwidth: function() {
			return (this.num)?this.num/this.numof*100+"%":"100%";
		},
		style1: function() {
			return `background-color:${this.color1};text-align:center;width:${this.width};height:${this.height};line-height:${this.height};`;
		},
		style2: function() {
			return `background-color:${this.color2};width:${this.cwidth};height:${this.height}`;
		},
		style3: function() {
			return `position:absolute;width:${this.width};left:0;`
		}
	}
})