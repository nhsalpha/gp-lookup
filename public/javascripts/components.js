"use strict";

var Application = React.createClass({
  displayName: "Application",

  getInitialState: function getInitialState() {
    return {
      searchText: this.props.initialSearchText,
      results: this.props.initialResults,
      maxResults: 20
    };
  },

  render: function render() {
    var numberOfResults = this.state.results !== null ? this.state.results.length : null,
        resultsList = null;

    if (numberOfResults) {
      resultsList = React.createElement(ResultsList, { practices: this.state.results,
        loadMoreResults: this.loadMoreResults,
        loadMoreHref: this.loadMoreHref() });
    }
    return React.createElement(
      "div",
      null,
      React.createElement(SearchForm, { searchText: this.state.searchText,
        numberOfResults: numberOfResults,
        handleSearchTextChange: this.handleSearchTextChange }),
      resultsList
    );
  },

  handleSearchTextChange: function handleSearchTextChange(newSearchText) {
    this.updateResults(newSearchText, 20);
  },

  loadMoreResults: function loadMoreResults() {
    this.updateResults(this.state.searchText, this.state.maxResults + 20);
  },

  loadMoreHref: function loadMoreHref() {
    var searchText = this.state.searchText.replace(" ", "+", "g"),
        maxResults = this.state.maxResults + 20;

    return "?search=" + searchText + "&max=" + maxResults;
  },

  updateResults: function updateResults(searchText, maxResults) {
    this.setState({
      searchText: searchText,
      maxResults: maxResults
    });

    if (searchText.length > 0) {
      search(searchText, maxResults).then((function (practices) {
        this.setState({
          results: practices
        });
      }).bind(this));
    } else {
      this.setState({
        results: null
      });
    }
  }
});

var SearchForm = React.createClass({
  displayName: "SearchForm",

  render: function render() {
    var hintSpan;

    if (null !== this.props.numberOfResults) {
      hintSpan = React.createElement(
        "span",
        { className: "hint" },
        this.props.numberOfResults,
        " results found for ",
        React.createElement(
          "span",
          { className: "visuallyhidden" },
          this.props.searchText
        )
      );
    } else {
      hintSpan = React.createElement(
        "span",
        { className: "hint" },
        "Practice name, address, GP name, postcode, etc."
      );
    }

    return React.createElement(
      "form",
      { name: "", id: "", action: "", method: "get", className: "gp-finder-search" },
      React.createElement(
        "div",
        { className: "block-container" },
        React.createElement(
          "h1",
          null,
          React.createElement(
            "label",
            { htmlFor: "search" },
            "Find your GP practice",
            hintSpan
          )
        ),
        React.createElement(
          "div",
          { className: "clearfix" },
          React.createElement("input", { type: "text", name: "search", id: "search", className: "form-control",
            value: this.props.searchText,
            onChange: this.onChange }),
          React.createElement(
            "button",
            { type: "submit", className: "button" },
            "Search"
          )
        )
      )
    );
  },

  onChange: function onChange(event) {
    this.props.handleSearchTextChange(event.target.value);
  }
});

var ResultsList = React.createClass({
  displayName: "ResultsList",

  render: function render() {
    var practiceResults = this.props.practices.map(function (practice, index) {
      return React.createElement(PracticeResult, { key: practice.code,
        practice: practice });
    });

    return React.createElement(
      "div",
      { className: "block-container" },
      React.createElement(
        "div",
        { className: "gp-finder-results", "aria-live": "polite" },
        practiceResults
      ),
      React.createElement(ResultsFooter, { loadMoreResults: this.props.loadMoreResults,
        loadMoreHref: this.props.loadMoreHref })
    );
  }
});

var PracticeResult = React.createClass({
  displayName: "PracticeResult",

  render: function render() {
    var practitioners = this.props.practice.practitioners.map((function (practitioner, index) {
      return React.createElement(
        "p",
        { className: "person" },
        React.createElement("img", { src: "/images/person-placeholder.svg", width: "45", height: "45", alt: "" }),
        " Dr. ",
        React.createElement("span", { dangerouslySetInnerHTML: this.highlightText(practitioner.value, practitioner.matches) })
      );
    }).bind(this)),
        href = "/book/" + this.props.practice.code;

    if (this.props.practice.score.distance) {
      var distance = React.createElement(
        "p",
        { className: "distance" },
        this.props.practice.score.distance,
        " miles away"
      );
    }

    return React.createElement(
      "a",
      { href: href, className: "result" },
      React.createElement("h2", { dangerouslySetInnerHTML: this.highlightText(this.props.practice.name.value, this.props.practice.name.matches) }),
      React.createElement("p", { className: "address", dangerouslySetInnerHTML: this.highlightText(this.props.practice.address.value, this.props.practice.address.matches) }),
      distance,
      practitioners
    );
  },

  highlightText: function highlightText(text, matches) {
    var startIndices = {},
        endIndices = {},
        output = [];

    matches.forEach(function (startEndPair) {
      startIndices[startEndPair[0]] = true;
      endIndices[startEndPair[1]] = true;
    });

    for (var i = 0; i < text.length + 1; i++) {
      if (startIndices[i]) {
        output += '<strong>';
      }
      if (endIndices[i - 1]) {
        output += '</strong>';
      }
      if (!!text[i]) {
        output += text[i];
      }
    }
    return { __html: output };
  }

});

var ResultsFooter = React.createClass({
  displayName: "ResultsFooter",

  render: function render() {
    return React.createElement(
      "footer",
      null,
      React.createElement(
        "p",
        null,
        "Looks like you got to the end. You can ",
        React.createElement(
          "a",
          {
            href: this.props.loadMoreHref, onClick: this.onClick },
          "load more results"
        ),
        ", or you can ",
        React.createElement(
          "label",
          { htmlFor: "search", style: { color: "blue",
              textDecoration: "underline" } },
          "try searching again"
        ),
        ". You can search for any of:"
      ),
      React.createElement(
        "ul",
        null,
        React.createElement(
          "li",
          null,
          "practice name"
        ),
        React.createElement(
          "li",
          null,
          "practice address"
        ),
        React.createElement(
          "li",
          null,
          "postcode"
        ),
        React.createElement(
          "li",
          null,
          "doctor’s name"
        )
      )
    );
  },

  onClick: function onClick(event) {
    event.preventDefault();
    event.stopPropagation();

    this.props.loadMoreResults();

    return false;
  }
});
