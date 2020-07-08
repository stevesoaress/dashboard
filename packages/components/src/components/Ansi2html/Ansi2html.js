/*
Copyright 2019-2020 The Tekton Authors
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import React from 'react';
import PropTypes from 'prop-types';
import { escapeCarriageReturn } from 'escape-carriage';
import { parse } from 'ansicolor';
import Linkify from 'react-linkify';

import './Ansi.scss';

const convertCSSToStyle = css => {
  if (css === '') {
    return {};
  }
  const style = {};
  css.split(';').forEach(element => {
    if (element !== '') {
      const [key, value] = element.split(':');
      style[key] = value;
    }
  });
  return style;
};

const logMessage = line => {
  const escapedText = escapeCarriageReturn(line);
  const parsed = parse(escapedText);
  return (
    <Linkify>
      {parsed.spans.map(({ text, css }) => {
        const attributes = {
          text,
          style: convertCSSToStyle(css)
        };
        return <span style={attributes.style}>{attributes.text}</span>;
      })}
    </Linkify>
  );
};

const Ansi2html = ({ children }) => {
  return logMessage(children);
};

Ansi2html.propTypes = {
  children: PropTypes.string.isRequired
};

export default Ansi2html;
