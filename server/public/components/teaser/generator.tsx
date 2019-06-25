import * as React from 'react';
import { stringify } from 'qs';

import { GoGear, GoLinkExternal } from 'react-icons/go';
import { Meta, MetaSpriteCollection } from '../../../types/meta';
import { Collapse, InputGroupButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { UncontrolledTooltip } from 'reactstrap';

type Props = {
  meta: Meta;
};

type State = {
  spriteCollection: MetaSpriteCollection;
  seed: string;
  gravatar: boolean;
  advancedOptions: {
    [key: string]: any;
  };
  showAdvancedOptions: boolean;
  spriteDropdownOpen: boolean;
};

export default class Generator extends React.Component<Props, State> {
  private seedInputRef: React.RefObject<HTMLInputElement>;

  constructor(props: Props) {
    super(props);

    this.state = {
      spriteCollection: props.meta.spriteCollections[0],
      seed: '',
      gravatar: false,
      advancedOptions: this.getSpriteCollectionAdvancedOptions(props.meta.spriteCollections[0]),
      showAdvancedOptions: false,
      spriteDropdownOpen: false
    };

    this.onChangeSpriteCollection = this.onChangeSpriteCollection.bind(this);
    this.onChangeSeed = this.onChangeSeed.bind(this);
    this.onToggleShowAdvancedOptions = this.onToggleShowAdvancedOptions.bind(this);
    this.onChangeAdvancedOptions = this.onChangeAdvancedOptions.bind(this);
    this.toggleSpriteDropdownOpen = this.toggleSpriteDropdownOpen.bind(this);
    this.onChangeGravatar = this.onChangeGravatar.bind(this);

    this.seedInputRef = React.createRef();
  }

  componentDidMount() {
    if (this.seedInputRef.current) {
      this.seedInputRef.current.focus();
    }
  }

  toggleSpriteDropdownOpen() {
    this.setState(prevState => {
      return {
        spriteDropdownOpen: !prevState.spriteDropdownOpen
      };
    });
  }

  getSpriteCollectionAdvancedOptions(spriteCollection: MetaSpriteCollection) {
    let advancedOptions = {};

    Object.keys(spriteCollection.options.fields)
      .filter(field => (spriteCollection.options.fields[field].meta ? true : false))
      .forEach(field => {
        let meta = spriteCollection.options.fields[field].meta;

        advancedOptions[field] = Array.isArray(meta.defaultValue) ? [...meta.defaultValue] : meta.defaultValue;
      });

    return advancedOptions;
  }

  onChangeSpriteCollection(e: React.MouseEvent<HTMLDivElement>) {
    this.props.meta.spriteCollections.forEach(spriteCollection => {
      if (spriteCollection.id === e.currentTarget.getAttribute('data-id')) {
        this.setState({
          spriteCollection: spriteCollection,
          advancedOptions: this.getSpriteCollectionAdvancedOptions(spriteCollection)
        });
      }
    });
  }

  onChangeSeed(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      seed: e.target.value
    });
  }

  onToggleShowAdvancedOptions(e: React.MouseEvent) {
    this.setState(prevState => {
      return {
        showAdvancedOptions: !prevState.showAdvancedOptions
      };
    });

    e.preventDefault();
  }

  onChangeGravatar(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      gravatar: e.target.checked
    });
  }

  onChangeAdvancedOptions(e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) {
    let target = e.target;

    this.setState(prevState => {
      let advancedOptions = prevState.advancedOptions;
      let meta = this.state.spriteCollection.options.fields[target.name].meta;

      switch (meta.type) {
        case 'select':
          advancedOptions[target.name] = target.value;

          break;

        case 'checkbox':
          let index = advancedOptions[target.name].indexOf(target.value);

          if (target['checked']) {
            if (-1 === index) {
              advancedOptions[target.name].push(target.value);
            }
          } else {
            if (index > -1) {
              advancedOptions[target.name].splice(index, 1);
            }
          }

          break;

        case 'switch':
          let values = meta.values;

          if (target['checked']) {
            advancedOptions[target.name] = values[1];
          } else {
            advancedOptions[target.name] = values[0];
          }

          break;

        case 'range':
          advancedOptions[target.name] = parseInt(target.value);

          break;
      }

      return {
        advancedOptions: advancedOptions
      };
    });
  }

  getAvatarUrl() {
    let options = {};

    Object.keys(this.state.spriteCollection.options.fields)
      .filter(key => (this.state.spriteCollection.options.fields[key].meta ? true : false))
      .map(key => {
        let defaultValue = this.state.spriteCollection.options.fields[key].meta.defaultValue;

        if (defaultValue !== this.state.advancedOptions[key]) {
          options[key] = this.state.advancedOptions[key];
        }
      });

    let params = stringify(
      {
        options: options,
        gravatar: this.state.gravatar ? this.state.seed : undefined
      },
      { encodeValuesOnly: true, arrayFormat: 'brackets' }
    );

    return `/v2/${this.state.spriteCollection.id}/${encodeURIComponent(this.state.seed)}.svg${
      params ? '?' + params : ''
    }`;
  }

  render() {
    let avatar = this.getAvatarUrl();

    return (
      <div className="min-vh-lg-100 d-flex align-items-center">
        <div className="w-100">
          <div className={`generator ${this.state.showAdvancedOptions ? 'position-sticky' : ''}`}>
            <div className="generator-body">
              <div className="generator-avatar">
                <a href={avatar} target="_blank">
                  <img src={avatar} alt="avatar" />
                </a>
              </div>
              <div className="generator-head">
                <div className="row">
                  <div className="col">
                    <a href="#" onClick={this.onToggleShowAdvancedOptions} id="ShowAdvancedOptionsTooltip">
                      <GoGear size={20} />
                    </a>
                    <UncontrolledTooltip placement="top" target="ShowAdvancedOptionsTooltip">
                      Advanced options
                    </UncontrolledTooltip>
                  </div>
                  <div className="col text-right">
                    <a href={avatar} target="_blank" id="OpenNewTabTooltip">
                      <GoLinkExternal size={20} />
                    </a>
                    <UncontrolledTooltip placement="top" target="OpenNewTabTooltip">
                      Open in new tab
                    </UncontrolledTooltip>
                  </div>
                </div>
              </div>

              <div className="input-group">
                <InputGroupButtonDropdown
                  addonType="prepend"
                  isOpen={this.state.spriteDropdownOpen}
                  toggle={this.toggleSpriteDropdownOpen}
                >
                  <DropdownToggle outline caret>
                    {this.state.spriteCollection.id}
                  </DropdownToggle>
                  <DropdownMenu>
                    {this.props.meta.spriteCollections.map(spritecollection => {
                      return (
                        <DropdownItem
                          key={spritecollection.id}
                          onClick={this.onChangeSpriteCollection}
                          data-id={spritecollection.id}
                        >
                          {spritecollection.id}
                        </DropdownItem>
                      );
                    })}
                  </DropdownMenu>
                </InputGroupButtonDropdown>
                <input
                  ref={this.seedInputRef}
                  className="form-control form-control-lg text-center"
                  placeholder="your-custom-seed"
                  value={this.state.seed}
                  onChange={this.onChangeSeed}
                  maxLength={512}
                />
              </div>
              <small className="form-text text-muted text-center">Don't use sensitive or personal data as seed!</small>
            </div>
          </div>

          <Collapse isOpen={this.state.showAdvancedOptions}>
            <div className="generator generator--options">
              <div className="generator-body">
                <div className="form-group row">
                  <label htmlFor="gravatar" className={`col-sm-3 col-form-label py-0 pr-0`}>
                    gravatar
                  </label>
                  <div className="col-sm-9">
                    <div className="custom-control custom-switch">
                      <input
                        id="gravatar"
                        name="gravatar"
                        type="checkbox"
                        className="custom-control-input"
                        onChange={this.onChangeGravatar}
                        checked={this.state.gravatar}
                      />
                      <label className="custom-control-label" htmlFor="gravatar" />
                    </div>
                  </div>
                </div>
                {Object.keys(this.state.spriteCollection.options.fields)
                  .filter(key => (this.state.spriteCollection.options.fields[key].meta ? true : false))
                  .map(key => {
                    let field = this.state.spriteCollection.options.fields[key].meta;
                    let id = 'advanced_' + key;

                    return (
                      <div className="form-group row" key={key}>
                        <label
                          htmlFor={id}
                          className={`col-sm-3 col-form-label ${field.type !== 'select' ? 'py-0' : ''} pr-0`}
                          title={key}
                        >
                          {key}
                        </label>
                        <div className="col-sm-9">
                          {field.type === 'select' ? (
                            <select
                              id={id}
                              name={key}
                              className="custom-select"
                              value={this.state.advancedOptions[key]}
                              onChange={this.onChangeAdvancedOptions}
                            >
                              {field.values.map(value => (
                                <option key={value}>{value}</option>
                              ))}
                            </select>
                          ) : (
                            ''
                          )}

                          {field.type === 'checkbox'
                            ? field.values.map(value => (
                                <div className="custom-control custom-switch" key={value}>
                                  <input
                                    name={key}
                                    type="checkbox"
                                    className="custom-control-input"
                                    id={id + '_' + value}
                                    checked={this.state.advancedOptions[key].indexOf(value) !== -1}
                                    onChange={this.onChangeAdvancedOptions}
                                    value={value}
                                  />
                                  <label className="custom-control-label" htmlFor={id + '_' + value}>
                                    {value}
                                  </label>
                                </div>
                              ))
                            : ''}

                          {field.type === 'range' ? (
                            <input
                              id={id}
                              name={key}
                              type="range"
                              className="d-block custom-range"
                              min={field.values[0]}
                              max={field.values[1]}
                              onChange={this.onChangeAdvancedOptions}
                              value={this.state.advancedOptions[key]}
                            />
                          ) : (
                            ''
                          )}

                          {field.type === 'switch' ? (
                            <div className="custom-control custom-switch">
                              <input
                                id={id}
                                name={key}
                                type="checkbox"
                                className="custom-control-input"
                                onChange={this.onChangeAdvancedOptions}
                                checked={this.state.advancedOptions[key] == field.values[1]}
                              />
                              <label className="custom-control-label" htmlFor={id} />
                            </div>
                          ) : (
                            ''
                          )}
                        </div>
                      </div>
                    );
                  })}
                <div className="form-group">
                  <small className="form-text text-muted text-center d-block">
                    See{' '}
                    <a
                      href={`https://www.npmjs.com/package/${this.state.spriteCollection.name}#options`}
                      target="_blank"
                      className="text-reset"
                    >
                      README.md
                    </a>{' '}
                    for advanced options
                  </small>
                </div>
              </div>
            </div>
          </Collapse>

          <Collapse isOpen={!this.state.showAdvancedOptions}>
            <div className="generator-create-your-own">
              Create your own
              <img src="/static/img/arrow.svg" alt="arrow" />
            </div>
          </Collapse>
        </div>
      </div>
    );
  }
}
