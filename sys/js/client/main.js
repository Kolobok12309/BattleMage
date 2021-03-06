function getId(id) {
	return document.getElementById(id);
}
function sendAjax(text='',url='/',method='POST',callback=function(xhr){console.log(xhr.responseText);}) {
	var xhr = new XMLHttpRequest();
	xhr.open(method,url,true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.onreadystatechange = function() {
		if(xhr.readyState == 4&&xhr.status==200) {
			callback(xhr);
		}
	}
	xhr.send(text);
}
function sleep(ms) {//Пример await sleep(500); в async function
	return new Promise(resolve => setTimeout(resolve, ms));
}
function rand(min,max) {//включая оба предела
	return Math.floor(min+(max-min+1)*Math.random());
}

var GameClient1 = GameServer1.getClient();
GameClient1.takeLevel(GameClient1.level);
GameClient1.level.renderPole();

const vm = new Vue({
	el: '#control',
	data: {
		game: GameClient1,
		nowMainSelect: GameClient1.nowMainSelect,//выбранный в данный момент юнит
		step: 0,
		spellId: '',
		serverStep: GameServer1.step,
	},
	methods: {
		
	},
	computed: {

	},
});

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