/**
 * Created by Chamberlain on 8/14/2017.
 */


const __api = `${process.env.HTTP_TYPE}://localhost:${$$$.env.ini.PORT}/api`;
trace(__api.yellow);

const chaiG = module.exports = {
	chai: require('chai'),
	chaiHTTP: require('chai-http'),
	request: require('request-promise'),
	mongoose: require('mongoose'),
	__api: __api,
	TestUsers: {},

	sendAPI(urlEnd, method, options) {
		if(!_.isString(method) && arguments.length<3) {
			options = method;
			method = 'get';
		}

		if(!options) options = {};
		options.json = true;
		if(!options.headers) {
			options.headers = {
				'Authorization': $$$.encodeToken('sf-admin', new Date().toLocaleDateString())
			};
		}

		return chaiG.request[method](chaiG.__api + urlEnd, options)
			.then(data => {
				if(data && data.data) {
					return data.data;
				}
				return data;
			});
	},

	catcher(done) {
		return (err) => {
			chaiG.chai.assert.ifError(err);
			done();
		}
	},

	padError(err) {
		trace("      " + err);
	}
};

//Indicate to use the REST-helper methods:
chaiG.chai.use(chaiG.chaiHTTP);