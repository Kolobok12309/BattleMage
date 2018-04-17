class lowDmg extends Buff {
	constructor(step=0) {
		super(3,step,'dmg',false,function(target){
			target.addHp(-10);
		});
	}

	clone() {
		return new lowDmg();
	}

	get toJSON() {
		return JSON.stringify({
			name: lowDmg,
			stats: {
				step: this.step,
			}
		});
	}
}