var Router = Backbone.Router.extend({
	routes : {
		"" : "index",
		"login/:step": "login",
		"settings" : "settings",
		"transactions(/page/:page)" : "transactions",
		"newAsset(/:step)" : "newAsset",
		"reissueAsset/:assetId(/:step)" : "reissueAsset",
		"viewAsset/:assetId" : "viewAsset",
		"sendAsset/:assetId(/:step)(/:txid)" : "sendAsset",
		"receiveAsset": "receiveAsset",
		"viewTransaction/:id" : "viewTransaction",
		"*notFound" : "notFound"
	},
	index : function () {
		console.log('router.index')
		this.current = "leftDashboard";
		this.page = "index";
		this.params = {};
	},
	login: function (step) {
		console.log('router.login')
		this.current = "leftDashboard";
		this.page = "login";
		this.params = {step: step}
	},
	transactions : function(page) {
		this.current = "leftTransactions";
		this.page = "transactions";
		this.params = {paginate: page};
	},
	newAsset : function(step, template) {
		this.current = "leftAssets";
		this.page = "newAsset";
		this.params = {step: step};
	},
	reissueAsset : function(assetId, step) {
		this.current = "leftAssets";
		this.page = "reissueAsset";
		this.params = {step: step, assetId: assetId};
	},
	viewAsset : function(assetId) {
		this.current = "leftAssets";
		this.page = "viewAsset";
		this.params = {assetId: assetId};
	},
	sendAsset: function (assetId, step, txid) {
		this.current = "leftAssets";
		this.page = "sendAsset";
		this.params = {assetId: assetId, step: step, txid: txid};
	},
	receiveAsset: function () {
		this.current = "leftAssets";
		this.page = "receiveAsset";
		this.params = {};
	},
	viewTransaction : function(id) {
		this.current = "leftTransactions";
		this.page = "viewTransaction";
		this.params = {txID: id};
	},
	settings : function() {
		this.current = "leftSettings";
		this.page = "settings";
		this.params = {};
	},
	notFound : function() {
		console.log('router.notFound')
		this.current = "leftDashboard";
		this.page = "notFound";
		this.params = {};
	}
});