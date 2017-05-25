var Test = React.createClass({
	test: function (event) {
		event.preventDefault();
		alert(event.target.id);
	},
	render: function() {
		return (
			<form onSubmit={this.test} data-toggle="validator" id="testform">
				<input type="text" required/>
				<button type="submit">submit</button>
			</form>
		)
	}
})