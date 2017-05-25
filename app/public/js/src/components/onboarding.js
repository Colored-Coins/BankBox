var Onboarding = React.createClass({
  getInitialState: function () {
    return {}
  },
  render: function () {
    console.log('Onboarding.render: this.props.step =', this.props.step)
    return (
      <div id='onboarding'>
        <Welcome/>
        <hr id='mainSeparator' />
        <div style={{paddingLeft: '8px', paddingRight: '8px'}}>
          <OnboardingContent step={this.props.step} scanProgress={this.props.scanProgress} financeAddress={this.props.financeAddress} createWallet={this.props.createWallet}/>
        </div>
      </div>
    )
  }
})

var Welcome = React.createClass({
  render: function () {
    return (
      <div style={{paddingLeft: '8px'}}>
        <h1 className='title-xxl'>BankBox</h1>
        <h2 className='title-xl' style={{marginTop: '16px'}}>A digital currency issuance<br/>and management dashboard</h2>
      </div>
    )
  }
})

var OnboardingContent = React.createClass({
  getInitialState: function () {
    return {mnemonic: ''}
  },
  handleMnemonicChange: function (event) {
    console.log('OnboardingContent.handleMnemonicChange: event.target.value =', event.target.value)
    this.setState({mnemonic: event.target.value})
  },
  openWallet: function () {
    localStorage['mnemonic'] = this.state.mnemonic
    this.props.createWallet({reindex: true})
    window.location.href = '/'
  },
  createWallet: function () {
    localStorage['mnemonic'] = ColoredCoins.generateMnemonic()
    window.location.href = '/'
  },
  render: function () {
    console.log('OnboardingContent.render: this.props =', this.props)
    var step = this.props.step || 'chooseMethod'

    if (step === 'chooseMethod') {
      return (
        <p>
          <a id="createNewWallet" className="btn btn-highlight btn-xl" onClick={this.createWallet} role="button">Create a new Wallet</a>
          <a className="btn btn-regular btn-xl" href="/#/login/useExisting" role="button">Use an existing Wallet</a>
        </p>
      )
    }

    if (step === 'useExisting') {
      var enabled = ColoredCoins.validateMnemonic(this.state.mnemonic)
      return (
        <div>
          <div style={{width: '500px'}}>
            <h1 className='title-l'>Use an existing Wallet</h1>
            <p className='text-m' style={{marginBottom: '16px'}}>Please enter a <a href="https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki" target="_blank" style={{color: "blue"}}>BIP39</a> compatible mnemonic:</p>
            <textarea id='mnemonicTextArea' className='form-control' placeholder='12 words passphrase' rows='3' onChange={this.handleMnemonicChange} value={this.state.mnemonic}></textarea>
            <p style={{position: 'relative'}}>
              <a id="cancelUseExistingWallet" className="btn btn-regular btn-l" href='/#/login/chooseMethod' role="button">Cancel</a>
              <a id="openExistingWallet" className={"btn btn-highlight btn-l" + (enabled ? '' : ' disabled')} onClick={this.openWallet} role="button">Open Wallet</a>
            </p>
          </div>
        </div>
      )
    }

    if (step === 'scan') {
      var now = Date.now()
      var firstBlockTime = network === 'testnet' ? 1296688602000 : 1231006505000
      var totalTime = now - firstBlockTime
      var lastScannedBlockTime = this.props.scanProgress.lastBlockTime
      var percent = Math.round(((lastScannedBlockTime - firstBlockTime) / totalTime) * 100)
      var behindText
      var diff = timediff(lastScannedBlockTime, now)

      function toPluralOrSingular (amount, singularText) {
        return amount + ' ' + ((amount === 1) ? singularText : (singularText + 's'))
      }

      if (diff.years) {
        behindText = toPluralOrSingular(diff.years, 'year') + (diff.months ? (', ' + toPluralOrSingular(diff.months, 'month')) : '') + ' behind'
      } else if (diff.months) {
        behindText = toPluralOrSingular(diff.months, 'month') + (diff.weeks ? (', ' + toPluralOrSingular(diff.weeks, 'week')) : '') + ' behind'
      } else if (diff.weeks) {
        behindText = toPluralOrSingular(diff.weeks, 'week') + (diff.days ? (', ' + toPluralOrSingular(diff.days, 'day')) : '') + ' behind'
      } else {
        behindText = toPluralOrSingular(diff.days, 'day') + ' behind'
      }

      var explanationText = 'Bitcoin core '
      if (network === 'testnet') {
        explanationText += '(Testnet) '
      }
      explanationText += 'was installed and your local copy of the blockchain is currently being downloaded to your computer.'
      
      return (
        <div>
          <h1 className='title-l'>Fetching data...</h1>
          <div>
            <p className='text-m' style={{marginBottom: '16px'}}>
              {explanationText}
            </p>
            <div id="scanProgressBarWrapper" style={{marginBottom: '16px'}}>
              <div id="scanProgressBarActive" style={{width: percent + '%'}}/>
            </div>
            <p>{behindText}</p>
          </div>
        </div>
      )
    }

    if (step === 'sendFunds') {
      var coinsText = (network === 'testnet' ? ' Testnet coins' : ' Bitcoins');
      return (
        <div>
          <h1 className='title-l'>Funds required</h1>
          <div id='onboarding-div'>
            <p className='text-m'>
              Blockchain data was synced successfully - but your wallet balance is insufficient.<br />
              Send some {coinsText} to your address in order to fund your transactions:
            </p>
            <div className='highlightAddress text-m' style={{marginLeft: '16px'}}>{this.props.financeAddress}</div>
            <p>Once the funds are received you can continue to the next step.</p>
          </div>
          <img id='financeAddressQr' src={"/generateQR?address=" + this.props.financeAddress + "&src=true"} width='164px' height='164px'/>
        </div>
      )
    }

    if (step === 'getStarted') {
      return (
        <div>
          <h1 className='title-l'>Congratulations!</h1>
          <p className='text-m onboarding-content' style={{marginBottom: '32px'}}>
            Your wallet is fully synced.
            Go ahead and start using BankBox by issuing your first asset.
          </p>
          <a id="issueAssetBtn" className="btn btn-highlight btn-xl" href='/#/newAsset' role="button">Issue cryptocurrency<img src="/img/assets/icon-issueAsset.png"/></a>
        </div>
      )
    }
  }
})