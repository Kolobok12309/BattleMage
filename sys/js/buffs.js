class lowDmg extends Buff {
	constructor() {
		super(3,0,'dmg',false,function(target){
			target.addHp(-10);
		});
	}
}