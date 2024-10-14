import React from 'react';
import ReactDOM from 'react-dom';
import NFTInfo from './NFTInfo';

it('It should mount', () => {
  const div = document.createElement('div');
  ReactDOM.render(<NFTInfo />, div);
  ReactDOM.unmountComponentAtNode(div);
});