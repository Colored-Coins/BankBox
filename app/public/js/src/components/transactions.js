function getTransactionAssets (transaction, format) {
		if ('undefined' === typeof format)
			format = "object";

		var assetList = [];

		var totalAssets = 0;
		var inputsAdr = [];
		var transtype =  transaction.ccdata && transaction.ccdata[0] && transaction.ccdata[0].type || "N/A";

		// make a list of all the input addresses
		transaction.vin.forEach(function (input) {
			var address = input.previousOutput && input.previousOutput.addresses && input.previousOutput.addresses[0] || false;
			if (address) {
				inputsAdr.push(address);
			}
		});

		// get total assets in this transaction
		transaction.vout.forEach(function (output, i) {
			// make sure this is not change
			var address = output.scriptPubKey && output.scriptPubKey.addresses && output.scriptPubKey.addresses[0] || false;
			if (!address || inputsAdr.indexOf(address) == -1 || transtype == "issuance" ) {
				if (typeof output.assets !== 'undefined') {
					output.assets.forEach(function (asset, j) {
						totalAssets = parseFloat(totalAssets);
						totalAssets+= asset.amount / Math.pow(10, asset.divisibility);
						totalAssets = totalAssets.toFixed(asset.divisibility);
						if (format == "object")
							assetList.push({assetId: asset.assetId, tx: transaction.txid, output: i});
						if (format == "array") {
							var ret = {
								assetId: asset.assetId,
								assetName: asset.assetId,
								amount: asset.amount,
								divisibility: asset.divisibility,
								issueTxid: asset.issueTxid,
								lockStatus: asset.lockStatus,
								assetIndex: j,
								index: i,
								address: output.scriptPubKey.addresses[0],
								txid: transaction.txid,
								someUTXO: transaction.txid+":"+i
							}

							assetList.push(ret);
						}
					})
				}
			}
		});

		return ({list: assetList, totalAssets: totalAssets});
}

var Transactions = React.createClass({

	render: function() {
		var format = this.props.format || "main";
		return (
			<div id="Transactions">
				<h1 className="pageTitle">Transactions</h1>
				<InfoBox cssClass="transactions-box" style={{minHeight:"760px"}} footerLink="" footer="" footerTarget="" cssId="">
					<TransactionList state={{CCtxs: this.props.state.CCtxs}} paginatorStyle={{position:"absolute",bottom: '100px'}} />
				</InfoBox>
			</div>
		);
	}
});

var TransactionList = React.createClass({
	render: function() {
		var myself = this;
		var format = this.props.format || "main";
		var transactionFields = [];

		var transactions = this.props.state.CCtxs.sort(function (firstTransaction, secondTransaction) {
			return secondTransaction.blocktime - firstTransaction.blocktime
		}).map(function (transaction) {
			var assetsData = getTransactionAssets(transaction);

			var time = "N/A";

			if (transaction.blocktime) {
				time = moment(transaction.blocktime).format("DD.MM.YYYY HH:mm");
			}

			var txD = transaction.txid;//.substr(0, 15) + "...";

			transactionFields.push([{data: txD, link: '/#/viewTransaction/'+transaction.txid, className: "mono"}, {data: assetsData.totalAssets,  className: "text-right"}, {data: time, className: "text-right"}]);
			return (
				<Transaction transactionData={transaction} key={transaction.txid} format={format} />
			);
		});

		if (format == "main") {
			var transactionsHeader = [{val: "Transaction ID"}, {val: "Total Assets", thStyle: {width: "130px"}}, {val: "Date", thStyle: {width: "160px", textAlign: "center"}}];
			return (
				<InfoTable header={transactionsHeader} body={transactionFields} paginatorStyle={this.props.paginatorStyle} />
			);
		}
	}
});

var Transaction = React.createClass({
	render: function() {
		var myself = this;
		var format = this.props.format || "view";
		console.log('Transaction: this.props.data', this.props.data)

		var assetsData = getTransactionAssets(this.props.data);

		if (format == "view") {

			// handle dates
			var txDate = "N/A";
			var txTime = "N/A";

			if (this.props.data.blocktime) {
				txDate = moment(this.props.data.blocktime).format('YYYY.MM.DD');
				txTime = moment(this.props.data.blocktime).format('HH:mm:ss');
			}

			// handle assets
			var blockheight = "Unconfirmed";
			if (this.props.data.blockheight != "-1")
				blockheight = this.props.data.blockheight.toLocaleString();

			return (
				<div id="TransactionPage">
					<h1 className="pageTitle">Transaction</h1>
					<div className='text-m'>
						<div style={{display: 'inline-block', paddingRight: '8px'}}>txid </div>
						<div className="highlightAddress" style={{display: 'inline-block'}}>{this.props.data.txid}</div>
					</div>
					<div style={{paddingBottom: '32px', overflow: 'auto', paddingRight: '8px'}}>
						<div style={{marginBottom: '16px'}}>
							<StatBox title='Date' value={txDate} className='viewTxStatBox'/>
							<StatBox title='Time' value={txTime} className='viewTxStatBox'/>
							<StatBox title='Block' value={blockheight} className='viewTxStatBox'/>
							<StatBox title='Total Assets' value={assetsData.totalAssets.toLocaleString()} className='viewTxStatBox '/>
							<StatBox title='Confirmations' value={this.props.data.confirmations.toLocaleString()} className='viewTxStatBox'/>
						</div>
						<a href={blockExplorerUIUrl + "/tx/" + this.props.data.txid} className="btn btn-l btn-highlight" style={{float: 'right'}}>Show on block explorer</a>
					</div>
					<div style={{paddingRight: '8px'}}>
						<TXInputList data={this.props.data.vin} show="full" transId={this.props.data.txid} />
						<TXOutputList data={this.props.data.vout} show="full" transId={this.props.data.txid} />
					</div>
				</div>
			)
		}
	}
});

var TXInputList = React.createClass({
	render: function() {
		var show = this.props.show;
		var transId = this.props.transId;
		var inputs = this.props.data.map(function (input,index) {
			return (
				<TXInput obj={input} key={"txin" +index} transId={transId} show={show} from="input"/>
			);
		});
		return (
			<div className="tableWrapper" style={{marginBottom: "20px"}}>
				<table className="noBorders">
					<thead>
						<tr>
							<th width="50%" style={{height: "24px"}}>Inputs</th>
							<th width="25%" style={{height: "24px"}}>Amount</th>
							<th width="25%" style={{height: "24px"}}>Asset</th>
						</tr>
					</thead>
					{inputs}
				</table>
			</div>
		);
	}
});

var TXOutputList = React.createClass({
	render: function() {
		var show = this.props.show;
		var transId = this.props.transId;
		var outputs = this.props.data.map(function (output,index) {
			return (
				<TXOutput obj={output} transId={transId} key={"txout" +index} show={show} from="output"/>
			);
		});
		return (
			<div className="tableWrapper">
				<table className="noBorders">
					<thead>
						<tr>
							<th width="50%" style={{height: "24px"}}>Outputs</th>
							<th width="25%" style={{height: "24px"}}>Amount</th>
							<th width="25%" style={{height: "24px"}}>Asset</th>
						</tr>
					</thead>
					{outputs}
				</table>
			</div>
		);
	}
});

var toAssetsElements = function (from, assets) {
	return assets.map(function (asset, i) {
		var amount = asset.amount / Math.pow(10, asset.divisibility);
		amount = amount.toFixed(asset.divisibility);

		if (!asset.assetName) asset.assetName = asset.assetId;
		var link = "/#/viewAsset/" + asset.assetId;
		return (
			<Asset from={from} data={asset} key={from + "asset" + asset.assetId + i} format='transaction' />
		);
	});
}

var TXInput = React.createClass({
	render: function() {
		var myself = this;
		var show = this.props.show;
		if (typeof this.props.obj.coinbase !== "undefined") {
			return (
				<tr>
					<td colSpan="3">Coinsbase TX</td>
				</tr>
			);
		} else {
			var address = this.props.obj.previousOutput && this.props.obj.previousOutput.addresses && this.props.obj.previousOutput.addresses[0] || "N/A";
			var check = this.props.obj.previousOutput && this.props.obj.previousOutput.addresses && this.props.obj.previousOutput.addresses.length;

			var addressString = "N/A";
			var addressHref = "#";

			if (check == 0 && address == "N/A") {
				address = "Non Standard";
				addressString = "Non Standard";
			}

			if (address !== "N/A" && address !== "Non Standard") {
				addressHref = blockExplorerUIUrl + "/address/" + address;
				addressString = address; //.substring(0,15) + '...';
			}

			var value = (this.props.obj.previousOutput && this.props.obj.previousOutput.value) || 0;
			var assets = this.props.obj.assets
			assets.forEach(function (asset, i) {
				assets[i].index = myself.props.obj.vout;
				assets[i].txid = myself.props.obj.txid;
				assets[i].someUTXO = myself.props.obj.txid + ":" + myself.props.obj.vout;
			});

			return (
				<tbody>
					<tr>
						<td>
							<div className="ellipsis addressColumn">
								<a href={addressHref} title={addressString} target="_blank" className="mono">
									{addressString}
								</a>
							</div>
						</td>
						<td>
							<div className="ellipsis">
								{value / satoshee}
							</div>
						</td>
						<td>
							<div className="ellipsis">
								{currency}
							</div>
						</td>
					</tr>
					{toAssetsElements('input', assets)}
				</tbody>
			);
		}
	}
});

var TXOutput = React.createClass({
	render: function() {
		var myself = this;
		var show = this.props.show;
		var address = this.props.obj.scriptPubKey && this.props.obj.scriptPubKey.addresses && this.props.obj.scriptPubKey.addresses[0] || "N/A";
		var check = this.props.obj.scriptPubKey && this.props.obj.scriptPubKey.addresses && this.props.obj.scriptPubKey.addresses.length;

		var addressHref = "#";

		if (check == 0 && address == "N/A") {
			if (this.props.obj.scriptPubKey.asm.substring(0, 'OP_RETURN'.length) === 'OP_RETURN') {
				address = 'OP_RETURN';
			} else {
				address = "Non Standard";
			}
		}

		var value = this.props.obj.value || 0;

		var assets = this.props.obj.assets
		assets.forEach(function (asset, i) {
			assets[i].index = myself.props.obj.n;
			assets[i].txid = myself.props.transId;
			assets[i].someUTXO = myself.props.transId + ":" + myself.props.obj.n;
		});

		var addressLink
		if (address !== 'Non Standard' && address !== 'OP_RETURN') {
			var addressHref = blockExplorerUIUrl + "/address/" + address;
			addressLink = (
				<a href={addressHref} title={address} target="_blank" className="mono">
					{address}
				</a>
			)
		} else {
			addressLink = <div>{address}</div>
		}

		return (
			<tbody>
				<tr>
					<td>
						<div className="ellipsis addressColumn">
							{addressLink}
						</div>
					</td>
					<td>
						<div className="ellipsis">
							{value / satoshee}
						</div>
					</td>
					<td>
						<div className="ellipsis">
							{currency}
						</div>
					</td>
				</tr>
				{toAssetsElements('output', assets)}
			</tbody>
		);
	}
});
