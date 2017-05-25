var Settings = React.createClass({
	updateUser: function () {
		localStorage['user'] = JSON.stringify(this.props.state.user)
	},
	updateVer: function (event) {
		var user = this.props.state.user;
		if (!user.verifications)
			user.verifications = {};

		if (event.target.id == "ver_ssl") {
			if (!user.verifications.domain)
				user.verifications.domain = {};
			user.verifications.domain.url = event.target.value;
			if (user.verifications.domain.url == "")
				delete user.verifications.domain;
		}

		if (event.target.id == "ver_git") {
			if (!user.verifications.social)
				user.verifications.social = {};
			if (!user.verifications.social.github)
				user.verifications.social.github = {};
			user.verifications.social.github.gist_id = event.target.value;

			if (user.verifications.social.github.gist_id == "")
				delete user.verifications.social.github;
		}

		if (event.target.id == "ver_twitter") {
			if (!user.verifications.social)
				user.verifications.social = {};
			if (!user.verifications.social.twitter)
				user.verifications.social.twitter = {};
			user.verifications.social.twitter.username = event.target.value;
			
			if (user.verifications.social.twitter.username == "")
				delete user.verifications.social.twitter;
		}

		if (event.target.id == "ver_facebook") {
			if (!user.verifications.social)
				user.verifications.social = {};
			if (!user.verifications.social.facebook)
				user.verifications.social.facebook = {};
			user.verifications.social.facebook.page_id = event.target.value;
			
			if (user.verifications.social.facebook.page_id == "")
				delete user.verifications.social.facebook;
		}

		if (user.verifications && user.verifications.social && !Object.keys(user.verifications.social).length)
			delete user.verifications.social;

		if (user.verifications && !Object.keys(user.verifications).length)
			user.verifications = null;

		this.props.updateUserData(user);
	},

	updateField: function (event) {
		var user = this.props.state.user;
		user[event.target.id] = event.target.value;
		this.props.updateUserData(user);
	},

	overscan: function () {
		var myself = this;
		$("#splash").show();
		// var baseAccounts = this.props.state.user.user_account_gap;
		// var baseAddresses = this.props.state.user.user_address_gap;

		// baseAccounts = coloredcoins.baseAccounts + 10;
		
		coloredcoins.hdwallet.rediscover(15, function (err) {
			myself.props.refreshData(function () {
				alert("Overscan Complete Please Check Your Active Asset List");	
			});
		})
	},

	render: function() {
		var verifications = this.props.state.user.verifications
		var domain = verifications && verifications.domain && verifications.domain.url || "";
		var social = verifications && verifications.social || {};

		var twitter = social.twitter && social.twitter.username || "";
		var facebook = social.facebook && social.facebook.page_id || "";
		var git = social.github && social.github.gist_id || "";
		
		return (
			<div id="Settings">
				<div className="settings">
					<h1 className="pageTitle settingsTitle">Backup Wallet</h1>
					<p className="settingsContent">Click to get your 12 word passphrase of your wallet.</p>
					<div>
						<a role="button" className="btn btn-highlight btn-l" style={{marginLeft: '295px'}} data-toggle="collapse" href="#myPrivateKey" aria-expanded="false" aria-controls="myPrivateKey">Show my passphrase</a>
						<div className="collapse" id="myPrivateKey" style={{margin: "10px 0"}}>
							<label htmlFor='mnemonic'>Passphrase (<a href="https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki" target="_blank" style={{color: "blue"}}>BIP39</a> Mnemonic):</label>
							<textarea readOnly className="form-control" style={{height: "80px", resize: "none"}} id="mnemonic">{localStorage.mnemonic}</textarea>
						</div>
					</div>
				</div>

				<div className="settings">
					<h1 className="pageTitle settingsTitle">Issuer Verifications</h1>
					<p  className="settingsContent">link your real-world identity.</p>
					<div className="settingsContent">
						<div className="form-group">
							<label htmlFor='ver_ssl' style={{width: "100%"}}>
								Domain / SSL (URL to assets file)
								<a role="button" data-toggle="collapse" style={{float: "right"}} href="#collapseDomain" aria-expanded="false" aria-controls="collapseDomain"><img src="/img/icons/info.png" /></a>
							</label>
							<input type="text" className="form-control" id="ver_ssl" onChange={this.updateVer} value={domain} placeholder="Assets file URL, E.g. https://..../assets.txt"/>
							<div id="collapseDomain" className="verExp collapse">
								<h3 className="verTitle">Asset verification by placing a file behind https</h3>
								If you own a server with a valid SSL certificate you can vouch for your assets by listing them in a text file located on your server.<br/>
								Enter here the full <b>https</b> url to your assets file (for example <a href="https://www.colu.co/assets.txt" target="_blank" style={{color: 'blue'}}>https://www.colu.co/assets.txt</a>). For each new asset that you wish to verify, add to your assets file a new line listing the asset ID. For example, say your asset ID is <a href="http://coloredcoins.org/explorer/asset/La52Y4cXSBeaXWdgKSpxHdUTZsC7deTgarFVKb" target="_blank" style={{color:'blue'}}>La52Y4cXSBeaXWdgKSpxHdUTZsC7deTgarFVKb</a>, add to your assets file the following line
									<p className="verLine">La52Y4cXSBeaXWdgKSpxHdUTZsC7deTgarFVKb</p>
							</div>
							<div className="help-block with-errors" />
						</div>
						<div className="form-group">
							<label htmlFor='ver_twitter' style={{width: "100%"}}>
								Twitter (Twitter Username)
								<a role="button" data-toggle="collapse" style={{float: "right"}} href="#collapseTwitter" aria-expanded="false" aria-controls="collapseTwitter"><img src="/img/icons/info.png" /></a>
							</label>
							<input type="text" className="form-control" id="ver_twitter" onChange={this.updateVer} value={twitter} placeholder="Your twitter handle" />
							<div className="verExp collapse" id="collapseTwitter">
								<h3 className="verTitle">Asset verification with Twitter</h3>
								Vouch for your assets by tweeting about them.<br/>Enter here your <b>twitter handle</b>. Say your twitter account is <span style={{color: "gray"}}>@mytwitter</span>, enter here <b>mytwitter</b>.<br/>
								For each new asset that you wish to verify tweet the following text from your account
								<p className="verLine">Verifying issuance of colored coins asset with ID #your_asset_id</p>
								For example, say your asset ID is <a href="http://coloredcoins.org/explorer/asset/La52Y4cXSBeaXWdgKSpxHdUTZsC7deTgarFVKb" target="_blank" style={{color:'blue'}}>La52Y4cXSBeaXWdgKSpxHdUTZsC7deTgarFVKb</a>, you need to tweet the following text<br/>
								<p className="verLine">Verifying issuance of colored coins asset with ID #La52Y4cXSBeaXWdgKSpxHdUTZsC7deTgarFVKb</p>
								Note that the asset ID is used as a <a href="https://support.twitter.com/articles/49309" target="_blank" style={{color: 'blue'}}>twitter hashtag</a>. Here is an <a href="https://twitter.com/hashtag/LHEQJbm21GGzpHzwwuoraZUQ8LuApHXRqCrwk" target="_blank" style={{color: "blue"}}>example of an asset endorsing tweet</a> .	
							</div>
							<div className="help-block with-errors" />
						</div>
						<div className="form-group">
							<label htmlFor='ver_git' style={{width: "100%"}}>
								Github (Gist ID)
								<a role="button" data-toggle="collapse" style={{float: "right"}} href="#collapseGithub" aria-expanded="false" aria-controls="collapseGithub"><img src="/img/icons/info.png" /></a>
							</label>
							<input type="text" className="form-control" id="ver_git" onChange={this.updateVer} value={git} placeholder="Your public gist ID"/>
							<div className="verExp collapse" id="collapseGithub">
								<h3 className="verTitle">Asset verification with Github</h3>
								Vouch for your assets by listing them in a <a href="https://help.github.com/articles/about-gists/" target="_blank" style={{color: "blue"}}>public gist</a> under your Github account. Enter here the public <b>gist ID</b>. For example, say your gist url is <span style={{color:"gray"}}>https://gist.github.com/your-user-name/dec4969306dc647ea8db</span> Enter here <b>dec4969306dc647ea8db</b>.<br/>	For each new asset that you wish to verify, edit your public gist and add a new line in the following format:<br/>
									<p className="verLine">Verifying issuance of colored coins asset with ID #your_asset_id</p>
									For example, say your asset ID is  <a href="http://coloredcoins.org/explorer/asset/La52Y4cXSBeaXWdgKSpxHdUTZsC7deTgarFVKb" target="_blank" style={{color:'blue'}}>La52Y4cXSBeaXWdgKSpxHdUTZsC7deTgarFVKb</a>, you need to add the following line to your public gist
									<p className="verLine">Verifying issuance of colored coins asset with ID #La52Y4cXSBeaXWdgKSpxHdUTZsC7deTgarFVKb</p>
									Here is an <a href="https://gist.github.com/dec4969306dc647ea8db" target="_blank" style={{color: "blue"}}>example of an asset endorsing gist</a>.
							</div>
							<div className="help-block with-errors" />
						</div>
						<div className="form-group">
							<label htmlFor='ver_facebook' style={{width: "100%"}}>
								Facebook (Page ID)
								<a role="button" data-toggle="collapse" style={{float: "right"}} href="#collapseFacebook" aria-expanded="false" aria-controls="collapseFacebook"><img src="/img/icons/info.png" /></a>
							</label>
							<input type="text" className="form-control" id="ver_facebook" onChange={this.updateVer} value={facebook} placeholder="Your facebook page ID" />
							<div className="verExp collapse" id="collapseFacebook">
								<h3 className="verTitle">Asset verification with Facebook</h3>
								Vouch for your assets by listing them on a dedicated public facebook page. Enter here the <b>page ID</b>.	For example, say your public facebook page url is <span style={{color:"gray"}}>https://www.facebook.com/pagename-1648069075450783</span>enter here <b>1648069075450783</b>.<br/>	
									For each new asset that you wish to verify, post the following text on this page
									<p className="verLine">Verifying issuance of colored coins asset with ID #your_asset_id</p>								
									For example, say your asset ID is <a href="http://coloredcoins.org/explorer/asset/La52Y4cXSBeaXWdgKSpxHdUTZsC7deTgarFVKb" target="_blank" style={{color:'blue'}}>La52Y4cXSBeaXWdgKSpxHdUTZsC7deTgarFVKb</a>, you need to post the following
										<p className="verLine">Verifying issuance of colored coins asset with ID #La52Y4cXSBeaXWdgKSpxHdUTZsC7deTgarFVKb</p>
								Here is an <a href="https://www.facebook.com/Digital-tickets-1648069075450783/" target="_blank" style={{color: "blue"}}>example of an asset endorsing facebook page</a>.<br/>
								Our explorer automatically checks for the appearence of the above text on your public page. Since only you control both your asset metadata and your facebook account, anyone can be sure that whoever issued this asset is the owner of your twitter account.<br/>
								Note that this necessites that when you create your public facebook page you set it up so that only you can post on it.
								<a role="button" data-toggle="collapse" style={{float: "right", color: 'gray'}} href="#collapseFbPage" aria-expanded="false" aria-controls="collapseFbPage">learn how...<img src="/img/icons/info.png" /></a>
								<div className="verExpInner collapse" id="collapseFbPage">
								<h3 className="verTitle">Create &amp; Set up your public facebook page</h3>
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
							<div className="help-block with-errors" />
						</div>
					</div>
					<button onClick={this.updateUser} className="btn btn-highlight btn-l form-btn-group">Update</button>
				</div>

				<div className="settings">
					<h1 className="pageTitle settingsTitle">Derivation Gap</h1>
					<div style={{marginBottom: "30px"}}>
						<p className="settingsContent">If you believe that a digital asset was sent to you and it is not shown in your Asset List, click the Over scan button.</p>
						<div className="form-group" style={{marginBottom: '16px'}}>
							<button onClick={this.overscan} className="btn btn-highlight btn-l form-btn-group">Over scan</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
});
