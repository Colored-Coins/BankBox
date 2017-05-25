var Paginator = React.createClass({
  propTypes: {
    max: React.PropTypes.number.isRequired,
    maxVisible: React.PropTypes.number,
    onChange: React.PropTypes.func.isRequired
  },
  getInitialState: function() {
    return {
      currentPage: 1,
      items: []
    };
  },

  componentDidUpdate: function(prevProps, prevState) {
    if (prevState.currentPage !== this.state.currentPage) {
      this.props.onChange(this.state.currentPage);
    }
  },
  getDefaultProps: function() {
    return {
      maxVisible: 5
    };
  },

  goTo: function(page) {
    this.setState({currentPage: page});
  },

  onClickNext: function() {
    var page = this.state.currentPage;

    if (page < this.props.max) {
      this.goTo(page + 1);
    }
  },
  onClickPrev: function() {
    if (this.state.currentPage > 1) {
      this.goTo(this.state.currentPage - 1);
    }
  },
  render: function() {
    var className = this.props.className || '',
      p = this.props,
      s = this.state,
      skip = 0;

    if (s.currentPage > p.maxVisible - 1 && s.currentPage < p.max) {
      skip = s.currentPage - p.maxVisible + 1;
    } else if (s.currentPage === p.max) {
      skip = s.currentPage - p.maxVisible;
    }

    var iterator = Array.apply(null, Array(p.maxVisible)).map(function(v, i) {
      return skip + i + 1;
    });
    return (
      <div className="paginator-container" style={this.props.paginatorStyle} >
        <div className={'dashboard-pagination ' + className}>
          <div className={s.currentPage === 1 ? 'disabled' : ''}>
            <a onClick={this.onClickPrev}>
              <span aria-hidden="true">&laquo;</span>
              <span className="sr-only">Prev</span>
            </a>
          </div>
          {iterator.map(function(page) {
            return (
              <div key={page}
                  onClick={this.goTo.bind(this, page)}
                  className={s.currentPage === page ? 'active' : ''}>
                <a >{page}</a>
              </div>
            );
          }, this)}
          <div className={s.currentPage === p.max ? 'disabled' : ''}>
            <a onClick={this.onClickNext}>
              <span aria-hidden="true">&raquo;</span>
              <span className="sr-only">Next</span>
            </a>
          </div>
        </div>
      </div>
    );
  }
});

