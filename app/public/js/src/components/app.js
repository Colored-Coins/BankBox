var App = React.createClass({
	getInitialState: function() {
		return {firstLoad: true, leftModal: {open: false, page: false}, leftNav: 'open', refreshing: false, settings: this.props.settings, notifications: [], alertsIcon: false, scanProgress: null};
	},
	componentDidMount: function () {
		var myself = this;

		// set socket listner
		var socket = io.connect();
		socket.on('version', function (data) {
			if (data != version) {
				// show version update page
				$('#versionUpdate').show();
			}
		});
	},
	componentWillMount: function() {
		var self = this

		// router
		this.callback = (function() {
			this.forceUpdate();
		}).bind(this);
		this.props.router.on('route', this.callback);

		if (this.props.router.page === 'login') {
			$('#splash').hide();
			return false;
		}

		if (!coloredcoins) {
			this.createWallet()
		}
		console.log('connecting to coloredcoins...');
		coloredcoins.on('scanProgress', function (data) {
			console.log('scanProgress', data)
			self.setState({scanProgress: data})
			$('#splash').hide();
		})
		coloredcoins.on('connect', function () {
			console.log('connected!');
			coloredcoins.onNewTransaction(function (data) {
				console.log('event', data);
				self.refreshData();
			});

			if (self.state.firstLoad) {
				self.refreshData();
			}
		})
		coloredcoins.init();
	},
	createWallet: function (settings) {
		var _settings = {
			network: network,
			fullNodeHost: fullNodeUrl,
			mnemonic: localStorage['mnemonic'],
			events: true
		}
		_.assign(_settings, settings)
		console.log('createWallet: _settings =', _settings)
		coloredcoins = new ColoredCoins(_settings);
	},
	componentWillUnmount: function() {
		this.props.router.off('route', this.callback);
	},
	showError: function (err) {
		$('#errorScreen').show();
	},
	updateUserData: function (user) {
		this.setState({user: user});
	},
	refreshData: function (topCB) {
		console.log('refreshData')
		if (this.state.refreshing) {
			console.log('already refreshing data, skipping');
			return false;
		}

		// set refreshing flag
		this.setState({refreshing: true})

		var myself = this;

		async.parallel({
			// get transactions
			CCtxs: function (callback) {
				coloredcoins.getTransactions(function (err, transactions) {
					if (err) console.error(err)

					// remove all tx that have no assets
					var ccTransactions = transactions.filter(function (tx) {
						if (tx.ccdata && tx.ccdata.length)
							return true;
						return false;
					})

					console.log('ccTransactions:', ccTransactions);
					callback(null, ccTransactions);
				})
			},
			// get assets
			utxos: function (callback) {
				coloredcoins.getUtxos(function (err, utxos) {
					if (err) console.error(err)
					console.log('utxos:', utxos);

					callback(null, utxos);
				})
			},
			addresses: function (callback) {
				coloredcoins.hdwallet.getAddresses(function (err, addresses) {
					if (err) console.error(err)
					console.log('addresses:', addresses);
					callback(null, addresses);
				})
			}
		},
		function(err, results) {
			console.log('refreshData, results =', results)
			// update State
			var alerts = myself.state.notifications;
			var icon = myself.state.alertsIcon;
			var addresses = results.addresses;
			var CCtxs = results.CCtxs;
			var issuances = coloredcoins.getIssuedAssetsFromTransactions(addresses, CCtxs);
			var assets = []
			var financeUtxos = []
			var user = (localStorage['user'] && JSON.parse(localStorage['user'])) || {}
			console.log('user', user)

			// split utxos to colored and non-colored
			results.utxos.forEach((utxo, i) => {
				if (!utxo.assets.length) {
					return financeUtxos.push(utxo)
				}
				utxo.assets.forEach(currentAsset => {
					var i = assets.findIndex(asset => asset.assetId === currentAsset.assetId)
					if (i !== -1) {
						assets[i].amount += currentAsset.amount
						assets[i].distribution.push(utxo)
					} else {
						var assetToPush = _.pick(currentAsset, ['assetId', 'amount', 'divisibility', 'lockStatus', 'aggregationPolicy'])
						assetToPush.distribution = [utxo]
						assetToPush.someUTXO = utxo.txid + ':' + utxo.index
						assets.push(assetToPush)
					}
				})
      })

			// add zero value unlocked assets to list
			for (i = 0; i < issuances.length; i++) {
				if (issuances[i].lockStatus === false && !assets.containsByProp("assetId",issuances[i].assetId)) {
					var asset = {
						assetId : issuances[i].assetId,
						distribution : [],
						amount: 0,
						divisibility: issuances[i].divisibility,
						lockStatus: false,
						someUTXO: issuances[i].txid + ':' + issuances[i].outputIndexes[0],
						assetName: ''
					}
					assets.push(asset)
				}
			}

			console.log('assets', assets)
			console.log('financeUtxos', financeUtxos)

			if (!myself.state.firstLoad) {
				// check for new txs
				if (CCtxs.length > myself.state.CCtxs.length) {
					// add an alert
					var alertLink = '/#/viewTransaction/'+CCtxs[CCtxs.length - 1].txid;
					var alertText = 'New Transaction';
					alerts.push({alertText: alertText, alertLink: alertLink, alertID: 'cc'+moment().unix()});

					icon = true;
				}

				// check for new assets
				if (assets.length > myself.state.assets.length) {
					// look for the asset that was added
					for (i = 0 ; i < assets.length ; i++) {
						asset = assets[i];
						var found = false;
						for (j = 0; j < myself.state.assets.length ; j++) {
							if (asset.assetId === myself.state.assets[j].assetId) {
								found = true
								break;
							}
						}
						if (!found) {
							// add an alert
							alerts.push({alertText: 'New Asset', alertLink: '/#/viewAsset/'+asset.assetId, alertID: 'as'+moment().unix()});
							icon = true;
						}
					}
				}
			}

		myself.setState({firstLoad: false, assets: myself.lazyAssetMeta(assets), financeUtxos: financeUtxos, issuances: issuances, refreshing: false, CCtxs: CCtxs, notifications: alerts, alertsIcon: icon, addresses: addresses, scanProgress: null, user: user});
			$('#splash').hide();
			if (topCB)
				return topCB();
		});
	},
	lazyAssetMeta: function (assets) {
		if (typeof assets === 'undefined')
			assets = this.state.assets;

		assets.forEach(function (asset) {
			coloredcoins.getAssetMetadata(asset.assetId, asset.someUTXO, false, function (err, apimeta) {
				if (err) {
					console.log('Error getting metadata', err);
					return false;
				} 

				asset.assetName = apimeta.assetName;
				asset.icon = apimeta.icon;
			});
		})
		return assets;
	},
	showModal: function (event) {
		if (this.state.leftModal.page === event.target.id && this.state.leftModal.open === 'show') {
			this.closeModal();
		} else {
			this.setState({leftModal: {page: event.target.id, open: 'show'}});
		}
	},
	closeModal: function () {
		this.setState({leftModal: {page: this.state.leftModal.page, open: ''}})
	},
	handleBodyClick: function(event) {
		if(this.state.leftModal.open && !$(event.target).closest('#leftModal').length && !$(event.target).closest('#leftNav').length) {
			this.closeModal();
		}

		if(this.state.leftModal.open && $(event.target).closest('.modalCloser').length) {
			this.closeModal();
		}

		if(!$(event.target).closest('#notifyAlerts').length && !$(event.target).closest('#leftNavToggle').length && !$(event.target).closest('#notifyButton').length) {
			$('#notifyAlerts').removeClass('visible');
			$('#notificationArrow').removeClass('visible');
		}

		if ($(event.target).closest('#leftNavToggle').length) {
			if (this.state.leftNav === 'open') {
				this.setState({leftNav: 'closed'});
			} else {
				this.setState({leftNav: 'open'});
			}
		}
	},
	getAsset: function (assetId) {
		for (i = 0; i < this.state.assets.length; i++) {
			if (this.state.assets[i].assetId === assetId)
				return this.state.assets[i];
		}

		return false;
	},
	getFinanceUtxos: function () {
		return this.state.financeUtxos
	},
	getTransaction: function (txid) {
		var txs = this.state.CCtxs;
		for (i = 0 ; i < txs.length ; i++) {
			if (txs[i].txid === txid)
				return txs[i];
		}
	},
	render: function () {
		console.log('render: this.props.router.page =', this.props.router.page)
		var leftNavWithActions = this.props.router.page !== 'login' && !this.state.scanProgress

		return (
			<div onClick={this.handleBodyClick} style={{width: '100%', height: '100%'}}>
				<Navigation current={this.props.router.current} open={this.state.leftNav} withActions={leftNavWithActions} closeModal={this.closeModal} showModal={this.showModal} />
				<LeftModal state={this.state} />
				<div id='mainContent' className={this.state.leftNav}>
					<div id='reactPage'>
						<Content router={this.props.router} getTransaction={this.getTransaction} getFinanceUtxos={this.getFinanceUtxos} getAsset={this.getAsset} updateUserData={this.updateUserData} refreshData={this.refreshData} closeModal={this.closeModal} state={this.state} createWallet={this.createWallet}/>
					</div>
				</div>
			</div>
		);
	}
});

var LeftModal = React.createClass({
	render: function () {
		console.log('LeftModel.render: this.props.state =', this.props.state)
		if (this.props.state.leftModal.page === 'leftAssets') {
			return (
				<div id='leftModal' className={'boxRight' + ' ' + this.props.state.leftModal.open + ' ' + this.props.state.leftNav}>
					<AssetsList from='nav' state={this.props.state} format='nav'/>
				</div>
			);
		}

		if (!this.props.state.leftModal.page) {
			return (
				<div id='leftModal' className='boxRight' />
			);
		}

	}
});

var Content = React.createClass({
	render: function () {
		console.log('Content.render: this.props.router.page = ', this.props.router.page, 'this.props.state = ', this.props.state)
		if (this.props.router.page === 'login') {
			return (
				<Onboarding step={this.props.router.params.step} createWallet={this.props.createWallet}/>
			)
		}

		if (this.props.router.page === 'index' && this.props.state.scanProgress) {
			return (
				<Onboarding step='scan' scanProgress={this.props.state.scanProgress}/>
			)
		}

		if (this.props.state.firstLoad) {
			return <div></div>
		}

		if (this.props.router.page === 'index' && !this.props.state.financeUtxos.length) {
			return (
				<Onboarding step='sendFunds' financeAddress={this.props.state.addresses[0]}/>
			)
		}

		if (this.props.router.page === 'index' && !this.props.state.CCtxs.length) {
			return (
				<Onboarding step='getStarted' />
			);
		}

		if (this.props.router.page === 'index' && this.props.state.CCtxs.length) {
			return (
				<Dashboard state={this.props.state} days={30} />
			);
		}

		if (this.props.router.page === 'transactions') {
			return (
				<Transactions state={this.props.state} page={this.props.router.params.paginate} />
			);
		}

		if (this.props.router.page === 'newAsset') {
			return (
				<CreateAsset refreshData={this.props.refreshData} state={this.props.state} step={this.props.router.params.step} />
			);
		}

		if (this.props.router.page === 'reissueAsset') {
			return (
				<CreateAsset refreshData={this.props.refreshData} getAsset={this.props.getAsset} state={this.props.state} step={this.props.router.params.step} reissue={this.props.router.params.assetId} />
			);
		}

		if (this.props.router.page === 'viewAsset') {
			return (
				<Asset key='viewAsset' format='view' data={this.props.getAsset(this.props.router.params.assetId)} from='app' />
			);
		}

		if (this.props.router.page === 'sendAsset') {
			return (
				<SendAsset refreshData={this.props.refreshData} data={{financeUtxos: this.props.getFinanceUtxos(), asset: this.props.getAsset(this.props.router.params.assetId)}} state={this.props.state} step={this.props.router.params.step} txid={this.props.router.params.txid} />
			);
		}

		if (this.props.router.page === 'receiveAsset') {
			return (
				<ReceiveAsset refreshData={this.props.refreshData} state={this.props.state} />
			);
		}

		if (this.props.router.page === 'viewTransaction') {
			return (
				<Transaction format='view' data={this.props.getTransaction(this.props.router.params.txID)} />
			);
		}

		if (this.props.router.page === 'settings') {
			return (
				<Settings state={this.props.state} updateUserData={this.props.updateUserData} refreshData={this.props.refreshData}/>
			);
		}

		if (this.props.router.page === 'welcome') {
			return (
				<Welcome />
			);
		}

		if (this.props.router.page === 'notFound') {
			return (
				<div id='Error404'>
					<div className='text-center' style={{margin: '100px auto', width: '570px'}}>
						<img src='/img/error.png' />
						<h2 className='successTitle'>Error</h2>
						<div className='successMsg'>
							Page was not found
						</div>
					</div>
				</div>
			);
		}

	}
});

$(document).ready(function () {
	$('#splash').show();

	// check if localStorage has mnemonic
	if (!localStorage['mnemonic']) {
		// go to login page
		window.location.href = '/#/login/chooseMethod';
	}

	// init router
	var clientRouter = new Router();
	Backbone.history.start();

	ReactDOM.render(React.createElement(App, {router: clientRouter, settings: {network: network}}), document.getElementById('appContainer'));
});