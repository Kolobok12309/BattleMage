function getId(id) {
	return document.getElementById(id);
}
var maxX;
var maxY;
var elems = [];
var blockk;
var wall;
var lastid = 0;
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
function unitMaker(role,x,y) {
	this.x=x;
	this.y=y;
	this.id=lastid++;
	this.role = role;
	const block = document.createElement('div');
	block.className='col';
	block.style.top=`${y*10}px`;
	block.style.left=`${x*10}px`;
	var color;
	switch(role) {
		case 'm': color='red';
		break;
		case 'w': color='black';
		break;
	}
	block.style.backgroundColor=color;
	block.gameBlock=this;
	block.addEventListener('click',(bb)=>{blockk=bb.target.gameBlock});
	getId('test').appendChild(block);
	this.obj=block;
	const self = this;
	this.remove = function() {
		this.obj.remove();
		for(var i = 0;i<elems.length;i++) {
			if(elems[i].id==this.id) elems.splice(i,1);
		}
		blockk = undefined;
		getId('hid').style.display='none';
	}
	this.move = function(n) {
		switch(n) {
		case 's': 
		if(checkBlock(self.x,self.y+1)) {
			self.obj.style.top=`${(self.y+1)*10}px`;
			self.y++;
		}
		break;
		case 'n': 
		if(checkBlock(self.x,self.y-1)) {
			self.obj.style.top=`${(self.y-1)*10}px`;
			self.y--;
		}
		break;
		case 'w': 
		if(checkBlock(self.x-1,self.y)) {
			self.obj.style.left=`${(self.x-1)*10}px`;
			self.x--;
		}
		break;
		case 'o': 
		if(checkBlock(self.x+1,self.y)) {
			self.obj.style.left=`${(self.x+1)*10}px`;
			self.x++;
		}
		break;
	}
	}
	elems.push(this);
}
function checkBlock(x,y) {
	var state = true;
	elems.forEach((obj, index)=>{
		if(obj.x==x&&obj.y==y) state=false;
	});
	return state;
}
function markBlock(x,y,color='red') {
	if(maxX<x||maxY<y) {
		console.error('Превышена максимальная координата');
		return;
	}
	var state = true;
	elems.forEach(function (obj, index) {
		if(obj.x==x&&obj.y==y) {
			state=false;
		}
	});
	if(!state) return false;
	var block = document.createElement('div');
	block.className='col';
	block.style.top=`${y*10}px`;
	block.style.left=`${x*10}px`;
	elems.push({x:x,y:y,elem:block});
	getId('test').appendChild(block);
	if(block.style.backgroundColor==color) {
		return false;
	} else {
		block.style.backgroundColor=color;
	}
	return block;
}
function rand(min,max) {//включая оба предела
	return Math.floor(min+(max-min+1)*Math.random());
}
function randBlockMark() {
	if(markBlock(rand(0,79),rand(0,39))!=false) {
		return true;
	} else {
		randBlockMark();//баг с веной рекурсией
	}
}
function swap(a,b) {
	var aa = a;
	var bb = b;
	aa+=' '+bb;
	bb= aa.split(' ')[0];
	aa= aa.split(' ')[1];
	console.log('a='+aa+' b='+bb);
}
renderPole(80,40);