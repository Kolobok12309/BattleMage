class xy {
	constructor(x,y) {
		this.x=x;
		this.y=y;
	}

	equal(a) {
		return a.x===this.x&&a.y===this.y;
	}

	clone() {
		return new xy(this.x,this.y);
	}

	add(xy) {
		this.x+=xy.x;
		this.y+=xy.y;
	}
}


class unitMaker {
	constructor(x,y,gameId) {
		const self = this;
		this.gameId=gameId;
		this.x=x;
		this.y=y;
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
	constructor(team='default',name='default',x=1,y=1,gameId,stats,buffs=[]) {
		super(x,y,gameId);
		this.team=team;
		this.role='Mage';
		this.name=name;
		if(stats===undefined) {
			this.stats = {
				hp: 100,
				hpMax: 100,
				hpMin: 0,
				mp: 100,
				mpMax: 100,
				maxSteps: 1,
				live: true,
				canCast: true,
				canMove: true,
				steps: 0,
			};
		} else {
			this.stats=stats;
		}
		this.buffs=buffs;
	}

	clone() {
		return new Mage(this.team,this.name,this.x,this.y,this.gameId,{
			hp: this.stats.hp,
			hpMax: this.stats.hpMax,
			hpMin: this.stats.hpMin,
			mp: this.stats.mp,
			mpMax: this.stats.mpMax,
			maxSteps: this.stats.maxSteps,
			live: this.stats.live,
			canCast: this.stats.canCast,
			canMove: this.stats.canMove,
			steps: this.stats.steps,

		},cloneArray(this.buffs));
	}

	toJSON() {
		return JSON.stringify({
			team: this.team,
			name: this.name,
			stats: this.stats,
			x: this.x,
			y: this.y,
			buffs: this.buffs,
		});
	}

	addHp(hp) {
		if(this.stats.live) {
			this.stats.hp+=hp;
			if(this.stats.hp>this.stats.hpMax) this.stats.hp=this.stats.hpMax;
			if(this.stats.hp<=this.stats.hpMin) {
				this.stats.hp=0;
				this.stats.live=false;
				console.log('Цель мертва');
				this.stats.canMove=false;
			}
		} else {
			console.log('Цель мертва');
		}
	}

	move({x:x=0,y:y=0}) {
		if(this.stats.canMove) {
			if (x>1) x=1;
			if (y>1) y=1;
			if (x<-1) x=-1;
			if (y<-1) y=-1;
			const coords = this.Coords;
			const elem = games[this.gameId].level.getElemByCoords({x:coords.x+x-0,y:coords.y+y-0});
			if((x==0&&y==0)||(elem===false)||(elem&&elem.moveble)) {
				this.Coords=new xy((coords.x+x-0),(coords.y+y-0));
				this.stats.steps++;
				//games[this.gameId].checkStep();
			} else console.log('занято');
		} else {
			console.log('Цель обездвижена');
		}
	}

	addMp(mp) {
		if(this.stats.live) {
			//this.stats.mp+=mp;
			Vue.set(this.stats,'mp',this.stats.mp+mp);
			if(this.stats.mp>this.stats.mpMax) this.stats.mp=this.stats.mpMax;
			if(this.stats.mp<=0) {
				this.stats.mp=0;
			}
		} else {
			console.log('Цель мертва');
		}
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
	constructor(x=1,y=1,gameId) {
		super(x,y,gameId);
	}

	clone() {
		return new Wall(this.x,this.y,this.gameId);
	}

	toJSON() {
		return JSON.stringify({
			x: x,
			y: y,
		});
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
				if(targets!='units') games[gameId].nowMainTarget=null;
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
		this.state=state;
	}

	cast(target) {
		if(this.nowTick%(this.delaySteps+1)===this.delaySteps) {
			this.callback(target);
			this.nowStep++;
		}
		this.nowTick++;
	}

	toJSON() {
		return JSON.stringify({
			name: this.name,
			stats: {
				nowTick: this.nowTick,
				nowStep: this.nowStep,
			}
		});
	}
}

class Level {
	constructor(x,y,gameId,elems,step) {
		this.maxX=x;
		this.maxY=y;
		this.step=step;
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

	clone() {
		return new Level(this.maxX,this.maxY,this.gameId,{
			units: {
				gamers: cloneArray(this.elems.units.gamers),
				others: cloneArray(this.elems.units.others),
			},
			walls: cloneArray(this.elems.walls),
			activeMagic: cloneArray(this.elems.activeMagic),
			activeBottles: cloneArray(this.elems.activeBottles),
		},this.step);
	}

	cloneElems() {
		return {
			units: {
				gamers: cloneArray(this.elems.units.gamers),
				others: cloneArray(this.elems.units.others),
			},
			walls: cloneArray(this.elems.walls),
			activeMagic: cloneArray(this.elems.activeMagic),
			activeBottles: cloneArray(this.elems.activeBottles),
		}
	}

	toJSON() {
		var string = '';
		string = JSON.stringify({
			elems: this.elems,
			maxX: this.maxX,
			maxY: this.maxY,
			step: this.step,
			gameId: this.gameId,
		});
	}
}

class GameServer {
	constructor(x,y) {
		this.gameId=games.length;
		this.level=new Level(x,y,this.gameId,undefined,0);
		this.nowMainSelect=null;
		this.nowMainTarget=null;
		this.gameClients=[];
		this.magic = {
			spells: [],//всевозможные заклинания
			buffs: [],//баффы
			bottles: [],//склянки/хилки возможные
		}
		this.step=0;
		//this.nowSemiTarget=null;
		this.lastGamerId = 0;
		this.history=[];
		games.push(this);
	}

	getClient() {
		const newCl = new GameClient(this.gameId,this.level,this.magic,this.gameClients.length);
		this.gameClients.push(newCl);
		return newCl;
	}

	backup() {
		this.history.push(this.level.clone());
	}

	doAction(action) {
		var req = JSON.parse(action);
		// req = {
		// 	action: 'move',
		// 	id: 0,
		// 	args: {x:1,y:1},
		// }
		const self = this;
		switch(req.action) {
			case 'move': //Сюда вписать функцию проверки может ли быть данный ход
			this.backup();
			const oldxy = this.level.elems.units.gamers[req.id].Coords;
			this.level.elems.units.gamers[req.id].move(req.args);
			this.gameClients.forEach(function(obj){
				if(obj.nowMainSelect.x==oldxy.x&&obj.nowMainSelect.y==oldxy.y) obj.nowMainSelect.move(req.args);
				else {
					obj.takeLevel(self.level);
					obj.nowMainSelect.move(req.args);
					log(false,'ошибка с координатами')
				}
			});
			break;
		}
		this.step++;
		console.log(action);
	}

	checkStep() {
		// if(this.nowMainSelect.steps>=this.nowMainSelect.maxSteps) {
		// 	this.nextPlayer();
		// }
	}

	addSpell(name,targets,manacost,callback) {
		const newSpell = new Spell(name,targets,manacost,callback,this.gameId);
		this.magic.spells.push(newSpell);
	}

	addMage(team,name,x,y) {
		const newMage = new Mage(team,name,x,y,this.gameId);
		this.level.elems.units.gamers.push(newMage);
		//GameClient1.nowMainSelect=newMage.clone();//кинуть на клиент
		this.gameClients.forEach(function(obj){
			obj.takeMage(JSON.stringify(newMage));
		});
	}

	addWall(x,y) {
		const newW = new Wall(x,y,this.gameId);
		this.level.elems.walls.push(newW);
		this.gameClients.forEach(function(obj){
			obj.takeWall(newW.toJSON);
		});
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