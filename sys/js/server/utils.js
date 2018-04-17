function genWalls(game) {//Создание границы
	for(var i = 0;i<game.level.maxX;i++) {
		game.addWall(i,0);
	}
	for(var i = 1;i<game.level.maxY-1;i++) {
		game.addWall(0,i);
		game.addWall(game.level.maxX-1,i);
	}
	for(var i = 0;i<game.level.maxX;i++) {
		game.addWall(i,game.level.maxY-1);
	}
}

function cloneArray(arr) {
    let newArr = [];
    for (let x of arr) {
        newArr.push('clone' in x ? x.clone() : x);
    }
    return newArr;
}

function log(server,msg) {
	console.log(msg+` [${server?'SERVER':'CLIENT'}]`);
}