import React, { Component } from 'react';
import { connect } from 'react-redux';

import { createSearch } from '../actions/searchActions';
import { IAction } from '../interfaces/redux';

interface IProps { createSearch: (name: string, url: string) => IAction<any>; }
interface IState { [key: string]: string; name: string; url: string; }

class GenerateSearch extends Component<IProps, IState> {
  public state = {
    name: '',
    url: '',
    label: '',
    error: '',
  };

  private handleChange = (e: React.FormEvent<any>) => {
    e.preventDefault();
    this.setState({ [e.currentTarget.name]: e.currentTarget.value });
  }

  private handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { name, url } = this.state;
    const action = this.props.createSearch(name, url);
    this.setState({ label: 'Parsing google images' });
    action.then(() => {
      this.setState({ name: '', url: '', error: '', label: 'Finished uploading images' });
    }).catch(() => {
      this.setState({ error: 'Error submitting form' });
    });
  }

  private handleCancel = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    this.setState({ name: '', url: '', error: '', label: '' });
  }

  public render() {
    const { error, label, name, url } = this.state;
    return (
      <div className="generate_search__container">
        <form onSubmit={this.handleSubmit} >
          <label htmlFor="name">
            <h3>Name:</h3>
            <input id="name" name="name" value={name} onChange={this.handleChange} />
          </label>
          <label htmlFor="name">
            <h3>Google image Url:</h3>
            <textarea id="url" name="url" value={url} onChange={this.handleChange} />
          </label>
          {label ? <div className="generate_search__label">{label}</div> : null}
          {error ? <div className="generate_search__error">{error}</div> : null}
          <div className="generate_search__buttons">
            <button type="submit">Start Search</button>
            <button type="button" onClick={this.handleCancel} >Clear Form</button>
          </div>
        </form>
      </div>
    );
  }
}

export default connect<{}, {}, {}>(null, { createSearch })(GenerateSearch);
