/**
 * Created by Chamberlain on 8/14/2017.
 */
const chaiG = require('../sv-chai-globals');

const assert = chaiG.chai.assert;
const catcher = chaiG.catcher;
const testUsers = chaiG.testUsers;
const User = $$$.models.User;
const PRIVATE = $$$.env.ini.PRIVATE;
const sendAPI = $$$.send.api;

describe('=REST= Heroes', () => {
	var chamberlainpi, peter;

	it('INIT', done => {
		chamberlainpi = testUsers.chamberlainpi;
		peter = testUsers.peter;
		done();
	});

	it('Generate random Heroes (chamberlainpi ANOTHER FEW [5] )', done => {
		chamberlainpi.sendAuth('/hero/random/5', 'post')
			.then(data => {
				assert.exists(data);
				assert.equal(data.length>0, true);
				assert.equal(data[0].userId, chamberlainpi.id, "Hero ID == User ID");
				done();
			})
			.catch(err => done(err));

	});

	it('Generate random Heroes weapon (peter FAIL TOO MANY)', done => {
		peter = testUsers.peter;
		peter.sendAuth('/hero/random/19', 'post')
			.then(data => {
				assert.notExists(data);
				done('Should not exists!');
			})
			.catch(err => {
				assert.exists(err);
				done();
			});

	});

	it('Generate random Heroes weapon (FAIL UNAUTHORIZED)', done => {
		sendAPI('/hero/random/19', 'post')
			.then(data => {
				assert.notExists(data);
				done('Should not exists!');
			})
			.catch(err => {
				assert.exists(err);
				done();
			});

	});

	it('Add Custom Heroes (chamberlainpi)', done => {
		chamberlainpi.sendAuth('/hero/add', 'post', {
			body: {
				list: [
					{identity: 'hero_marauder', randomSeeds: {variance: 1}},
					{identity: 'hero_guardian', randomSeeds: {variance: 2}},
					{identity: 'hero_battlemage', randomSeeds: {variance: 3}},
				]
			}
		})
			.then(data => {
				assert.exists(data.newest);
				assert.equal(data.newest.length, 3);
				assert.equal(data.newest[0].userId, chamberlainpi.id, "Hero ID == User ID");
				done();
			})
			.catch(err => done(err));

	});

	it('Add Custom Heroes (chamberlainpi with showAll)', done => {
		chamberlainpi.sendAuth('/hero/add', 'post', {
			body: {
				showAll:1,
				list: [
					{identity: 'hero_marauder', randomSeeds: {variance: 4}},
					{identity: 'hero_guardian', randomSeeds: {variance: 5}},
				]
			}
		})
			.then(data => {
				assert.exists(data.oldest);
				assert.exists(data.newest);
				assert.equal(data.newest.length, 2);
				assert.equal(data.newest[0].userId, chamberlainpi.id, "newest Hero ID == User ID");
				assert.equal(data.oldest[0].userId, chamberlainpi.id, "oldest Hero ID == User ID");
				done();
			})
			.catch(err => done(err));

	});

	it('Get all heroes', done => {
		chamberlainpi.sendAuth('/hero/list', 'get')
			.then(datas => {
				assert.exists(datas);
				assert.equal(datas.length, 10);

				chamberlainpi.heroes = datas;
				done();
			})
			.catch(err => done(err));

	});

	it('Equip item to a hero (0 - 0)', done => {
		const hero0 = chamberlainpi.heroes[0];
		const item0 = chamberlainpi.items[0];

		chamberlainpi.sendAuth(`/hero/${hero0.id}/equip/${item0.id}`, 'put')
			.then(datas => {
				assert.exists(datas.item);
				assert.equal(datas.previousHeroID, 0);
				done();
			})
			.catch(err => done(err));

	});

	it('Equip item to a hero (1 - 1)', done => {
		const hero1 = chamberlainpi.heroes[1];
		const item1 = chamberlainpi.items[1];

		chamberlainpi.sendAuth(`/hero/${hero1.id}/equip/${item1.id}`, 'put')
			.then(datas => {
				assert.exists(datas.item);
				assert.equal(datas.previousHeroID, 0);
				done();
			})
			.catch(err => done(err));

	});

	it('Equip item to a hero (PASS FROM PREVIOUS HERO!)', done => {
		const hero1 = chamberlainpi.heroes[1];
		const item0 = chamberlainpi.items[0];

		chamberlainpi.sendAuth(`/hero/${hero1.id}/equip/${item0.id}`, 'put')
			.then(datas => {
				assert.exists(datas.item);
				assert.equal(datas.previousHeroID, 1);
				done();
			})
			.catch(err => done(err));
	});

	it('Equip item to a hero (FAIL with WRONG HERO ID)', done => {
		chamberlainpi.sendAuth(`/hero/9999/equip/1`, 'put')
			.then(data => {
				assert.notExists(data);
				done('Should not exists!');
			})
			.catch(err => {
				assert.exists(err);
				done();
			});
	});

	it('Equip item to a hero (FAIL with WRONG ITEM ID)', done => {
		chamberlainpi.sendAuth(`/hero/1/equip/9999`, 'put')
			.then(data => {
				assert.notExists(data);
				done('Should not exists!');
			})
			.catch(err => {
				assert.exists(err);
				done();
			});
	});

	it('Equip item to a hero (FAIL UNAUTHORIZED)', done => {
		sendAPI(`/hero/1/equip/9999`, 'put')
			.then(data => {
				assert.notExists(data);
				done('Should not exists!');
			})
			.catch(err => {
				assert.exists(err);
				done();
			});
	});

	it('Check equipped items (chamberlainpi on hero1)', done => {
		const hero1 = chamberlainpi.heroes[1];

		chamberlainpi.sendAuth(`/item/equipped-on/${hero1.id}`, 'get')
			.then(data => {
				assert.exists(data);
				assert.equal(data.length, 2);
				assert.equal(data[0].userId, chamberlainpi.id);
				assert.equal(data[0].game.heroEquipped, hero1.id);
				done();
			})
			.catch(err => done(err));
	});

	it('Check equipped items (chamberlainpi on hero 9999 [EMPTY])', done => {
		chamberlainpi.sendAuth(`/item/equipped-on/9999`, 'get')
			.then(data => {
				assert.exists(data);
				assert.equal(data.length, 0);
				done();
			})
			.catch(err => done(err));
	});

	it('Delete hero (chamberlainpi FAIL Wrong Verb)', done => {
		chamberlainpi.sendAuth(`/hero/1/remove`, 'get')
			.then(data => {
				assert.notExists(data);
				done('Should not exists!');
			})
			.catch(err => {
				assert.exists(err);
				done();
			});
	});

	it('Delete hero (chamberlainpi with hero 1)', done => {
		const hero1 = chamberlainpi.heroes[1];
		trace(chamberlainpi.id);

		chamberlainpi.sendAuth(`/hero/${hero1.id}/remove`, 'delete')
			.then(data => {
				//trace(data);
				assert.exists(data);
				assert.equal(data.heroID, 2);
				assert.equal(data.numItemsAffected, 2);

				//assert.equal(data.length, 0);
				done();
			})
			.catch(err => done(err));
	});

	it('Delete hero (chamberlainpi REMOVE ALL)', done => {
		chamberlainpi.sendAuth(`/hero/remove-all`, 'delete')
			.then(data => {
				trace(data);
				assert.exists(data);
				assert.notExists(data.heroID);
				assert.equal(data.numItemsAffected>0, true);

				//assert.equal(data.length, 0);
				done();
			})
			.catch(err => done(err));
	});
});