/*
Copyright 2020-2025 The Tekton Authors
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
/* istanbul ignore file */

import tlds from 'tlds';
import LinkifyIt from 'linkify-it';
import { classNames } from '@tektoncd/dashboard-utils';

import { colors } from './defaults';
import FormattedDate from '../FormattedDate';

const linkifyIt = LinkifyIt().tlds(tlds);

// eslint-disable-next-line no-control-regex
const ansiRegex = /^\u001b([@-_])(.*?)([@-~])/;
const characterRegex = /[^]/m;
// Collapsible section markers
// Section start: \e[0Ksection_start:UNIX_TIMESTAMP:SECTION_NAME\r\e[0K
// Section end: \e[0Ksection_end:UNIX_TIMESTAMP:SECTION_NAME\r\e[0K
const sectionStartRegex = /\x1b\[0Ksection_start:(\d+):([^\r]+)\r\x1b\[0K(.*)$/;
const sectionEndRegex = /\x1b\[0Ksection_end:(\d+):([^\r]+)\r\x1b\[0K/;

const getDecoratedLevel = level => {
  if (!level) {
    return null;
  }

  return (
    <>
      <span className="tkn--log-line--level">{level}</span>{' '}
    </>
  );
};

const getXtermColor = commandStack => {
  if (commandStack.length >= 2 && commandStack[0] === '5') {
    commandStack.shift();
    const colorIndex = +commandStack.shift();
    if (colorIndex >= 0 && colorIndex <= 255) {
      return colors[colorIndex];
    }
  }
  return null;
};

const createFormattedString = (str, styleObj, className) => {
  const hasStyles = styleObj.color || styleObj.backgroundColor || className;
  if (hasStyles) {
    return (
      <span style={styleObj} className={className}>
        {str}
      </span>
    );
  }
  return str;
};

const linkify = (str, styleObj, classNameString) => {
  const className = classNameString || undefined;
  if (!str) {
    return null;
  }
  const matches = linkifyIt.match(str);
  if (!matches) {
    return createFormattedString(str, styleObj, className);
  }
  const elements = [];
  let offset = 0;
  matches.forEach(match => {
    if (match.index > offset) {
      const string = str.substring(offset, match.index);
      elements.push(createFormattedString(string, styleObj, className));
    }
    elements.push(
      <a
        href={match.url}
        style={styleObj}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {match.text}
      </a>
    );
    offset = match.lastIndex;
  });

  if (str.length > offset) {
    const string = str.substring(offset, str.length);
    elements.push(createFormattedString(string, styleObj, className));
  }
  return elements;
};

const LogFormat = ({
  fields = { message: true },
  logs = [],
  onToggleGroup
}) => {
  let properties = {
    classes: {},
    foregroundColor: null,
    foregroundColorClass: null,
    backgroundColor: null,
    backgroundColorClass: null
  };

  let styles = {};
  let text = '';
  let line = [];

  // Track collapsible sections
  const sections = new Map(); // sectionName -> { startIndex, endIndex, timestamp, header, expanded }
  const sectionStack = []; // Track nested sections

  const reset = () => {
    properties = {
      classes: {},
      foregroundColor: null,
      foregroundColorClass: null,
      backgroundColor: null,
      backgroundColorClass: null
    };
  };

  const enableTextStyle = flag => {
    const className = `tkn--ansi--text--${flag}`;
    properties.classes[className] = true;
  };

  const disableTextStyle = flag => {
    const className = `tkn--ansi--text--${flag}`;
    properties.classes[className] = false;
  };

  const setFGColor = color => {
    properties.foregroundColorClass = color && `tkn--ansi--color-fg--${color}`;
  };

  const setBGColor = color => {
    properties.backgroundColorClass = color && `tkn--ansi--color-bg--${color}`;
  };

  const setFGColor256 = commandStack => {
    properties.foregroundColor = getXtermColor(commandStack);
  };

  const setBGColor256 = commandStack => {
    properties.backgroundColor = getXtermColor(commandStack);
  };

  const setProperties = {
    0: () => reset(),
    1: () => enableTextStyle('bold'),
    3: () => enableTextStyle('italic'),
    4: () => enableTextStyle('underline'),
    8: () => enableTextStyle('conceal'),
    9: () => enableTextStyle('cross'),

    21: () => disableTextStyle('bold'),
    22: () => disableTextStyle('bold'),
    23: () => disableTextStyle('italic'),
    24: () => disableTextStyle('underline'),
    28: () => disableTextStyle('conceal'),
    29: () => disableTextStyle('cross'),

    30: () => setFGColor('black'),
    31: () => setFGColor('red'),
    32: () => setFGColor('green'),
    33: () => setFGColor('yellow'),
    34: () => setFGColor('blue'),
    35: () => setFGColor('magenta'),
    36: () => setFGColor('cyan'),
    37: () => setFGColor('white'),
    38: s => setFGColor256(s),
    39: () => setFGColor(null),

    40: () => setBGColor('black'),
    41: () => setBGColor('red'),
    42: () => setBGColor('green'),
    43: () => setBGColor('yellow'),
    44: () => setBGColor('blue'),
    45: () => setBGColor('magenta'),
    46: () => setBGColor('cyan'),
    47: () => setBGColor('white'),
    48: s => setBGColor256(s),
    49: () => setBGColor(null),

    90: () => setFGColor('bright-black'),
    91: () => setFGColor('bright-red'),
    92: () => setFGColor('bright-green'),
    93: () => setFGColor('bright-yellow'),
    94: () => setFGColor('bright-blue'),
    95: () => setFGColor('bright-magenta'),
    96: () => setFGColor('bright-cyan'),
    97: () => setFGColor('bright-white'),

    100: () => setBGColor('bright-black'),
    101: () => setBGColor('bright-red'),
    102: () => setBGColor('bright-green'),
    103: () => setBGColor('bright-yellow'),
    104: () => setBGColor('bright-blue'),
    105: () => setBGColor('bright-magenta'),
    106: () => setBGColor('bright-cyan'),
    107: () => setBGColor('bright-white')
  };

  const setStyle = (command, stack) => {
    if (setProperties[command]) {
      setProperties[command](stack);
    }
  };

  const evaluateCommandStack = stack => {
    const command = stack.shift();
    if (!command) {
      return;
    }
    setStyle(command, stack);
    evaluateCommandStack(stack);
  };

  const handleSequence = s => {
    const indicator = s[1];
    const commands = s[2].split(';');
    const terminator = s[3];

    if (indicator !== '[' && terminator !== 'm') {
      return;
    }

    const tag = linkify(
      text,
      styles,
      classNames(
        properties.foregroundColorClass,
        properties.backgroundColorClass,
        properties.classes
      )
    );
    if (tag) {
      line = line.concat(tag);
    }

    text = '';

    if (commands.length === 0) {
      reset();
    }

    evaluateCommandStack(commands);

    styles = {
      color: properties.foregroundColor,
      backgroundColor: properties.backgroundColor
    };
  };

  const parse = (log, index) => {
    const {
      command,
      expanded,
      groupIndex = null,
      level,
      message = '',
      timestamp,
      sectionName = null,
      sectionHeader = null,
      sectionExpanded = true,
      isInSection = false
    } = log;
    if (!message?.length && !timestamp && !level) {
      return <br key={index} />;
    }

    // Check for section markers in the message
    const sectionStartMatch = message.match(sectionStartRegex);
    const sectionEndMatch = message.match(sectionEndRegex);

    if (sectionStartMatch) {
      const [, sectionTimestamp, name, headerText] = sectionStartMatch;

      // Parse ANSI codes in the header text
      let headerLine = [];
      let headerOffset = 0;
      let parsedHeader = '';

      while (headerOffset !== headerText.length) {
        const str = headerText.substring(headerOffset);
        const controlSequence = str.match(ansiRegex);
        if (controlSequence) {
          headerOffset += controlSequence.index + controlSequence[0].length;
          handleSequence(controlSequence);
        } else {
          const character = str.match(characterRegex);
          parsedHeader += character[0];
          headerOffset += 1;
        }
      }

      if (parsedHeader) {
        headerLine.push(
          linkify(
            parsedHeader,
            styles,
            classNames(
              properties.foregroundColorClass,
              properties.backgroundColorClass,
              properties.classes
            )
          )
        );
      }

      // Store section info for rendering
      sections.set(name, {
        startIndex: index,
        timestamp: sectionTimestamp,
        header: headerLine.length > 0 ? headerLine : (parsedHeader || name),
        expanded: sectionExpanded
      });
      sectionStack.push(name);
      // Don't render the marker line itself
      return null;
    }

    if (sectionEndMatch) {
      const [, , name] = sectionEndMatch;
      const section = sections.get(name);
      if (section) {
        section.endIndex = index;
      }
      sectionStack.pop();
      // Don't render the marker line itself
      return null;
    }

    let offset = 0;
    while (offset !== message.length) {
      const str = message.substring(offset);
      const controlSequence = str.match(ansiRegex);
      if (controlSequence) {
        offset += controlSequence.index + controlSequence[0].length;
        handleSequence(controlSequence);
      } else {
        const character = str.match(characterRegex);
        text += character[0];
        offset += 1;
      }
    }
    if (text) {
      line.push(
        linkify(
          text,
          styles,
          classNames(
            properties.foregroundColorClass,
            properties.backgroundColorClass,
            properties.classes
          )
        )
      );
    }

    const currentSection = sectionStack.length > 0 ? sectionStack[sectionStack.length - 1] : null;
    const inSection = currentSection !== null || isInSection;

    return (
      <div
        className={classNames('tkn--log-line', {
          [`tkn--log-level--${level}`]: level,
          'tkn--log-line--group': command === 'group',
          'tkn--log-line--in-group': command !== 'group' && groupIndex !== null,
          'tkn--log-line--in-section': inSection
        })}
        key={index}
        data-section={currentSection}
      >
        {fields.timestamp && (
          <span className="tkn--log-line--timestamp">
            <FormattedDate
              date={timestamp}
              formatTooltip={() => timestamp}
              includeSeconds
            />
            {
              ' ' /* include space character between timestamp and rest of content for better copy-paste experience */
            }
          </span>
        )}
        {fields.level && getDecoratedLevel(level)}
        {command === 'group' && (
          <details
            onToggle={event =>
              onToggleGroup({ expanded: event.target.open, groupIndex })
            }
            open={expanded}
          >
            <summary>{line}</summary>
          </details>
        )}
        {sectionName && (
          <details
            className="tkn--log-section"
            open={sectionExpanded}
          >
            <summary className="tkn--log-section--header">{sectionHeader || sectionName}</summary>
          </details>
        )}
        {!['group', 'endgroup'].includes(command) && !sectionName && (
          <span className="tkn--log-line--content">{line}</span>
        )}
      </div>
    );
  };

  const convert = () => {
    const parsedLogs = logs.map((part, index) => {
      text = '';
      line = [];
      return parse(part, index);
    }).filter(Boolean); // Remove null entries from section markers

    // Build nested section structure using a stack-based approach
    const result = [];
    const sectionStack = []; // Stack to track open sections: [{name, info, content}]
    let logIndex = 0;

    parsedLogs.forEach((logElement) => {
      const sectionName = logElement?.props?.['data-section'];

      if (sectionName) {
        // Check if this is a new section or continuation of current
        const currentSection = sectionStack.length > 0 ? sectionStack[sectionStack.length - 1] : null;

        if (!currentSection || sectionName !== currentSection.name) {
          // Start a new nested section
          const sectionInfo = sections.get(sectionName);
          if (sectionInfo) {
            sectionStack.push({
              name: sectionName,
              info: sectionInfo,
              content: []
            });
          }
        }

        // Add log to current section (without the data-section attribute to avoid recursion)
        if (sectionStack.length > 0) {
          sectionStack[sectionStack.length - 1].content.push(logElement);
        }
      } else {
        // Not in a section
        if (sectionStack.length > 0) {
          // Add to innermost section
          sectionStack[sectionStack.length - 1].content.push(logElement);
        } else {
          // Regular log line outside any section
          result.push(logElement);
        }
      }

      // Check if any sections should be closed (based on section end markers)
      const sectionsToClose = [];
      sectionStack.forEach((section, stackIndex) => {
        if (section.info.endIndex === logIndex + 1) {
          sectionsToClose.push(stackIndex);
        }
      });

      // Close sections from innermost to outermost
      sectionsToClose.sort((a, b) => b - a).forEach(stackIndex => {
        const section = sectionStack[stackIndex];

        const sectionElement = (
          <div className="tkn--log-line tkn--log-line--section" key={`section-${section.info.timestamp}`}>
            <details
              className="tkn--log-section"
              open={section.info.expanded}
            >
              <summary className="tkn--log-section--header">
                {section.info.header}
              </summary>
              <div className="tkn--log-section--content">
                {section.content}
              </div>
            </details>
          </div>
        );

        // Remove closed section from stack
        sectionStack.splice(stackIndex, 1);

        // Add to parent section or result
        if (sectionStack.length > 0 && stackIndex > 0) {
          sectionStack[stackIndex - 1].content.push(sectionElement);
        } else {
          result.push(sectionElement);
        }
      });

      logIndex++;
    });

    // Close any remaining open sections (from innermost to outermost)
    while (sectionStack.length > 0) {
      const section = sectionStack.pop();

      const sectionElement = (
        <div className="tkn--log-line tkn--log-line--section" key={`section-${section.info.timestamp}`}>
          <details
            className="tkn--log-section"
            open={section.info.expanded}
          >
            <summary className="tkn--log-section--header">
              {section.info.header}
            </summary>
            <div className="tkn--log-section--content">
              {section.content}
            </div>
          </details>
        </div>
      );

      if (sectionStack.length > 0) {
        sectionStack[sectionStack.length - 1].content.push(sectionElement);
      } else {
        result.push(sectionElement);
      }
    }

    return result;
  };

  return <code>{convert()}</code>;
};

export default LogFormat;
