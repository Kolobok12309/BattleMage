class xy {
	constructor(x,y) {
		this.x=x;
		this.y=y;
	}
}


class unitMaker {
	constructor(x,y,gameId) {
		const self = this;
		this.gameId=gameId;
		this.x=x;
		this.y=y;
		this.canMove=true;
		// block.addEventListener('dblclick',()=>{
		// 	self.selectThis();
		// });

		// block.addEventListener('click',()=>{
		// 	if(vm.nowMainSelect&&self.id!=vm.nowMainSelect.id) self.semiSelectThis();
		// });
	}

	semiSelectThis() {
		if(nowSemiTarget&&getUnitByCoords(nowSemiTarget)) getUnitByCoords(nowSemiTarget).obj.classList.remove('semiTarget');
		nowSemiTarget=this.Coords;
		this.obj.classList.add('semiTarget');
	}

	remove() {
		for(var i = 0;i<games[this.gameId].level.elems.units.gamers.length;i++) {
			if(games[this.gameId].level.elems.units.gamers[i]==this) {
				games[this.gameId].level.elems.units.gamers.splice(i,1);
				break;
			}
		}
		for(var i = 0;i<games[this.gameId].level.elems.walls.length;i++) {
			if(games[this.gameId].level.elems.walls[i]==this) {
				games[this.gameId].level.elems.walls.splice(i,1);
				break;
			}
		}
		games[this.gameId].nowMainSelect=null;
		games[this.gameId].nowMainTarget=null;
		delete this;
	}

	get Coords() {
		return {x:this.x,y:this.y};
	}

	set Coords({x:xx,y:yy}) {
		this.x=xx-0;
		this.y=yy-0;
	}
}

class Mage extends unitMaker {
	constructor(team='default',name='default',x,y,gameId) {
		super(x,y,gameId);
		this.team=team;
		this.role='Mage';
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
		this.canCast=true;
		this.buffs=[];
	}

	addHp(hp) {
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
				console.log('Цель мертва');
				this.canMove=false;
			}
		} else {
			console.log('Цель мертва');
		}
	}

	move({x:x=0,y:y=0}) {
		if(this.canMove) {
			if (x>1) x=1;
			if (y>1) y=1;
			if (x<-1) x=-1;
			if (y<-1) y=-1;
			const coords = this.Coords;
			const elem = games[this.gameId].level.getElemByCoords({x:coords.x+x-0,y:coords.y+y-0});
			if((x==0&&y==0)||(!elem)||(elem&&elem.moveble)) {
				this.Coords=new xy((coords.x+x-0),(coords.y+y-0));
				this.steps++;
				games[this.gameId].checkStep();
			} else console.log('занято');
		} else {
			console.log('Цель обездвижена');
		}
	}

	addMp(mp) {
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

	preCast(id) {//при выборе заклинания выбираются кол-во целей итд

	}

	cast(id,target) {//сам каст
		games[this.gameId].magic.spells[id].cast(this,target);
	}

	addBuff(buff) {
		var state = false;
		for(var i = 0;i<this.buffs.length;i++) {
			if(this.buffs[i].name==buff.name) {
				this.buffs[i].nowTick=0;
				state = true;
				break;
			}
		}
		if(!state) this.buffs.push(buff);
	}

	delBuff(buff) {
		for(var i = 0;i<this.buffs.length;i++) {
			if(this.buffs[i].name==buff.name) {
				this.buffs.splice(i,1);
			}
		}
	}

}

class Wall extends unitMaker {
	constructor(x,y,gameId) {
		super(x,y,gameId);
	}
}

class Spell {
	constructor(name,targets,manacost,callback,gameId) {
		this.id=games[gameId].magic.spells.length;
		this.name=name;
		this.targets=targets;
		this.manacost=manacost;
		this.gameId=gameId;
		games[gameId].magic.spells.push(this);
		this.cast=function(me, target=games[gameId].nowMainTarget) {
			if(target===null&&targets!='self') {
				console.log('Цель не выбрана');
				return;
			}
			if(me.stats.mp>=manacost) {
				if(targets=='unit') {
					target = games[this.gameId].level.getElemByCoords(target);
					if(!target) {
						console.log('Цель не выбрана');
						return;
					}
				} else if(target=='self') {
					target=me;
				}
				//const inputs=getId('spellInput').value;
				callback.call(this, me, target);
				me.addMp(-manacost);
				games[gameId].nowMainTarget=null;
				getId('MainTarget').remove();
			}
			else console.log('Недостаточно маны');
		}
	}
}

class Buff {
	constructor(ticks, delaySteps, name, state, callback) {//если есть delay то первая delaySteps шагов ничего не делаеют а потом эффект
		this.name=name;
		this.nowTick=0;
		this.ticks=ticks;
		this.target=undefined;
		this.delaySteps=delaySteps;
		this.nowStep=0;
		this.callback=callback;
		this.state=(state)?'Buff':'Debuff';
	}
	cast(target) {
		if(this.nowTick%(this.delaySteps+1)===this.delaySteps) {
			this.callback(target);
			this.nowStep++;
		}
		this.nowTick++;
	}
}

class Level {
	constructor(x,y,gameId,elems) {
		this.maxX=x;
		this.maxY=y;
		this.gameId=gameId;
		if(elems===undefined) {
			this.elems= {
				units: {
					gamers: [],
					others: [],
				},//существа
				walls: [],//стены
				activeMagic: [],//пущеные чары
				activeBottles: [],//склянки/хилки на поле
			};
		} else {
			this.elems=elems;
		}
	}

	getElemByCoords(coords) {
		var result=false;
		this.elems.units.gamers.forEach(function(obj) {
			if(obj.Coords.x===coords.x&&obj.Coords.y===coords.y) result = obj;
		});
		this.elems.units.others.forEach(function(obj) {
			if(obj.Coords.x===coords.x&&obj.Coords.y===coords.y) result = obj;
		});
		this.elems.walls.forEach(function(obj) {
			if(obj.Coords.x===coords.x&&obj.Coords.y===coords.y) result = obj;
		});
		this.elems.activeMagic.forEach(function(obj) {
			if(obj.Coords.x===coords.x&&obj.Coords.y===coords.y) result = obj;
		});
		this.elems.activeBottles.forEach(function(obj) {
			if(obj.Coords.x===coords.x&&obj.Coords.y===coords.y) result = obj;
		});
		return result;
	}

}

class HTMLLevel extends Level {
	constructor(x,WIDTH,y,HEIGHT,gameId) {
		super(x,y,gameId);
		this.WIDTHBLOCK=WIDTH;
		this.HEIGHTBLOCK=HEIGHT;
	}

	renderPole() {
		const pole = document.createElement('div');
		pole.style.width=this.maxX*this.WIDTHBLOCK+'px';
		pole.style.height=this.maxY*this.HEIGHTBLOCK+'px';
		pole.style.backgroundColor='lightgray';
		getId('pole').appendChild(pole);

		const cursor = document.createElement('div');
		cursor.className='semiTarget';
		cursor.id='cursor';
		cursor.style.width=this.WIDTHBLOCK+'px';
		cursor.style.height=this.HEIGHTBLOCK+'px';
		pole.appendChild(cursor);

		pole.addEventListener('mouseover',function(){
			cursor.style.display='block';
		});

		pole.addEventListener('mouseout',function(){
			cursor.style.display='none';

		});

		var self = this;
		pole.addEventListener('mousemove',function(e){
			if(e.clientX+self.WIDTHBLOCK/2<self.maxX*self.WIDTHBLOCK&&e.clientY+self.HEIGHTBLOCK/2<self.maxY*self.HEIGHTBLOCK&&e.clientX-self.WIDTHBLOCK/2>0&&e.clientY-self.HEIGHTBLOCK/2>0) {
				var x = Math.ceil(e.clientX/self.WIDTHBLOCK)-1;
				var y = Math.ceil(e.clientY/self.HEIGHTBLOCK)-1;
				cursor.Coords={x:x,y:self.maxY-y-1};
				cursor.style.left=`${x*self.WIDTHBLOCK}px`;
				cursor.style.top=`${y*self.HEIGHTBLOCK}px`;
			}
		});

		cursor.addEventListener('click',function(){
			//console.log(cursor.Coords.x+':'+cursor.Coords.y);
			var target;
			if(games[self.gameId].nowMainTarget||getId('MainTarget')) {
				target = getId('MainTarget');
			} else {
				target = document.createElement('div');
				target.id='MainTarget';
				target.className='semiTarget';
				target.style.width=self.WIDTHBLOCK+'px';
				target.style.height=self.HEIGHTBLOCK+'px';
				pole.appendChild(target);
			}
			target.style.left=this.style.left;
			target.style.top=this.style.top;
			games[self.gameId].nowMainTarget=this.Coords;
		});

		cursor.addEventListener('dblclick',function(){
			const target = games[self.gameId].level.getElemByCoords(cursor.Coords);
			if(target) {
				games[self.gameId].nowMainSelect=target;
			}
		});
	}
}

class Game {
	constructor(x,WIDTH,y,HEIGHT) {
		this.gameId=games.length;
		this.level=new HTMLLevel(x,WIDTH,y,HEIGHT,this.gameId);
		this.nowMainSelect=null;
		this.nowMainTarget=null;
		this.magic = {
			spells: [],//всевозможные заклинания
			buffs: [],//баффы
			bottles: [],//склянки/хилки возможные
		}
		//this.nowSemiTarget=null;
		this.lastGamerId = 0;
		games.push(this);
	}

	checkStep() {
		if(this.nowMainSelect.steps>=this.nowMainSelect.maxSteps) {
			this.nextPlayer();
		}
	}

	addSpell(name,targets,manacost,callback) {
		const newSpell = new Spell(name,targets,manacost,callback,this.gameId);
		this.magic.spells.push(newSpell);
	}

	addMage(team,name,x,y) {
		const newMage = new Mage(team,name,x,y,this.gameId);
		this.level.elems.units.gamers.push(newMage);
		this.nowMainSelect=newMage;
	}

	addWall(x,y) {
		this.level.elems.walls.push(new Wall(x,y,this.gameId));
	}


	nextPlayer() {
		var state = true;
		var a;
		for(var i = 0;i<this.level.elems.units.gamers.length;i++) {
			if(this.level.elems.units.gamers[i].steps<this.level.elems.units.gamers[i].maxSteps) {
				a=i;
				state=false;
				break;
			}
		}
		if(state) {
			this.level.elems.units.gamers.forEach((obj)=>{
				obj.steps=0;
			});
			vm.step++;
			this.level.elems.units.gamers.forEach(function(obj){
				obj.buffs.forEach(function(buff) {
					if(buff.nowStep<buff.ticks) {
						buff.cast(obj);
						if(buff.nowStep===buff.ticks) obj.delBuff(buff);
					} else {
						obj.delBuff(buff);
					}
				});
			});
			//сюда функцию на баффы и дебаффы
			this.nowMainSelect=this.level.elems.units.gamers[0];
		} else {
			this.nowMainSelect=this.level.elems.units.gamers[a];
		}
	}
}

var games = [];