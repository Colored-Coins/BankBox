var Dashboard = React.createClass({
	getAssetIssuancesAmount: function () {
		var assets = 0;
		var maxDiv = 0;
		this.props.state.CCtxs.forEach(function (tx) {
			tx.ccdata.forEach(function (cc) {
				if (cc.type == "issuance") {
					if (cc.divisibility > maxDiv)
						maxDiv = cc.divisibility;
					var amount = cc.amount / Math.pow(10, cc.divisibility);
					assets+= amount;
				}
			})
		});
		return assets.toFixed(maxDiv);
	},
	getAssetHolders: function () {
		// go over all transactions and look for holders
		var holders = [];
		this.props.state.CCtxs.forEach(function (tx) {
			// go over all outputs look for asset
			tx.vout.forEach(function (output) {
				if (output.assets.length) {
					output.scriptPubKey.addresses.forEach(function (holder) {
						holders.push(holder);
					})
				}
			});
		});

		var unique = ArrNoDupe(holders);
		return unique.length;
	},
	getBalance: function () {
		var financeBalance = _.sumBy(this.props.state.financeUtxos, utxo => utxo.value) || 0
		financeBalance /= 100000000
		return financeBalance
	},
	render: function() {
		var totalIssued = this.getAssetIssuancesAmount();
		var balanceTitle = 'Balance' + ' (' + currency + ')';
		var balance = this.getBalance();
		var totalFont, balanceFont = "27px";

		if (totalIssued.length > 10)
			totalFont = "19px";
		if (balance.length > 10)
			balanceFont = "19px";

		return (
			<div id="Dashboard">
				<h1 className="pageTitle">Dashboard</h1>
				<div style={{marginBottom: "32px"}}>
					<div style={{display: 'inline-block'}}>
						<div style={{display: 'inline-block', marginRight: '16px', width: '176px'}}>
							<StatBox title='Assets Created' value={totalIssued}/>
						</div>
						<div style={{display: 'inline-block', marginRight: '16px', width: '176px'}}>
							<StatBox title='Asset Holders' value={this.getAssetHolders()}/>
						</div>
						<div style={{display: 'inline-block', marginRight: '16px', width: '176px'}}>
							<StatBox title={balanceTitle} value={balance}/>
						</div>
						<div style={{display: 'inline-block', width: '176px'}}>
							<StatBox title='Total Transactions' value={this.props.state.CCtxs.length}/>
						</div>
					</div>
				</div>
				<InfoBox key="d1" title="Available Assets" footerLink="/#/newAsset" footer="Issue new asset" footerTarget="" cssId="">
					<AssetsList state={this.props.state} format="main" />
				</InfoBox>
				<InfoBox key="d2" title="Latest Transactions" footerLink="/#/transactions" footer="View all transactions" footerTarget="" cssId="">
					<TransactionList state={this.props.state} />
				</InfoBox>
			</div>
		);
	}

});