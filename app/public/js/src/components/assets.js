var AssetsList = React.createClass({
	getInitialState: function () {
		return {q: "", sortBy: "name", sortDir: "asc"};
	},
	doSearch: function (event) {
		this.setState({q: event.target.value});
	},
	newAsset: function () {
		// clear local storage
		delete localStorage.newAssetData;
		window.location.href = "/#/newAsset";
	},
	render: function () {
		var myself = this;
		var format = this.props.format || "main";	
		var assetsFields = [];

		var assetsData = this.props.state.assets.sort(function(a,b) {
			return (
				((a.assetName && a.assetName.toLowerCase() || "") > (b.assetName && b.assetName.toLowerCase() || "")) ? 1 : ((b.assetName && b.assetName.toLowerCase() || "") > (a.assetName && a.assetName.toLowerCase() || "")) ? -1 : 0
			);
		})

		var assets = assetsData.map(function (asset, i) {
			var amount = asset.amount / Math.pow(10, asset.divisibility);
			amount = amount.toFixed(asset.divisibility);

			if (!asset.assetName) asset.assetName = asset.assetId;
			if (asset.assetName.indexOf(myself.state.q) != -1) {
				var link = "/#/viewAsset/" + asset.assetId;
				asset.icon = asset.icon || 'http://coloredcoins.org/img/logo-new.svg'
				assetsFields.push([{data: asset.assetName, icon: asset.icon, link: link, className: "mono"}, {data: amount, className: "text-right"}, {data: asset.divisibility, className: "text-left"}]);
				return (
					<Asset from={myself.props.from} data={asset} state={myself.props.state} key={myself.props.from + "asset" + asset.assetId + i} format={format} />
				);
			}
		});

		if (format == "main") {

			var assetsHeader = [{val: "Asset Name"}, {val: "Amount", thStyle: {width: "130px", textAlign: 'right'}}, {val: "Divisibility", thStyle: {width: "160px"}}];

			return (
				<InfoTable header={assetsHeader} body={assetsFields} />
			);
		}

		if (format == "select") {
			return (
				<select id={this.props.cssId} className={this.props.cssClass} onChange={this.props.onChange} name="" value={this.props.selected}>
					{this.props.selectText ? <option>{this.props.selectText}</option> : ""}
					{assets}
				</select>
			);
		}

		if (format == "nav") {
			return (
				<div style={{padding: "10px"}}>
					<div style={{padding: "25px 0"}}>
						<input type="text" className="searchInput" placeholder="Search Assets" onChange={this.doSearch} />
					</div>
					<div className="yScroll">
						{assets}
					</div>
					<div style={{borderTop: "1px solid #96958f", fontSize: "15px", height: "80px", lineHeight: "80px", position: "absolute", bottom: "0", width: "100%", marginLeft: "-37px", padding: "16px 45px"}}>
						<div className="row">
							<div className="col-sm-6">
								<a className="modalCloser btn btn-highlight btn-l" style={{display: "block"}} onClick={this.newAsset}>Issue asset</a>
							</div>
							<div className="col-sm-6 text-right">
								<a className="modalCloser btn btn-highlight btn-l" style={{display: "block"}} href="/#/receiveAsset">Receive asset</a>
							</div>
						</div>
					</div>
				</div>
			);
		}
	}
});

var Asset = React.createClass({
	getInitialState: function () {
		return {metadata: {}};
	},
	componentDidMount: function () {
		this.getMetaData(this.props);
	},
	componentWillReceiveProps: function (nextProps) {
		if (JSON.stringify(this.props) !== JSON.stringify(nextProps))
			this.getMetaData(nextProps);
	},
	getMetaData: function (props) {
		var myself = this;
		var utxo = props.data.someUTXO;
		var full = false;
		if (props.format == "view")
			full = true;

		// get metadata
		coloredcoins.getAssetMetadata(props.data.assetId, utxo, full, function (err, apimeta) {
			if (err) {
				console.log("error: ",err);
				$("#splash").hide();
				return false;
			}

			// update state
			if (full) console.log(apimeta);

			myself.setState({metadata: apimeta});
			$("#splash").hide();
		});
	},
	splash: function () {
		$("#splash").show();
	},
	render: function () {
		var icon = this.props.data.icon || this.state.metadata.icon || 'http://coloredcoins.org/img/logo-new.svg';

		if (this.props.format == "select") {
			return (
				<option value={this.props.data.assetId} name={this.props.data.assetName} src={icon}>{this.props.data.assetName}</option>
			)
		}

		if (this.props.format == "transaction") {
			var utxo = this.props.data.someUTXO.split(":");
			var assetLink = blockExplorerUIUrl + '/asset/' + this.props.data.assetId + '/' + utxo[0] + '/' + utxo[1];
			var assetDName = (this.state.metadata.assetName && escapeHtml(this.state.metadata.assetName)) || this.props.data.assetId

			assetDName = assetDName;

			return (
				<tr>
					<td className="ellipsis addressColumn"></td>
					<td className="ellipsis addressColumn">{(this.props.data.amount / Math.pow(10,this.props.data.divisibility)).toFixed(this.props.data.divisibility).toLocaleString()}</td>
					<td className="ellipsis addressColumn">
						<a className='mono' style={{whiteSpace: "nowrap", verticalAlign: 'middle'}} href={assetLink} target="_blank">
							<img src={icon} className='assetIcon' style={{ display: "inline", float: "left"}}/>
							<div className="assetName ellipsis" title={assetDName} style={{ maxWidth: "100px", display: "inline", float: "left", verticalAlign: 'middle'}}>
								<span>
									{assetDName}
								</span>
							</div>
						</a>
					</td>
				</tr>
			)
		}

		if (this.props.format == "nav") {
			var name = this.props.data.assetName || this.props.data.assetId;
			var link = "/#/viewAsset/" + this.props.data.assetId;
			var reissue = <div className="col-sm-1 text-center"><a href={"/#/reissueAsset/" + this.props.data.assetId +"/info"}><img src="/img/icons/navigation/plus.png"/></a></div>
			if (this.props.data.lockStatus !== false || !this.props.state.issuances.containsByProp("assetId",this.props.data.assetId))
				reissue = <div className="col-sm-1 text-center"></div>
			if (name.length > 25)
				name = name.substr(0,22) + "...";

			var send = <div className="col-sm-1 text-center"><a href={"/#/sendAsset/" + this.props.data.assetId}><img src="/img/icons/navigation/paperplane.png"/></a></div>
			if (!this.props.data.amount)
				send = <div className="col-sm-1 text-center"></div>

			return (
					<div className="row navAssetRow modalCloser">
						<div className="col-sm-1 navAssetIcon"><a onClick={this.splash} href={link}><img src={icon}/></a></div>
						<div className="col-sm-6" style={{paddingLeft: "30px", fontWeight: "500"}}><a onClick={this.splash} href={link}>{name}</a></div>
						<div className="col-sm-3 text-right" style={{fontWeight: "300"}}>{(this.props.data.amount / Math.pow(10,this.props.data.divisibility)).toFixed(this.props.data.divisibility).toLocaleString()}</div>
						{send}
						{reissue}
					</div>
			);
		}

		if (this.props.format == "view") {
			var reIssue = "No";
			if (this.props.data.lockStatus === false) {
				reIssue = "Yes";
			}

			var metadata = this.state.metadata;

			var desc = metadata.metadataOfIssuence && metadata.metadataOfIssuence.data && metadata.metadataOfIssuence.data.description;

			// console.log(metadata)
			var firstBlock = metadata.firstBlock || "Loading...";
			if (firstBlock == -1) {
				firstBlock = "Unconfirmed";
			}
			var totalSupply = metadata.totalSupply || "Loading...";
			var numOfTransfers = metadata.numOfTransfers;
			if (typeof numOfTransfers == 'undefined')
				numOfTransfers = "Loading...";

			var numOfHolders = metadata.numOfHolders;
			if (typeof numOfHolders == 'undefined')
				numOfHolders = "Loading...";

			var divisibility = this.props.data.divisibility;
			var assetName = this.props.data.assetName || this.props.data.assetId;
			var utxo = this.props.data.someUTXO.split(":");
			var link = blockExplorerUIUrl + "/asset/" + this.props.data.assetId + "/" + utxo[0] + "/" + utxo[1]

			return (
				<div id="AssetPage">
					<div style={{display: 'inline-block', marginBottom: '16px'}}>
						<div className="viewAssetIcon" style={{display: 'inline-block', marginRight: '16px', verticalAlign: 'top'}}><img src={icon} style={{height: '164px', width: '164px'}} /></div>
						<div style={{display: 'inline-block', width: '594px'}}>
							<h1 className="title-l inline-block" style={{width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{assetName}</h1>
							<div style={{display: 'inline-block', width: 'calc(100% - 90px)'}}>
								<p className="text-m" style={{display: 'inline-block', marginRight: '16px'}}>
									{desc}
								</p>
								<div className='text-m'>
									<div style={{display: 'inline-block', paddingRight: '8px'}}>Asset ID </div>
									<div className="highlightAddress" style={{display: 'inline-block'}}>{this.props.data.assetId}</div>
								</div>
							</div>
							<a href={"/#/sendAsset/" + this.props.data.assetId} className="btn btn-l btn-highlight" style={{verticalAlign: 'top', float: 'right'}}>Send</a>
						</div>
					</div>
					<div style={{marginBottom: '16px'}}>
						<StatBox title='Issue Block' value={firstBlock.toLocaleString()} className='viewAssetStatBox'/>
						<StatBox title='Total Issued' value={(totalSupply / Math.pow(10,divisibility)).toFixed(divisibility).toLocaleString()} className='viewAssetStatBox'/>
						<StatBox title='Transfers' value={numOfTransfers.toLocaleString()} className='viewAssetStatBox'/>
						<StatBox title='Asset Holders' value={numOfHolders.toLocaleString()} className='viewAssetStatBox '/>
						<StatBox title='Re-Issuable' value={reIssue} className='viewAssetStatBox'/>
						<StatBox title='Divisibility' value={divisibility} className='viewAssetStatBox'/>
					</div>
					<a href={link} target="_blank" className="btn btn-l btn-highlight" style={{float: 'right'}}>Show on block explorer</a>
				</div>
			);
		}
	}
});

var AssetMetaBox = React.createClass({
	getInitialState: function () {
		return {data: this.props.data};
	},
	componentWillReceiveProps: function (nextProps) {
		if (JSON.stringify(nextProps) !== JSON.stringify(this.props))
			this.setState({data: nextProps.data});
	},
	componentDidMount: function () {
		if (!this.props.data) {
			var myself = this;
			var utxo = this.props.asset.someUTXO;
			var assetId = this.props.asset.assetId;
			var full = true;

			// console.log ("getting: ",assetId, utxo, full);
			// get metadata
			coloredcoins.getAssetMetadata(assetId, utxo, full, function (err, apimeta) {
				if (err) {
					console.log("error: ",err);
					return false;
				}

				myself.setState({data: apimeta});
			});
		}
	},
	render: function () {
		var meta = this.state.data && this.state.data.metadataOfIssuence && this.state.data.metadataOfIssuence.data || {};
		var metadata =  meta.userData && meta.userData.meta || [];

		var title = this.props.asset.assetId + " - Meta Data";

		if (this.state.data) {
			if (meta.assetName)
				title = meta.assetName + " - Meta Data";
		}
		var utxo = this.props.asset.someUTXO.split(":");
		var link = blockExplorerUIUrl + "/asset/" + this.props.asset.assetId + "/" + utxo[0] + "/" + utxo[1]

		return (
			<InfoBox title={title} icon={this.props.icon} footerLink={link} footer="Show on block explorer" footerTarget="_blank" cssId={this.props.cssId} cssClass={this.props.cssClass}>
				<MetaEditor view="1" data={metadata} />
			</InfoBox>
		);
	}
});

var CreateAsset = React.createClass({
	getInitialState: function() {
		var data = _.cloneDeep(defaultAssetTemplate.assetData);
		var loadLocal = true;

		// get data from local storage
		if (localStorage.newAssetData && loadLocal)
			data = JSON.parse(localStorage.newAssetData);
		
		localStorage.newAssetData = JSON.stringify(data);

		return {data: data, useVerify: true};
	},
	componentWillReceiveProps: function (nextProps) {
		if (nextProps.reissue && this.props.reissue !== nextProps.reissue) {
			this.loadAsset(nextProps);
		}
	},
	componentDidUpdate: function () {
		this.setValidators();
	},
	componentDidMount: function () {
		this.setValidators();
		if (this.props.reissue)
			this.loadAsset(this.props);
	},
	setValidators: function () {
		$("form").validator().on('submit', function (e) {
			if (e.isDefaultPrevented()) {
				if ($(".has-error").first().get(0))
					$(".has-error").first().get(0).scrollIntoView();
				return false;
			} else {
				window.location.href = e.target.dataset.next;
				return false;
			}
		})
	},
	loadAsset: function (props) {
		$("#splash").show();
		var myself = this;
		// get the asset
		var asset = props.getAsset(props.reissue);
		coloredcoins.getAssetMetadata(asset.assetId, asset.someUTXO, true, function (err, apimeta) {
			if (err) {
				console.log("error: ",err);
				$("#splash").hide();
				return false;
			}

			// update state
			var data = apimeta.metadataOfIssuence.data;
			data.divisibility = apimeta.divisibility;
			console.log(data);
			myself.setState({data: data, issueAddress: apimeta.issueAddress});
			$("#splash").hide();
		});
	},
	updateField: function (event) {
		var value = event.target.value;

		if ($(event.target).attr('type') == 'checkbox') {
			value =  $(event.target).prop('checked') ? true : false;
		}

		// update field value
		var newData = this.state.data;
		newData[event.target.id] = value;

		// save it in local storage
		localStorage.newAssetData = JSON.stringify(newData);

		// update state
		this.setState({data: newData});
	},
	updateMetaFields: function (fields) {
		var newData = this.state.data;
		newData.userData.meta = fields;

		localStorage.newAssetData = JSON.stringify(newData);
		this.setState({data: newData})
	},
	toggleVerifications: function () {
		if (this.state.useVerify)
			this.setState({useVerify: false});
		else
			this.setState({useVerify: true});
	},
	updateIcon: function (icon) {
		icon = icon || defaultAssetTemplate.assetData.urls.find(url => url.name === 'icon')
		var newData = this.state.data;
		var found = false;

		// look for an existing icon
		for (i = 0 ; i < newData.urls.length ; i++) {
			if (newData.urls[i].name == "icon") {
				found = true;
				newData.urls[i] = icon;
				break;
			}
		}

		if (!found)
			newData.urls.push(icon);

		localStorage.newAssetData = JSON.stringify(newData);
		this.setState({data: newData})
	},
	createAsset: function () {
		var myself = this;
		var reissueable = this.state.data.reissueable || false;
		var data = $.extend(true,{},this.state.data);

		data.issuer = this.props.state.user && this.props.state.user.user_company;

		delete data.assetAmount;
		delete data.divisibility;
		delete data.reissueable;

		if (this.state.useVerify)
			data.verifications = this.props.state.user && this.props.state.user.verifications;

		var divisibility = this.state.data.divisibility || 0;
		var totalAmount = this.state.data.assetAmount * Math.pow(10, divisibility);

		console.log('this.state', this.state)
		console.log('this.props.state', this.props.state)

		var args = {
			fee: fee,
			amount: totalAmount,
			divisibility: divisibility,
			reissueable: reissueable,
			metadata: data
		}

		if (this.props.reissue) {
			// TODO - popup error when issueAddress does not have any non-colored UTXOs
			args.issueAddress = this.state.issueAddress;
			args.reissueable = true;
		} else {
			// choose issue address with at least one non-colored UTXO
			var financeUtxo = this.props.state.financeUtxos && this.props.state.financeUtxos[0]
			// if no finance UTXO - will necessarily fail. Leave error description for the SDK for now
			args.issueAddress = (financeUtxo && financeUtxo.scriptPubKey.addresses[0]) || this.props.state.addresses[0]
		}

		console.log(args);

		// show splash
		$("#splash").show();
		coloredcoins.issueAsset(args, function (err, ans) {
			$("#splash").hide();
			console.log('ans', ans)
			if (err) {
				var error = "General Error";

				console.log("error:", err);

				myself.setState({error: err, issueAddress: args.issueAddress});
				if (myself.props.reissue) {
					window.location.href = "/#/reissueAsset/"+ myself.props.reissue + "/failed";
				} else {
					window.location.href = "/#/newAsset/failed";
				}
			}
			else {
				localStorage.IssueAssetId = ans.assetId;
				localStorage.IssueAssetTx = ans.txid;
				localStorage.IssueAssetAddress = ans.issueAddress;
				localStorage.IssueAssetIndex = ans.coloredOutputIndexes[0];

				// force data refresh
				console.log('refreshing data...')
				myself.props.refreshData();

				// goto success page
				if (myself.props.reissue)
					window.location.href = "/#/reissueAsset/"+ myself.props.reissue + "/success";
				else {
					window.location.href = "/#/newAsset/success";
				}
			}
		});
	},
	render: function() {
		var domain = this.props.state.user && this.props.state.user.verifications && this.props.state.user.verifications.domain && this.props.state.user.verifications.domain.url || "";
		var social = this.props.state.user && this.props.state.user.verifications && this.props.state.user.verifications.social || {};
		var twitter = social.twitter && social.twitter.username || "";
		var facebook = social.facebook && social.facebook.page_id || "";
		var git = social.github && social.github.gist_id || "";

		var step = this.props.step || 'info'

		if (step == "info") {
			// look for an icon
			var icon = false;
			if (this.state.data.urls && this.state.data.urls.length) {
				icon = getMetaIcon(this.state.data.urls);
			}

			var reissueable = <input type="checkbox" className="form-control" id="reissueable" onChange={this.updateField} value="1" checked={this.state.data.reissueable} />
			if (this.props.reissue)
				reissueable = <input type="checkbox" readOnly={true} className="form-control" id="reissueable" value="1" checked={true} />

			var divisibility
			if (this.props.reissue) {
				divisibility = <input type="number" readOnly={true} className="form-control" id="divisibility" value={this.state.data.divisibility} />
			} else {
				divisibility = (
					<select className="form-control" id="divisibility" onChange={this.updateField} value={this.state.data.divisibility}>
						<option value="0">0</option>
						<option value="1">1</option>
						<option value="2">2</option>
						<option value="3">3</option>
						<option value="4">4</option>
						<option value="5">5</option>
						<option value="6">6</option>
						<option value="7">7</option>
					</select>
				)
			}

			var next = "/#/newAsset/verifications";
			if (this.props.reissue)
				next = "/#/reissueAsset/"+ this.props.reissue + "/verifications";

			return (
				<div id="CreateAsset">
				<form id="createAssetDataForm" data-toggle="validator" data-next={next}>
					<h1 className="pageTitle">{this.props.reissue ? "Re-Issue" : "Create"} Asset <span className="small step">step 1: asset info</span></h1>
					<p>Please fill out the form to issue the asset:</p>
					<div style={{marginBottom: "30px", padding: "30px 0", width: "350px"}}>
						<div className="form-group">
							<label htmlFor='assetName'>Asset Name</label>
							<input type="text" className="form-control" id="assetName" onChange={this.updateField} value={this.state.data.assetName} />
							<div className="help-block with-errors" />
						</div>
						<div className="form-group">								
							<div style={{float: "left"}}>
								{reissueable}
								<div className="help-block with-errors" />
							</div>
							<label htmlFor='reissueable' style={{marginLeft:"10px", marginTop:"5px"}}>Asset Re-Issuable?</label>
							<a role="button" data-toggle="collapse" style={{paddingLeft: "10px", float: "right", marginTop:"5px"}} href="#collapseReissue" aria-expanded="false" aria-controls="collapseReissue"><img src="/img/icons/info.png" /></a>
						</div>
						<div id="collapseReissue" className="verExp collapse" >
							<h3 className="verTitle">Re-Issuable Assets</h3>
							Re-Issuable assets (or <a href="https://github.com/Colored-Coins/Colored-Coins-Protocol-Specification/wiki/Benefits#unlocked-assets" target="_blank" style={{color: 'blue'}}>Unlocked Assets</a>) are not limited by the initial issuance amount. The issuer (or whomever holds the private key to the issuance address) can keep issuing more units of the asset.
								<a href="https://github.com/Colored-Coins/Colored-Coins-Protocol-Specification/wiki/Asset%20ID#unlocked" target="_blank" style={{float: "right", color: 'gray', paddingRight:'10px'}}>learn more...</a>									 
						</div>							
						<div className="form-group">
							<label htmlFor='assetAmount'>Issue Amount</label>
							<input type="number" className="form-control" id="assetAmount" onChange={this.updateField} value={this.state.data.assetAmount} required={true} />
							<div className="help-block with-errors" />
						</div>
						<div className="form-group">
							<label htmlFor='divisibility'>Asset Divisibility</label>
							<a role="button" data-toggle="collapse" style={{paddingLeft: "10px", float: "right"}} href="#collapseDivisibility" aria-expanded="false" aria-controls="collapseDivisibility"><img src="/img/icons/info.png" /></a>								
							<div style={{marginTop:"5px"}}>
								{divisibility}
							</div>
							<div id="collapseDivisibility" className="verExp collapse" >
								<h3 className="verTitle">Asset Divisibility</h3>
								Asset divisibility is an integer in the range <b>0..7</b> designating the number of decimal points each unit of the asset can be divided into. An asset of divisibility <b>0</b> can only be sent in integral units. An asset of divisibility <b>2</b> can be sent in fractional units of up to two decimal places (e.g. <b>1.23</b>) etc.	
									<a href="https://github.com/Colored-Coins/Colored-Coins-Protocol-Specification/wiki/Coloring%20Scheme#asset-divisibility" style={{float: "right", color:'gray',paddingRight:'10px'}} target="_blank">learn more...</a>									 
							</div>
						</div>					
						<div className="form-group">
							<label htmlFor='description' style={{marginTop:"15px"}}>Asset Description</label>
							<textarea id="description" style={{height: "150px"}} className="form-control" onChange={this.updateField} value={this.state.data.description}/>
						</div>
						<div className="form-group">
							<label htmlFor='CreateAssetImg'>Asset Image</label>
							<FileUploader data={icon} callback={this.updateIcon} cssId="CreateAssetImg" zoneHeight="180" zoneWidth="180" imageHeight="180" imageWidth="180" hoverHeight="31%" allowed="image/*" />
						</div>
						<button className="btn btn-highlight btn-l form-btn-group" type="submit">Next</button>
					</div>
				</form>
				</div>
			);
		}

		if (step == "verifications") {
			var verifications = this.props.state.user && this.props.state.user.verifications
			var back = "/#/newAsset/info";
			if (this.props.reissue)
				back = "/#/reissueAsset/"+ this.props.reissue + "/info";
			var current_domain = verifications && verifications.domain  && verifications.domain.url || 'NOT SET'
			var current_twitter = verifications && verifications.social  && verifications.social.twitter && verifications.social.twitter.username || 'NOT SET'
			var current_github = verifications && verifications.social  && verifications.social.github && verifications.social.github.gist_id || 'NOT SET'
			var current_facebook = verifications && verifications.social  && verifications.social.facebook && verifications.social.facebook.page_id || 'NOT SET'
			return (
				<div id="CreateAsset">
					<h1 className="pageTitle">{this.props.reissue ? "Re-Issue" : "Create"} Asset <span className="small step">step 2: issuer verifications</span></h1>
						<div style={{width: "550px"}}>
							<a href="https://github.com/Colored-Coins/Colored-Coins-Protocol-Specification/wiki/Benefits#issuer-verification-capabilities" target="_blank" style={{color: 'blue'}}>Issuer Verifications</a> link your assets to your real world identity by using one of the following methods:
								<ol>
									<li>Placing a file on an <b>SSL certified</b> server
											<a role="button" data-toggle="collapse" style={{paddingLeft: "10px"}} href="#collapseDomain" aria-expanded="false" aria-controls="collapseDomain"><img src="/img/icons/info.png" />
											</a>
										<div id="collapseDomain" className="verExp collapse" >
											<h3 className="verTitle">Asset verification by placing a file behind https</h3>
											If you own a server with a valid SSL certificate you can vouch for your assets by listing them in a text file located on your server.<br/>
											Place a text file on your server and add the full https url (E.g. <a href="https://www.colu.co/assets.txt" target="_blank" style={{color: 'blue'}}>https://www.colu.co/assets.txt</a>) into your <a href="/#/settings" target="_blank" style={{color: 'blue'}}>Verification Settings</a> section. The url of your assets file will be included in the asset metadata.<br/>
											<p className="verLine">
												The current value is <a href={(current_domain=='NOT SET') ? '/#/settings':current_domain} target="_blank" style={{color: 'blue'}}>{current_domain}</a>
											</p>
											For each new asset that you wish to verify, make sure that a new line listing the asset ID is added to this assets file. For example, say your asset ID is <a href="http://coloredcoins.org/explorer/asset/LCcaoizMSQRJjtYXkRdTq1pkRKJWFFVw5dVQ7" target="_blank" style={{color:'blue'}}>LCcaoizMSQRJjtYXkRdTq1pkRKJWFFVw5dVQ7</a>, add to your assets file the following line
												<p className="verLine">LCcaoizMSQRJjtYXkRdTq1pkRKJWFFVw5dVQ7</p>
												Our explorer automatically validates your SSL certificate and checks for the appearence of the asset ID in the designated file on your server. Since only you control both your asset metadata and your server, anyone can be sure that whoever issued this asset is the person or company listed in the SSL certificate.
										</div>
									</li>
									<li>Posts on <b>social media</b>
										<a role="button" data-toggle="collapse" style={{paddingLeft: "10px"}} href="#collapseSocial" aria-expanded="false" aria-controls="collapseSocial"><img src="/img/icons/info.png" />
										</a>
										<div id="collapseSocial" className="verExp collapse" >
											<h3 className="verTitle">Asset verification by posting on Social Media</h3>
											If you have active social media accounts you can link your assets to those social channels by posting newly issued asset IDs. Currently we support:
											<ul>
												<li><b>Twitter</b>
													<a role="button" data-toggle="collapse" style={{paddingLeft: "10px"}} href="#collapseTwitter" aria-expanded="false" aria-controls="collapseTwitter"><img src="/img/icons/info.png" />
													</a>
												<div className="verExpInner collapse" id="collapseTwitter">
													<h3 className="verTitle">Asset verification with Twitter</h3>
													Vouch for your assets by tweeting about them.<br/>
													Add your twitter handle into the <a href="/#/settings" target="_blank" style={{color: 'blue'}}>Verification Settings</a>, so it can be included in the asset metadata.<br/>
													<p className="verLine">
														The current value is <a href={(current_twitter=='NOT SET') ? '/#/settings':"https://twitter.com/"+current_twitter} target="_blank" style={{color: 'blue'}}>{current_twitter}</a>
													</p>
													For each new asset that you wish to verify tweet the following text from your account
													<p className="verLine">Verifying issuance of colored coins asset with ID #your_asset_id</p>
													For example, say your asset ID is <a href="http://coloredcoins.org/explorer/asset/LCcaoizMSQRJjtYXkRdTq1pkRKJWFFVw5dVQ7" target="_blank" style={{color:'blue'}}>LCcaoizMSQRJjtYXkRdTq1pkRKJWFFVw5dVQ7</a>, you need to tweet the following text
													<p className="verLine">Verifying issuance of colored coins asset with ID #LCcaoizMSQRJjtYXkRdTq1pkRKJWFFVw5dVQ7</p>
													Note that the asset ID is used as a <a href="https://support.twitter.com/articles/49309" target="_blank" style={{color: 'blue'}}>twitter hashtag</a>. Here is an <a href="https://twitter.com/hashtag/LHEQJbm21GGzpHzwwuoraZUQ8LuApHXRqCrwk" target="_blank" style={{color: "blue"}}>example of an asset endorsing tweet</a>.
														Our explorer automatically checks for the appearence of the asset ID in hashtag in your twitter feed. Since only you control both your asset metadata and your twitter account, anyone can be sure that whoever issued this asset is the owner of your twitter account.
												</div>
												</li>
												<li><b>Github</b>
													<a role="button" data-toggle="collapse" style={{paddingLeft: "10px"}} href="#collapseGithub" aria-expanded="false" aria-controls="collapseGithub"><img src="/img/icons/info.png" /></a>
													<div className="verExpInner collapse" id="collapseGithub">
														<h3 className="verTitle">Asset verification with Github</h3>
														Vouch for your assets by listing them in a <a href="https://help.github.com/articles/about-gists/" target="_blank" style={{color: "blue"}}>public gist</a> under your Github account.<br/>
														Add your gist ID into the <a href="/#/settings" target="_blank" style={{color: 'blue'}}>Verification Settings</a>, so it can be included in the asset metadata. For example, say your gist url is <span style={{color:"gray"}}>https://gist.github.com/your-user-name/dec4969306dc647ea8db</span> your gist ID is <b>dec4969306dc647ea8db</b>.<br/>
														<p className="verLine">
															The current value is <a href={(current_github=='NOT SET') ? '/#/settings':"https://gist.github.com/"+current_github} target="_blank" style={{color: 'blue'}}>{current_github}</a>
														</p>
														For each new asset that you wish to verify, edit your public gist and add a new line in the following format:<br/>
															<p className="verLine">Verifying issuance of colored coins asset with ID #your_asset_id</p>For example, say your asset ID is  <a href="http://coloredcoins.org/explorer/asset/LCcaoizMSQRJjtYXkRdTq1pkRKJWFFVw5dVQ7" target="_blank" style={{color:'blue'}}>LCcaoizMSQRJjtYXkRdTq1pkRKJWFFVw5dVQ7</a>, you need to add the following line to your public gist
															<p className="verLine">Verifying issuance of colored coins asset with ID #LCcaoizMSQRJjtYXkRdTq1pkRKJWFFVw5dVQ7</p>
															Here is an <a href="https://gist.github.com/dec4969306dc647ea8db" target="_blank" style={{color: "blue"}}>example of an asset endorsing gist</a>.<br/>
															Our explorer automatically checks for the appearence of the asset ID in the specified gist. Since only you control both your asset metadata and your gist, anyone can be sure that whoever issued this asset is the owner of your Github account.
													</div>
												</li>
												<li><b>Facebook</b>
													<a role="button" data-toggle="collapse" style={{paddingLeft: "10px"}} href="#collapseFacebook" aria-expanded="false" aria-controls="collapseFacebook"><img src="/img/icons/info.png" />
													</a>
													<div className="verExpInner collapse" id="collapseFacebook">
														<h3 className="verTitle">Asset verification with Facebook</h3>
														Vouch for your assets by listing them on a dedicated public facebook page.<br/>
														Add your facebook page ID into the <a href="/#/settings" target="_blank" style={{color: 'blue'}}>Verification Settings</a>, so it can be included in the asset metadata. For example, say your page url is <span style={{color:"gray"}}>https://www.facebook.com/pagename-1648069075450783</span> your page ID is <b>1648069075450783</b>.<br/>
														<p className="verLine">
															The current value is <a href={(current_facebook=='NOT SET') ? '/#/settings':"https://www.facebook.com/"+current_facebook} target="_blank" style={{color: 'blue'}}>{current_facebook}</a>
														</p>
														For each new asset that you wish to verify, post the following text on this page
															<p className="verLine">Verifying issuance of colored coins asset with ID #your_asset_id</p>
															For example, say your asset ID is <a href="http://coloredcoins.org/explorer/asset/LCcaoizMSQRJjtYXkRdTq1pkRKJWFFVw5dVQ7" target="_blank" style={{color:'blue'}}>LCcaoizMSQRJjtYXkRdTq1pkRKJWFFVw5dVQ7</a>, you need to post the following
																<p className="verLine">Verifying issuance of colored coins asset with ID #LCcaoizMSQRJjtYXkRdTq1pkRKJWFFVw5dVQ7</p>
														Here is an <a href="https://www.facebook.com/Digital-tickets-1648069075450783/" target="_blank" style={{color: "blue"}}>example of an asset endorsing facebook page</a>.<br/>
														Our explorer automatically checks for the appearence of the above text on your public page. Since only you control both your asset metadata and your facebook account, anyone can be sure that whoever issued this asset is the owner of your facebook account.	Note that this necessites setting it up so that only you can post on it.
														<a role="button" data-toggle="collapse" style={{float: "right", color: 'gray', paddingRight:'10px'}} href="#collapseFbPage" aria-expanded="false" aria-controls="collapseFbPage">learn how...
														</a>
														<div className="verExpInner collapse" id="collapseFbPage">
														<h3 className="verTitle">Create & Set up your public facebook page</h3>
															<ul>
																<li>Log in to your facebook account</li>
																<li>Expand the top right menu and select <b>Create Page</b></li>
																<li className="noBullet"><img src="/img/verifications/fb_create_user_page.png"/></li>
																<li>Chose your page <b>category</b> (and if you would like to, select a name, image and description to match your brand)</li>
																<li>Create the page</li>
																<li>Now that you have created the page, click the <b>Settings</b> link (top right)</li>
																<li className="noBullet"><img src="/img/verifications/fb_page_settings_button.png"/></li>
																<li>On the settings page, disable <b>visitor posts</b>. First select the visitor posts category and then check the "Disable posts by other people on this page" checkbox.</li>
																<li className="noBullet"><img src="/img/verifications/fb_disable_visitors_posts.png"/></li>
																<li>Save your changes</li>
																<li>Grab the page ID from the url. The URL looks something like: <span style={{color: "gray"}}>https://www.facebook.com/Digital-tickets-1648069075450783</span>. The page ID is the number at the end <b>1648069075450783</b></li>
															</ul>
														</div>
													</div>
												</li>
											</ul>
										</div>
									</li>
								</ol>
								<div style={{marginBottom: "30px", padding: "10px 0"}}>
									<div onClick={this.toggleVerifications} className="templateMetaField form-group">
										<div style={{float: "left"}}>
											<input className="form-control" type="checkbox" checked={this.state.useVerify} readOnly />
										</div>
										<div style={{lineHeight: "35px", paddingLeft: "40px"}}>Check to Enable verifications with the settings listed below:
										</div>
									</div>
								<ol>
									<li>
										{(current_domain=='NOT SET') ? 'SSL' : <b>SSL</b>}
										: Path to file
										{(current_domain=='NOT SET') ? <span style={{paddingLeft:'5px'}}>NOT SET</span> :	<a href={current_domain} target="_blank" style={{color: 'blue',paddingLeft:'5px'}}>{(current_domain.length < 33) ? current_domain: current_domain.substr(0,20)+'...'+current_domain.substr(-10)}
										</a>}
										<a href='/#/settings' target="_blank" style={{color: 'gray',float: 'right'}}>({(current_domain=='NOT SET')? 'set': 'change'})
										</a>
									</li>
									<li>
										{(current_twitter=='NOT SET' && current_github == 'NOT SET' && current_facebook == 'NOT SET') ? 'SOCIAL' : <b>SOCIAL</b>}
										<ul>
											<li>
												{(current_twitter=='NOT SET') ? 'Twitter' : <b>Twitter</b>}
												: Account
												{(current_twitter=='NOT SET') ? <span style={{paddingLeft:'5px'}}>NOT SET</span> :	<a href={"https://twitter.com/"+current_twitter} target="_blank" style={{color: 'blue',paddingLeft:'5px'}}>{'@'+current_twitter}
												</a>}
												<a href='/#/settings' target="_blank" style={{color: 'gray',float: 'right'}}>({(current_twitter=='NOT SET')? 'set': 'change'})
												</a>
											</li>
											<li>
												{(current_github=='NOT SET') ? 'Github' : <b>Github</b>}
												: Gist ID
												{(current_github=='NOT SET') ? <span style={{paddingLeft:'5px'}}>NOT SET</span> :	<a href={"https://gist.github.com/"+current_github} target="_blank" style={{color: 'blue',paddingLeft:'5px'}}>{current_github}
												</a>}
												<a href='/#/settings' target="_blank" style={{color: 'gray',float: 'right'}}>({(current_github=='NOT SET')? 'set': 'change'})
												</a>
											</li>
											<li>
												{(current_facebook=='NOT SET') ? 'Facebook' : <b>Facebook</b>}
												: Page ID
												{(current_facebook=='NOT SET') ? <span style={{paddingLeft:'5px'}}>NOT SET</span> :	<a href={"https://www.facebook.com/"+current_facebook} target="_blank" style={{color: 'blue',paddingLeft:'5px'}}>{current_facebook}
												</a>}
												<a href='/#/settings' target="_blank" style={{color: 'gray',float: 'right'}}>({(current_facebook=='NOT SET')? 'set': 'change'})
												</a>
											</li>
										</ul>
									</li>
								</ol>
							</div>

							<div className='form-btn-group'>
								<a href={back} className="btn btn-regular btn-l" style={{marginRight: '10px'}}>Back</a>
								<a onClick={this.createAsset} className="btn btn-highlight btn-l">Issue asset</a>
							</div>
						</div>
				</div>
			);
		}

		if (step == "success") {
			var verifySection = "";
			if (this.state.useVerify) {
				verifySection = <div>
						<h2 id="issuer-verifications-title">Issuer verifications</h2>
						<Verifications data={(this.props.state.user && this.props.state.user.verifications) || {}} assetId={localStorage.IssueAssetId} />
					</div>;
			}

			return (
				<div id="CreateAsset">
					<h1 className="pageTitle">Congratulations!</h1>
					<p style={{marginRight: '30px'}}>You have successfuly issued the asset.</p>
					<div style={{display: 'inline-block', marginBottom: '32px'}}>
						<img src="/img/assets/crypto-dollar.png" style={{display: 'inline-block', marginRight: '16px', verticalAlign: 'bottom'}}/>
						<div style={{display: 'inline-block'}}>
							<a href={"/#/sendAsset/" + localStorage.IssueAssetId} className="btn btn-l btn-highlight" style={{marginBottom: '8px', display: 'block'}}>Send this asset</a>
							<a href="/#/newAsset" className="btn btn-l btn-highlight" style={{marginBottom: '8px', display: 'block'}}>Issue another asset</a>
							<a href={blockExplorerUIUrl + "/asset/" + localStorage.IssueAssetId + "/" + localStorage.IssueAssetTx + "/" + localStorage.IssueAssetIndex} target="_blank" className="btn btn-l btn-highlight" style={{display: 'block'}}>Show on block explorer</a>
						</div>
					</div>
					{verifySection}
				</div>
			);
		}

		if (step == "failed") {
			var error = this.state.error
			if (error.message) {
				error = error.message
			}

			var extraInfo = <div></div>
			if (this.state.error.name === 'NotEnoughFundsError') {
				error = 'Not enough satoshi in issuance address -'
				extraInfo = <div className='highlightAddress text-m' style={{display: 'inline-block'}}>{this.state.issueAddress}</div>
			}

			return (
				<div id="CreateAsset">
					<div className="text-center" style={{margin: "100px auto", width: "570px"}}>
						<img src="/img/error.png" />
						<h2 className="successTitle">Error</h2>
						<div className="successMsg">
							Asset was not issued <br/>
							Reason: {error}
						</div>
						{extraInfo}
					</div>
				</div>
			);
		}
	}
});

var Verifications = React.createClass({
	getInitialState: function() {
		var verifications = {};

		var domain = this.props.data && this.props.data.domain && this.props.data.domain.url || false;
		var social = this.props.data && this.props.data.social || {};

		var twitter = social.twitter && social.twitter.username || false;
		var facebook = social.facebook && social.facebook.page_id || false;
		var git = social.github && social.github.gist_id || false;

		if (domain)
			verifications.domain = {val: domain};
		if (twitter)
			verifications.twitter = {val: twitter};
		if (facebook)
			verifications.facebook = {val: facebook};
		if (git)
			verifications.git = {val: git};

		return ({data: verifications});
	},
	testVerifications: function () {
		var myself = this;
		var state = this.state.data;

		// show splash
		$("#splash").show();

		// build verifications json
		var verifications = {domain: {}, social: {}};
		if (this.state.data.domain)
			verifications.domain = {url: this.state.data.domain.val};
		if (this.state.data.twitter)
			verifications.social.twitter = {username: this.state.data.twitter.val};
		if (this.state.data.facebook)
			verifications.social.facebook = {page_id: this.state.data.facebook.val};
		if (this.state.data.git)
			verifications.social.github = {gist_id: this.state.data.git.val};

		console.log('coloredcoins.verifyIssuer: this.props.assetId =', this.props.assetId)
		console.log('coloredcoins.verifyIssuer: verifications =', verifications)
		coloredcoins.verifyIssuer(this.props.assetId, verifications, function (err, ret) {
			// TODO: handle error
			if (ret && ret.verifications) {
				if (ret.verifications.domain) {
					if (ret.verifications.domain.asset_verified)
						state.domain.pass = true;
					else
						state.domain.pass = false;
				}

				if (ret.verifications.social) {
					if (typeof ret.verifications.social.twitter !== 'undefined') {
						if (ret.verifications.social.twitter !== false)
							state.twitter.pass = true;
						else if (state.twitter)
							state.twitter.pass = false;
					}

					if (typeof ret.verifications.social.github !== 'undefined') {
						if (ret.verifications.social.github !== false)
							state.git.pass = true;
						else if (state.git)
							state.git.pass = false;
					}

					if (typeof ret.verifications.social.facebook !== 'undefined') {
						if (ret.verifications.social.facebook !== false)
							state.facebook.pass = true;
						else if (state.facebook)
							state.facebook.pass = false;
					}
				}
			}

			myself.setState({data: state});
			$("#splash").hide();
		})
	},
	render: function() {
		if ($.isEmptyObject(this.state.data)) {
			return (
				<p>
					No verification options found.
				</p>
			)
		} else {
			var domain = "";
			var twitter = "";
			var git = "";
			var facebook = "";

			if (this.state.data.domain) {
				var dombg = "domainVer";
				if (typeof this.state.data.domain.pass != 'undefined')
					if (this.state.data.domain.pass !== false)
						dombg = "domainVerS";
					else
						dombg = "domainVerF";
				domain = <div className="col-sm-6">
					<div className={dombg}></div>
					<div style={{paddingLeft: "50px"}}>
						<h3>Domain / SSL</h3>
						<p>
							Add a line to the text file:<br/>
							<strong>{this.props.assetId}</strong>
						</p>
					</div>
				</div>
			}

			if (this.state.data.twitter) {
				var tbg = "twitterVer";
				if (typeof this.state.data.twitter.pass != 'undefined')
					if (this.state.data.twitter.pass !== false)
						tbg = "twitterVerS";
					else
						tbg = "twitterVerF";

				twitter = <div className="col-sm-6">
					<div className={tbg}></div>
					<div style={{paddingLeft: "50px"}}>
						<h3>Twitter</h3>
						<p>
							Tweet the following text:<br/>
							Verifying issuance of colored coins asset with ID <strong>#{this.props.assetId}</strong>
						</p>
					</div>
				</div>
			}

			if (this.state.data.git) {
				var gbg = "gitVer";
				if (typeof this.state.data.git.pass != 'undefined')
					if (this.state.data.git.pass !== false)
						gbg = "gitVerS";
					else
						gbg = "gitVerF";

				git = <div className="col-sm-6">
					<div className={gbg}></div>
					<div style={{paddingLeft: "50px"}}>
						<h3>Github</h3>
						<p>
							Add a line to the gist like so:<br/>
							Verifying issuance of colored coins asset with ID <strong>#{this.props.assetId}</strong>
						</p>
					</div>
				</div>
			}

			if (this.state.data.facebook) {
				var fbg = "facebookVer";
				if (typeof this.state.data.facebook.pass != 'undefined')
					if (this.state.data.facebook.pass !== false)
						fbg = "facebookVerS";
					else
						fbg = "facebookVerF";

				facebook = <div className="col-sm-6">
					<div className={fbg}></div>
					<div style={{paddingLeft: "50px"}}>
						<h3>Facebook</h3>
						<p>
							Post on your page the following text:<br/>
							Verifying issuance of colored coins asset with ID <strong>#{this.props.assetId}</strong>
						</p>
					</div>
				</div>
			}

			if (domain || twitter || facebook || git) {
				return (
					<div id="verifications">
						<div className="row">
							{domain}
							{twitter}
							{facebook}
							{git}
						</div>
						<div style={{marginTop: "40px", marginBottom: "30px"}}>
							<a href="https://github.com/Colored-Coins/Colored-Coins-Protocol-Specification/wiki/Asset-Verification" target="_blank" style={{display: 'block'}}>for more info &gt;</a>
							<a onClick={this.testVerifications} className="btn btn-l btn-regular">Test verifications</a>
						</div>
					</div>
				)
			} else {
				<div id="verifications">
					No Verifications Found
				</div>
			}

		}
	}
});

var SendAsset = React.createClass({
	getInitialState: function() {
		// get asset info from state
		return ({amount: ""});
	},
	componentWillReceiveProps: function (nextProps) {
		if (JSON.stringify(this.props) !== JSON.stringify(nextProps)) {
			this.setState({amount: 0});
		}
	},
	sendAsset: function () {
		$("#splash").show();

		var myself = this;
		var asset = this.props.data.asset
		var financeUtxos = this.props.data.financeUtxos
		var divisibility = asset.divisibility || 0
		var sendAmount = this.state.amount * Math.pow(10, divisibility)

		// make sendutxo array
		var sendutxo = financeUtxos.slice(0)	// clone array
		sendutxo = sendutxo.concat(asset.distribution)

		console.log('financeUtxos', financeUtxos)
		console.log('sendutxo', sendutxo)
		
		var args = {
			fee: fee,
			sendutxo: sendutxo,
			to: [
				{
					address: this.state.toAddress,
					assetId: asset.assetId,
					amount: sendAmount
				}
			]
		}

		console.log(args);

		coloredcoins.sendAsset(args, function (err, ans) {
			$("#splash").hide();
			if (err) {
				// show error screen
				console.log(err);
				var error = err.error || err.message || "General Error";
				myself.setState({error: error});
				window.location.href = "/#/sendAsset/" + myself.props.data.assetId + "/failed";
				return false;
			}

			// force data refresh
			myself.props.refreshData();
			// console.log(ans);
			window.location.href = "/#/sendAsset/" + myself.props.data.assetId + "/success/" + ans.txid;
		});
	},
	updateField: function (event) {
		var obj = {};
		obj[event.target.id] = event.target.value;
		this.setState(obj);	
	},
	componentDidUpdate: function () {
		this.setValidators();
	},
	componentDidMount: function () {
		this.setValidators();
	},
	setValidators: function () {
		var myself = this;
		$("form").validator().on('submit', function (e) {
			if (e.isDefaultPrevented()) {
				if ($(".has-error").first().get(0))
					$(".has-error").first().get(0).scrollIntoView();
				return false;
			} else {
				myself.sendAsset();
				return false;
			}
		})
	},
	render: function () {
		var step = this.props.step || "send";
		var asset = this.props.data.asset

		if (step == "send") {
			// look for asset name in localstorage
			var name = asset.assetName || asset.assetId
			var availAmount = asset.amount / Math.pow(10, asset.divisibility)
			var step = Math.pow(10, asset.divisibility * -1)

			return (
				<div id="SendAsset">
					<form role="form" id="SendAssetForm" data-toggle="validator">
					<h1 className="pageTitle">Send Asset <span className="small step">{name}</span></h1>
					<div style={{width: "550px"}}>
						<h2>Enter Amount:</h2>
						<div className="form-group row">
							<div className="col-xs-7">
								<input type="number" max={asset.amount} min={step} step={step} className="form-control" id="amount" required={true} onChange={this.updateField} value={this.state.amount} />
							</div>
							<div className="col-xs-5" style={{paddingLeft: "0"}}>
								<span style={{lineHeight: "34px"}}> / {availAmount.toFixed(asset.divisibility).toLocaleString()} Available</span>
							</div>
						</div>
						<div style={{padding: "0 0 30px 0"}}>
							<h2>Address:</h2>
							<div>
								<input type="text" className="form-control" id="toAddress" required={true} value={this.state.toAddress} onChange={this.updateField} />
							</div>
						</div>
						<button type="submit" className="btn btn-highlight btn-l form-btn-group">Send</button>
					</div>
					</form>
				</div>

			);
		}

		if (step == "success") {
			var link = blockExplorerUIUrl + "/tx/" + this.props.txid;
			return (
				<div id="SendAsset">
					<h1 className="pageTitle">Congratulations!</h1>
					<p>You have successfuly sent the asset.</p>
					<div className='postTxDiv'>
						<img src="/img/assets/crypto-dollar.png" style={{display: 'inline-block', marginRight: '16px', verticalAlign: 'middle'}}/>
						<div style={{display: 'inline-block'}}>
							<a href={link} target="_blank" className="btn btn-l btn-highlight" style={{display: 'inline-block'}}>Show on block explorer</a>
						</div>							
					</div>
				</div>
			);
		}

		if (step == "failed") {
			return (
				<div id="CreateAsset">
					<div className="text-center" style={{margin: "100px auto", width: "570px"}}>
						<img src="/img/error.png" />
						<h2 className="successTitle">Error</h2>
						<div className="successMsg">
							Asset was not sent
						</div>
						<div>
							Reason: {this.state.error}
						</div>
					</div>
				</div>
			);
		}
	}
});

var ReceiveAsset = React.createClass({
	getInitialState: function() {
		var address = coloredcoins.hdwallet.getAddress()
		return({address: address});
	},
	render: function () {
		var link = dashboardUrl + "/generateQR?address=" + this.state.address;
		return (
			<div id="ReceiveAsset">
				<h1 className="pageTitle">Receive Asset</h1>
				<div style={{marginBottom: "30px", padding: "30px 0"}}>
					<div style={{width: "550px"}} className="row">
						<div className="col-sm-4">
							<img src={"/generateQR?address=" + this.state.address + "&src=true"} width="164px" height="164px"/>
						</div>
						<div className="col-sm-8">
					    <div>
					      <p className='text-m'>
					        Available address:
					      </p>
					      <div className='highlightAddress text-m'>{this.state.address}</div>
					      <p>
									The following link will show a QR code of this address: <br/>
									<a href={link} style={{color: 'blue'}} target="_blank">{link}</a>
								</p>
					    </div>
						</div>
					</div>
				</div>
			</div>
		)
	}
});
