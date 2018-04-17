class GameClient {
	constructor(gameId,level,magic,id) {
		this.gameId=gameId;
		this.id=id;
		this.nowMainSelect=null;
		this.level= level.clone();
		this.magic= {
			spells: cloneArray(magic.spells),
			buffs: cloneArray(magic.buffs),
			bottles: cloneArray(magic.bottles),
		}
		this.step=0;
	}

	takeMage(resp) {
		resp = JSON.parse(resp);
		const mage = new MageClient(resp.team,resp.name,resp.x,resp.y,resp.stats,resp.buffs);
		this.level.elems.units.gamers.push(mage);
		this.nowMainSelect=mage;
	}

	takeWall(wall) {
		this.level.elems.walls.push(wall);
		console.log('Добавлена стена');
	}

	takeLevel(level) {
		this.level=level.clone();
		//this.nowMainSelect=null;
		Vue.set(this,'level',new HTMLLevel(this.level,HEIGHTBLOCK,WIDTHBLOCK));
		//this.l=new HTMLLevel(this.level,HEIGHTBLOCK,WIDTHBLOCK);
	}

	move(xy) {
		//this.nowMainSelect.move(xy);
		GameServer1.doAction(JSON.stringify({
			action: 'move',
			id: 0,
			args: xy,
			nowxy: this.nowMainSelect.Coords,
		}));
		this.step++;
	}
}

class LevelClient {
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
		return new LevelClient(this.maxX,this.maxY,this.gameId,{
			units: {
				gamers: cloneArray(this.elems.units.gamers),
				others: cloneArray(this.elems.units.others),
			},
			walls: cloneArray(this.elems.walls),
			activeMagic: cloneArray(this.elems.activeMagic),
			activeBottles: cloneArray(this.elems.activeBottles),
		},this.step);
	}
}

class HTMLLevel extends LevelClient{//визуализатор
	constructor(level,WIDTH,HEIGHT) {
		super(level.maxX,level.maxY,level.gameId,level.cloneElems(),level.step);
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
			//console.log(e);
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
			if(GameClient1.nowMainTarget||getId('MainTarget')) {
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
			GameClient1.nowMainTarget=this.Coords;
		});

		cursor.addEventListener('dblclick',function(){
			const target = GameClient1.level.getElemByCoords(cursor.Coords);
			if(target) {
				GameClient1.nowMainSelect=target;
			}
		});
	}
}

class BuffClient {
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
}

class SpellClient {
	constructor(name,targets,manacost,callback) {
		this.id=GameClient1.magic.spells.length;
		this.name=name;
		this.targets=targets;
		this.manacost=manacost;
		GameClient1.magic.spells.push(this);
		this.cast=function(me, target=GameClient1.nowMainTarget) {
			if(target===null&&targets!='self') {
				console.log('Цель не выбрана');
				return;
			}
			if(me.stats.mp>=manacost) {
				if(targets=='unit') {
					target = GameClient1.level.getElemByCoords(target);
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
				if(targets!='units') GameClient1.nowMainTarget=null;
				getId('MainTarget').remove();
			}
			else console.log('Недостаточно маны');
		}
	}
}


class unitMakerClient {
	constructor(x,y) {
		const self = this;
		this.x=x;
		this.y=y;
		this.canMove=true;
	}

	remove() {
		for(var i = 0;i<GameClient1.level.elems.units.gamers.length;i++) {
			if(GameClient1.level.elems.units.gamers[i]==this) {
				GameClient1.level.elems.units.gamers.splice(i,1);
				break;
			}
		}
		for(var i = 0;i<GameClient1.level.elems.walls.length;i++) {
			if(GameClient1.level.elems.walls[i]==this) {
				GameClient1.level.elems.walls.splice(i,1);
				break;
			}
		}
		GameClient1.nowMainSelect=null;
		GameClient1.nowMainTarget=null;
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

class WallClient extends unitMakerClient {
	constructor(x=1,y=1) {
		super(x,y);
	}

	clone() {
		return new Wall(this.x,this.y);
	}
}

class MageClient extends unitMakerClient {
	constructor(team='default',name='default',x=1,y=1,stats,buffs=[]) {
		super(x,y);
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
				steps: 0,
			};
		} else {
			this.stats=stats;
		}
		this.buffs=buffs;
	}

	clone() {
		return new Mage(this.team,this.name,this.x,this.y,this.stats,cloneArray(this.buffs));
	}

	addHp(hp) {
		if(this.live) {
			this.stats.hp+=hp;
			if(this.stats.hp>this.stats.hpMax) this.stats.hp=this.stats.hpMax;
			if(this.stats.hp<=this.stats.hpMin) {
				this.hp=0;
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
			const elem = GameClient1.level.getElemByCoords({x:coords.x+x-0,y:coords.y+y-0});
			if((x==0&&y==0)||(elem===false)||(elem&&elem.moveble)) {
				this.Coords=new xy((coords.x+x-0),(coords.y+y-0));
				this.steps++;
				//games[this.gameId].checkStep();
			} else console.log('занято');
		} else {
			console.log('Цель обездвижена');
		}
	}

	addMp(mp) {
		if(this.live) {
			//this.stats.mp+=mp;
			Vue.set(this.stats,'mp',this.stats.mp+mp);
			if(this.stats.mp>this.stats.mpMax) this.stats.mp=this.stats.mpMax;
			if(this.stats.mp<=0) {
				Vue.set(this.stats,'mp',0);
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


// class xy {
// 	constructor(x,y) {
// 		this.x=x;
// 		this.y=y;
// 	}

// 	equal(a) {
// 		return a.x===this.x&&a.y===this.y;
// 	}

// 	clone() {
// 		return new xy(this.x,this.y);
// 	}

// 	add(xy) {
// 		this.x+=xy.x;
// 		this.y+=xy.y;
// 	}
// }//коммент т.к. будет второе обьявление класса(а он одинаков и на сервере и клиенте)