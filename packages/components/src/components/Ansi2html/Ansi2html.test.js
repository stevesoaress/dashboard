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
import { renderWithIntl } from '../../utils/test';
import Ansi2html from './Ansi2html';

const getElement = (text, query) => {
  const { queryByText } = renderWithIntl(<Ansi2html>{text}</Ansi2html>);
  const queryRegex = new RegExp(query, 'i');
  return queryByText(queryRegex);
};

describe('Ansi2html', () => {
  it('displays text', () => {
    const element = getElement('Hello World', 'Hello World');
    expect(element).toBeTruthy();
  });

  it('displays green text', () => {
    const element = getElement('\u001b[32mHello World\u001b[0m', 'Hello World');
    expect(element.outerHTML).toBe(
      '<span style="color: rgb(0, 128, 0);">Hello World</span>'
    );
  });

  it('displays red text', () => {
    const element = getElement('\u001b[31mHello World\u001b[0m', 'Hello World');
    expect(element.outerHTML).toBe(
      '<span style="color: rgb(128, 0, 0);">Hello World</span>'
    );
  });

  it('displays yellow text', () => {
    const element = getElement('\u001b[33mHello World\u001b[0m', 'Hello World');
    expect(element.outerHTML).toBe(
      '<span style="color: rgb(128, 128, 0);">Hello World</span>'
    );
  });

  it('displays blue text', () => {
    const element = getElement('\u001b[34mHello World\u001b[0m', 'Hello World');
    expect(element.outerHTML).toBe(
      '<span style="color: rgb(0, 0, 128);">Hello World</span>'
    );
  });

  it('displays cyan background', () => {
    const element = getElement('\u001b[46mHello World\u001b[0m', 'Hello World');
    expect(element.outerHTML).toBe(
      '<span style="background-color: rgb(0, 128, 128);">Hello World</span>'
    );
  });

  it('displays silver background', () => {
    const element = getElement('\u001b[47mHello World', 'Hello World');
    expect(element.outerHTML).toBe(
      '<span style="background-color: rgb(192, 192, 192);">Hello World</span>'
    );
  });

  it('displays purple background', () => {
    const element = getElement('\u001b[45mHello World', 'Hello World');
    expect(element.outerHTML).toBe(
      '<span style="background-color: rgb(128, 0, 128);">Hello World</span>'
    );
  });

  it('displays red text without a trailing reset', () => {
    const element = getElement('\u001b[36mHello', 'Hello');
    expect(element.outerHTML).toBe(
      '<span style="color: rgb(0, 128, 128);">Hello</span>'
    );
  });

  it('displays red on blue', () => {
    const element = getElement('\u001b[31;44mHello', 'Hello');
    expect(element.outerHTML).toBe(
      '<span style="color: rgb(128, 0, 0); background-color: rgb(0, 0, 128);">Hello</span>'
    );
  });

  it('resets colors after red on blue', () => {
    const element = getElement('\u001b[31;44mHello\u001b[0m world', 'Hello');
    expect(element.outerHTML).toBe(
      '<span style="color: rgb(128, 0, 0); background-color: rgb(0, 0, 128);">Hello</span>'
    );
    expect(element.nextElementSibling.outerHTML).toBe('<span> world</span>');
  });

  it('performs color change from red/blue to yellow/blue', () => {
    const element = getElement('\u001b[31;44mHello\u001b[33m world', 'Hello');
    expect(element.outerHTML).toBe(
      '<span style="color: rgb(128, 0, 0); background-color: rgb(0, 0, 128);">Hello</span>'
    );
    expect(element.nextElementSibling.outerHTML).toBe(
      '<span style="color: rgb(128, 128, 0); background-color: rgb(0, 0, 128);"> world</span>'
    );
  });

  it('performs color change from red/blue to yellow/blue', () => {
    const element = getElement(
      '\u001b[31;44mHello\u001b[33;42m world',
      'Hello'
    );
    expect(element.outerHTML).toBe(
      '<span style="color: rgb(128, 0, 0); background-color: rgb(0, 0, 128);">Hello</span>'
    );
    expect(element.nextElementSibling.outerHTML).toBe(
      '<span style="color: rgb(128, 128, 0); background-color: rgb(0, 128, 0);"> world</span>'
    );
  });

  it('ignores unsupported codes', () => {
    const element = getElement('\u001b[51mHello\u001b[0m', 'Hello');
    expect(element.outerHTML).toBe('<span>Hello</span>');
  });

  it('displays light red', () => {
    const element = getElement('\u001b[91mHello\u001b[0m', 'Hello');
    expect(element.outerHTML).toBe(
      '<span style="color: rgb(255, 0, 0);">Hello</span>'
    );
  });

  it('displays light red', () => {
    const element = getElement('\u001b[101mHello\u001b[0m', 'Hello');
    expect(element.outerHTML).toBe(
      '<span style="background-color: rgb(255, 0, 0);">Hello</span>'
    );
  });

  it('sets background xterm color', () => {
    const element = getElement('\u001b[48;5;200mHello', 'Hello');
    expect(element.outerHTML).toBe(
      '<span style="background-color: rgb(255, 0, 215);">Hello</span>'
    );
  });

  it('sets foreground xterm color', () => {
    const element = getElement('\u001b[38;5;100mHello', 'Hello');
    expect(element.outerHTML).toBe(
      '<span style="color: rgb(135, 135, 0);">Hello</span>'
    );
  });

  it('displays bold text', () => {
    const element = getElement('\u001b[1mHello', 'Hello');
    expect(element.outerHTML).toBe(
      '<span style="font-weight: bold;">Hello</span>'
    );
  });

  it('can reset bold text', () => {
    const element = getElement('\u001b[1mHello\u001b[21m world', 'Hello');
    const element2 = getElement('\u001b[1mHello\u001b[22m world', 'Hello');
    expect(element.nextElementSibling.outerHTML).toBe('<span> world</span>');
    expect(element2.nextElementSibling.outerHTML).toBe('<span> world</span>');
  });

  it('displays italic text', () => {
    const element = getElement('\u001b[3mHello', 'Hello');
    expect(element.outerHTML).toBe(
      '<span style="font-style: italic;">Hello</span>'
    );
  });

  it('can reset italic text', () => {
    const element = getElement('\u001b[3mHello\u001b[23m world', 'Hello');
    expect(element.outerHTML).toBe(
      '<span style="font-style: italic;">Hello</span>'
    );
    expect(element.nextElementSibling.outerHTML).toBe('<span> world</span>');
  });

  it('displays underline text', () => {
    const element = getElement('\u001b[4mHello', 'Hello');
    expect(element.outerHTML).toBe(
      '<span style="text-decoration: underline;">Hello</span>'
    );
  });

  it('can resets underline text', () => {
    const element = getElement('\u001b[4mHello\u001b[24m world', 'Hello');
    expect(element.outerHTML).toBe(
      '<span style="text-decoration: underline;">Hello</span>'
    );
    expect(element.nextElementSibling.outerHTML).toBe('<span> world</span>');
  });

  it('displays concealed text', () => {
    const element = getElement('\u001b[8mHello', 'Hello');
    expect(element.outerHTML).toBe(
      '<span style="visibility: hidden;">Hello</span>'
    );
  });

  it('can resets concealed text', () => {
    const element = getElement('\u001b[8mHello\u001b[28m world', 'Hello');
    expect(element.outerHTML).toBe(
      '<span style="visibility: hidden;">Hello</span>'
    );
    expect(element.nextElementSibling.outerHTML).toBe('<span> world</span>');
  });

  it('displays cross text', () => {
    const element = getElement('\u001b[9mHello', 'Hello');
    expect(element.outerHTML).toBe(
      '<span style="text-decoration: line-through;">Hello</span>'
    );
  });

  it('can resets cross text', () => {
    const element = getElement('\u001b[9mHello\u001b[29m world', 'Hello');
    expect(element.outerHTML).toBe(
      '<span style="text-decoration: line-through;">Hello</span>'
    );
    expect(element.nextElementSibling.outerHTML).toBe('<span> world</span>');
  });

  it('display links', () => {
    const element = getElement(
      'A dashboard for Tekton! https://github.com/tektoncd/dashboard',
      'A dashboard for Tekton!'
    );
    expect(element.nextElementSibling.outerHTML).toBe(
      '<a href="https://github.com/tektoncd/dashboard">https://github.com/tektoncd/dashboard</a>'
    );
  });

  it('display links with styles', () => {
    const element = getElement(
      'A dashboard for Tekton!\u001b[9m\u001b[48;5;194mhttps://github.com/tektoncd/dashboard',
      'A dashboard for Tekton!'
    );
    expect(element.nextElementSibling.outerHTML).toBe(
      '<a href="https://github.com/tektoncd/dashboard" style="background-color: rgb(215, 255, 215); text-decoration: line-through;">https://github.com/tektoncd/dashboard</a>'
    );
  });

  it('seperates text by new lines', () => {
    const text =
      'Hello World\nA dashboard for Tekton! https://github.com/tektoncd/dashboard\nTekon is cool!';
    const { container } = renderWithIntl(<Ansi2html>{text}</Ansi2html>);
    expect(container.childNodes).toHaveLength(3);
  });

  it('seperates text by new lines and carriage returns', () => {
    const text = '\r \n \r \n\r \n';
    const { container } = renderWithIntl(<Ansi2html>{text}</Ansi2html>);
    expect(container.childNodes).toHaveLength(4);
  });
});
