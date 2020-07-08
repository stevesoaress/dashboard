/*
Copyright 2019 The Tekton Authors
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
import colors from 'colors';
import { renderWithIntl } from '../../utils/test';
import Ansi2html from './Ansi2html';

colors.enable();

describe('Ansi2html', () => {
  it('can display text', () => {
    const { queryByText } = renderWithIntl(<Ansi2html>hello world</Ansi2html>);
    const element = queryByText(/hello world/i);
    expect(element.tagName).toBe('SPAN');
    expect(element).toBeTruthy();
  });

  it('can convert ANSI escape codes to multiple class names', () => {
    const { queryByText } = renderWithIntl(
      <Ansi2html>{'hello world'.red.underline.bgBlack}</Ansi2html>
    );
    const element = queryByText(/hello world/i);
    expect(element).toBeTruthy();
    expect(element.outerHTML).toBe(
      '<span style="text-decoration: underline; color: rgb(204, 0, 0); background: rgb(0, 0, 0);">hello world</span>'
    );
  });

  it('has multiple elements for line seperated logs', () => {
    const { queryByText } = renderWithIntl(
      <Ansi2html>
        {`${'hello world1'.red.underline.bgBlack}\n${
          'hello world2'.blue.italic.bgCyan
        }`}
      </Ansi2html>
    );
    const element = queryByText(/hello world1/i);
    expect(element).toBeTruthy();
    const element2 = queryByText(/hello world2/i);
    expect(element2).toBeTruthy();
  });

  it('can have links', () => {
    const { queryByText } = renderWithIntl(
      <Ansi2html>this is a link https://google.com</Ansi2html>
    );
    const element = queryByText(/this is a link/i);
    expect(element).toBeTruthy();
    expect(element.innerHTML).toBe(
      'this is a link <a href="https://google.com">https://google.com</a>'
    );
  });
});
