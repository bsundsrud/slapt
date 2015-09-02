import React from 'react';
import immutable from 'immutable';

var EditableText = React.createClass({
	/* props:
		value: String
		placeholder: String
		editing: boolean
		onChange: function(string)
		displayClasses: String
		editClasses: String
	*/
	getInitialState: function() {
		return {
			value: this.props.value || ''
		};
	},

	onChange: function(evt) {
		this.setState({value: evt.target.value});
		if (this.props.onChange) {
			this.props.onChange(evt.target.value);
		}
	},

	render: function() {
		if (this.props.editing) {
			return (
				<input type="text" className={this.props.editClasses}
								   value={this.state.value}
								   onChange={this.onChange}
								   placeholder={this.props.placeholder || ''} />
			)
		} else {
			var display = this.state.value || (<em>{this.props.defaultValue || ''}</em>);
			return (
				<span className={this.props.displayClasses}>{display}</span>
			)
		}
	}
});

var EditableTextWithLabel = React.createClass({
	/* props:
		value: String
		placeholder: String
		editing: boolean
		onChange: function(string)
		displayClasses: String
		editClasses: String
		label: String
		labelClasses: String
		controlGroupClasses: String
	*/
	getInitialState: function() {
		return {
			value: this.props.value || ''
		};
	},

	onChange: function(evt) {
		this.setState({value: evt.target.value});
		if (this.props.onChange) {
			this.props.onChange(evt.target.value);
		}
	},

	render: function() {
		if (this.props.editing) {
			return (
				<div className="form-group">
					<label className={this.props.labelClasses || 'control-label col-md-2 col-xs-12'}>
						{this.props.label}
					</label>
					<div className={this.props.controlGroupClasses || "col-md-10 col-xs-12"}>
						<input type="text" className={this.props.editClasses || 'form-control'}
										   value={this.state.value}
										   onChange={this.onChange}
										   placeholder={this.props.placeholder || ''} />
					</div>
				</div>
			)
		} else {
			var display = this.state.value || (<em>{this.props.defaultValue || ''}</em>);
			return (
				<div className="form-group">
					<label className={this.props.labelClasses || 'control-label col-md-2 col-xs-12'}>
						{this.props.label}
					</label>
					<div className={this.props.controlGroupClasses || "col-md-10 col-xs-12"}>
						<label className="control-label inline-display-control">{display}</label>
					</div>
				</div>
			)
		}
	}
});

module.exports = {
	EditableText: EditableText,
	EditableTextWithLabel: EditableTextWithLabel
};