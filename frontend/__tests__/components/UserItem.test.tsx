import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { expect } from 'chai';

import User from '@/models/User';
import UserItem from '@/components/UserItem';

describe('UserItem', () => {
  let wrapper: ShallowWrapper;
  const props = {
    user: new User({
      id: 3,
      first: 'Bob',
      last: 'Smith',
    }),
  };

  beforeEach(() => {
    wrapper = shallow(<UserItem {...props} />);
  });

  it('has the correct container class', () => {
    expect(wrapper.find('.user_item__container').length).to.equal(1);
  });

  it('has a link with the correct to prop', () => {
    const expected = `/${props.user.id}`;
    expect(wrapper.find('Link').prop('to')).to.equal(expected);
  });

  it('has a span with the correct text', () => {
    const { id, first, last } = props.user;
    const expected = `${id}. ${first} ${last}`;
    expect(wrapper.find('span').text()).to.equal(expected);
  });
});
