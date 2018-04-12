//Прикладные функции
function getId(id) {
	return document.getElementById(id);
}
// function renderPole(x,y) {
// 	var string = `<div id="test" style="width:${x*WIDTHBLOCK}px;height:${y*HEIGHTBLOCK}px"></div>`;
// 	getId('pole').innerHTML=string;
// 	maxX=x;
// 	maxY=y;
// 	const block = document.createElement('div');
// 	block.className='semiTarget';
// 	block.style.position='absolute';
// 	block.style.left='0px';
// 	block.style.top=`${(y-1)*HEIGHTBLOCK}px`;
// 	block.style.width=`${WIDTHBLOCK}px`;
// 	block.style.height=`${HEIGHTBLOCK}px`;
// 	block.x=0;
// 	block.y=y-1;
// 	getId('test').appendChild(block);
// 	block.addEventListener('click',()=>{
// 		if(nowSemiTarget) {
// 			const last = getUnitByCoords(nowSemiTarget);
// 			if(last) last.obj.classList.remove('semiTarget');
// 		}
// 		nowSemiTarget={x: block.x,y:block.y};
// 	});
// 	getId('test').addEventListener('mousemove',function(e){
// 		if(e.clientX+WIDTHBLOCK/2<x*WIDTHBLOCK&&e.clientY+HEIGHTBLOCK/2<y*HEIGHTBLOCK&&e.clientX-WIDTHBLOCK/2>0&&e.clientY-HEIGHTBLOCK/2>0) {
// 			var xx = Math.ceil(e.clientX/WIDTHBLOCK)-1;
// 			var yy = Math.ceil(e.clientY/HEIGHTBLOCK)-1;
// 			block.x=xx;
// 			block.y=maxY-yy-1;
// 			block.style.left=`${xx*WIDTHBLOCK}px`;
// 			block.style.top=`${yy*HEIGHTBLOCK}px`;
// 		}
// 	});
// 	return true;
// }
function sleep(ms) {//Пример await sleep(500); в async function
	return new Promise(resolve => setTimeout(resolve, ms));
}
function genWalls() {
	for(var i = 0;i<maxX;i++) {
		new Wall(i,0);
	}
	for(var i = 1;i<maxY-1;i++) {
		new Wall(0,i);
		new Wall(maxX-1,i);
	}
	for(var i = 0;i<maxX;i++) {
		new Wall(i,maxY-1);
	}
}
function rand(min,max) {//включая оба предела
	return Math.floor(min+(max-min+1)*Math.random());
}
//Классы


//Свойства

const HEIGHTBLOCK = 10;
const WIDTHBLOCK = 10;

var Game1 = new Game(80,WIDTHBLOCK,40,HEIGHTBLOCK);

var lastid = 0;//счетчик id, число указывает на следующий id
var lastSpellId = 0;
var lastBuffId = 0;

//тестовое заклинание

//баффы


//Действия

Game1.level.renderPole();

//vue


const vm = new Vue({
	el: '#hid',
	data: {
		game: Game1,
		nowMainSelect: Game1.nowMainSelect,//выбранный в данный момент юнит
		step: 0,
		update: false,//костыль
		spellId: '',
	},
	methods: {
		click: function(){alert()}
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


const teleport = new Spell('Teleport','all',40,function(me,target,inputs){
	me.Coords=target;
	console.log('magic');
	//nowSemiTarget=null;
},0);

const vampire = new Spell('LifeSteal','unit',30,function(me,target) {
	target.addHp(-30);
	me.addHp(30);
	//nowSemiTarget=null;
},0);