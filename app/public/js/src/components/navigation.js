var NavigationItem = React.createClass({
	render: function () {
		var linkClassName = 'text-l'
		if (this.props.id == this.props.current)
			linkClassName += ' leftNavActive';

		if (this.props.link)
			var link = <a className={linkClassName} href={this.props.link} onClick={this.props.onClick} target={this.props.target}>{this.props.name}</a>
		else
			var link = <a id={this.props.id} className={linkClassName} onClick={this.props.onClick}>{this.props.name}</a>

		return (
			<li title={this.props.name} id={this.props.id}>
				{link}
			</li>
		);
	}
});

var Navigation = React.createClass({
	getInitialState: function () {
		return {open: this.props.open};
	},
	componentWillReceiveProps: function (nextProps) {
		if (JSON.stringify(this.props) !== JSON.stringify(nextProps)) {
			this.setState({open: nextProps.open});
		}
	},
	render: function() {
		var content
		var footerNetwork = (network === 'testnet') ? <span id='leftNavFooterNetwork'>Testnet</span> : <span></span>
		console.log('Navigation.render: this.props.withActions =', this.props.withActions, 'this.props.open =', this.props.open)
		console.log('network =', network)
		if (this.props.withActions) {
			content = (
				<ul id="leftNavMenu">
					<NavigationItem id="leftDashboard" onClick={this.props.closeModal} current={this.props.current} link="/#/" target="" name="Dashboard" />
					<NavigationItem id="leftAssets" onClick={this.props.showModal} current={this.props.current} link="" target="" name="Manage Assets" />
					<NavigationItem id="leftTransactions" onClick={this.props.closeModal} current={this.props.current} link="/#/transactions" target="" name="Transactions" />
					<NavigationItem id="leftDocumentation" onClick={this.props.closeModal} current={this.props.current} link="http://coloredcoins.org/documentation" target="_blank" name="Documentation" />
					<NavigationItem id="leftSettings" onClick={this.props.closeModal} current={this.props.current} link="/#/settings" target="" name="Settings" />
				</ul>
			)
		} else {
			content = <div></div>
		}

		return (
			<div id="leftNav" className={this.state.open ? 'open' : 'closed'}>
				{content}
				<div id='leftNavFooter'>
					<div style={{marginBottom: '4px'}}>
						<span id='leftNavFooterBrand'>ColoredCoins</span>
						<img id='leftNavFooterLogo' src='/img/icons/png/logo16x16.png'/>
						{footerNetwork}
					</div>
					<hr id="leftNavFooterHr" />
					<div id='leftNavFooterLinks' className='text-s'>
						<div style={{marginBottom: '8px'}}>Join us on <a className='leftNavFooterLink' href='https://github.com/Colored-Coins'>Github</a> or <a className='leftNavFooterLink' href='http://slack.coloredcoins.org'>Slack</a></div>
						<a className='leftNavFooterLink' href="mailto:contact@coloredcoins.org?Subject=Support%20call" target="_top">contact@coloredcoins.org</a>
					</div>
				</div>
			</div>
		);
	}
});