var Alerts = React.createClass({
	render: function() {
		var list = this.props.alerts;

		if (!list.length)
			list = [{alertText: "No Notifications", alertID: "0"}];

		var alertList = list.map(function (item, i) {
			return (
				<Alert data={item} key={"alert"+ item.alertID} />
			);
		});

		return (
			<div id="notifyAlerts">
				{alertList}
			</div>
		);
	}

});

var Alert = React.createClass({
	render: function() {
		var alert = <a href={this.props.data.alertLink}>{this.props.data.alertText}</a>
		if (!this.props.data.alertLink)
			alert = this.props.data.alertText;

		return (
			<div className="text-left notifyItem">
				{alert}
			</div>
		);
	}
});