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

// Initialize linkify-it for URL detection in log messages
const linkifyIt = LinkifyIt().tlds(tlds);

// Regular expressions for parsing ANSI escape sequences and log content
// eslint-disable-next-line no-control-regex
const ansiRegex = /^\u001b([@-_])(.*?)([@-~])/; // Matches ANSI control sequences for colors/styles
const characterRegex = /[^]/m; // Matches any single character including newlines

// Collapsible section markers - used to create expandable/collapsible log sections
// Section start format: \e[0Ksection_start:UNIX_TIMESTAMP:SECTION_NAME[collapsed=true]\r\e[0K + HEADER_TEXT
// Section end format: \e[0Ksection_end:UNIX_TIMESTAMP:SECTION_NAME\r\e[0K
// Example: \x1b[0Ksection_start:1700000001:build\r\x1b[0KBuilding Application
// Example with collapsed: \x1b[0Ksection_start:1700000001:build[collapsed=true]\r\x1b[0KBuilding Application
const sectionStartRegex = /\x1b\[0Ksection_start:(\d+):([^\r\[]+)(?:\[collapsed=([^\]]+)\])?\r\x1b\[0K(.*)$/;
const sectionEndRegex = /\x1b\[0Ksection_end:(\d+):([^\r]+)\r\x1b\[0K/;

/**
 * Renders a log level badge (e.g., "info", "error", "warning")
 * @param {string} level - The log level to display
 * @returns {JSX.Element|null} Formatted log level badge or null if no level
 */
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

/**
 * Formats a duration in milliseconds to a human-readable string
 * @param {number} durationMs - Duration in milliseconds
 * @returns {string} Formatted duration (e.g., "2.5s", "1m 30s", "1h 5m")
 */
const formatDuration = durationMs => {
  if (durationMs === null || durationMs === undefined || durationMs < 0) {
    return '';
  }

  // Handle very short durations (less than 1 second)
  if (durationMs < 1000) {
    if (durationMs === 0) {
      return '< 1s';
    }
    return `${durationMs}ms`;
  }

  const seconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }

  // For durations under 10 seconds, show decimal
  if (seconds < 10) {
    const ms = durationMs % 1000;
    if (ms > 0) {
      return `${(durationMs / 1000).toFixed(1)}s`;
    }
  }

  return `${seconds}s`;
};

/**
 * Extracts a 256-color xterm color from ANSI command stack
 * @param {Array} commandStack - Array of ANSI command codes
 * @returns {string|null} RGB color string or null if invalid
 */
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

/**
 * Creates a formatted string with optional styles and className
 * @param {string} str - The text to format
 * @param {Object} styleObj - Inline styles (color, backgroundColor)
 * @param {string} className - CSS class name
 * @returns {JSX.Element|string} Formatted span or plain string
 */
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

/**
 * Detects and converts URLs in text to clickable links
 * @param {string} str - The text to process
 * @param {Object} styleObj - Inline styles to apply
 * @param {string} classNameString - CSS class name
 * @returns {Array|JSX.Element|string} Array of elements with links or formatted string
 */
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

/**
 * LogFormat Component
 * Renders log messages with ANSI color/style support, URL detection, and collapsible sections
 *
 * @param {Object} props
 * @param {Object} props.fields - Controls which fields to display (timestamp, level, message)
 * @param {Array} props.logs - Array of log objects with message, timestamp, level, etc.
 * @param {Function} props.onToggleGroup - Callback for group toggle events
 */
const LogFormat = ({
  fields = { message: true },
  logs = [],
  onToggleGroup
}) => {
  // ANSI style properties for current text being processed
  let properties = {
    classes: {},              // CSS classes for text styles (bold, italic, etc.)
    foregroundColor: null,    // RGB color for text
    foregroundColorClass: null, // CSS class for text color
    backgroundColor: null,    // RGB color for background
    backgroundColorClass: null  // CSS class for background color
  };

  let styles = {};  // Inline styles object
  let text = '';    // Current text buffer
  let line = [];    // Current line elements array

  // Track collapsible sections for nested rendering
  const sections = new Map(); // Maps sectionName -> { startIndex, endIndex, timestamp, header, expanded }
  const sectionStack = []; // Stack to track currently open nested sections

  /**
   * Resets all ANSI style properties to default
   */
  const reset = () => {
    properties = {
      classes: {},
      foregroundColor: null,
      foregroundColorClass: null,
      backgroundColor: null,
      backgroundColorClass: null
    };
  };

  /**
   * Enables a text style (bold, italic, underline, etc.)
   * @param {string} flag - Style name (e.g., 'bold', 'italic')
   */
  const enableTextStyle = flag => {
    const className = `tkn--ansi--text--${flag}`;
    properties.classes[className] = true;
  };

  /**
   * Disables a text style
   * @param {string} flag - Style name to disable
   */
  const disableTextStyle = flag => {
    const className = `tkn--ansi--text--${flag}`;
    properties.classes[className] = false;
  };

  /**
   * Sets foreground (text) color using named color
   * @param {string} color - Color name (e.g., 'red', 'green')
   */
  const setFGColor = color => {
    properties.foregroundColorClass = color && `tkn--ansi--color-fg--${color}`;
  };

  /**
   * Sets background color using named color
   * @param {string} color - Color name
   */
  const setBGColor = color => {
    properties.backgroundColorClass = color && `tkn--ansi--color-bg--${color}`;
  };

  /**
   * Sets foreground color using 256-color palette
   * @param {Array} commandStack - ANSI command stack
   */
  const setFGColor256 = commandStack => {
    properties.foregroundColor = getXtermColor(commandStack);
  };

  /**
   * Sets background color using 256-color palette
   * @param {Array} commandStack - ANSI command stack
   */
  const setBGColor256 = commandStack => {
    properties.backgroundColor = getXtermColor(commandStack);
  };

  // Map of ANSI codes to their corresponding style functions
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

  /**
   * Applies a style based on ANSI command code
   * @param {string} command - ANSI command code
   * @param {Array} stack - Remaining command stack
   */
  const setStyle = (command, stack) => {
    if (setProperties[command]) {
      setProperties[command](stack);
    }
  };

  /**
   * Recursively processes ANSI command stack
   * @param {Array} stack - Array of ANSI commands to process
   */
  const evaluateCommandStack = stack => {
    const command = stack.shift();
    if (!command) {
      return;
    }
    setStyle(command, stack);
    evaluateCommandStack(stack);
  };

  /**
   * Handles an ANSI escape sequence and updates styles
   * @param {Array} s - Matched ANSI sequence [full, indicator, commands, terminator]
   */
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

  /**
   * Parses a single log entry and converts it to JSX
   * Handles ANSI codes, section markers, timestamps, and log levels
   *
   * @param {Object} log - Log entry object
   * @param {number} index - Index in logs array
   * @returns {JSX.Element|null} Rendered log line or null for section markers
   */
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

    // Empty log line
    if (!message?.length && !timestamp && !level) {
      return <br key={index} />;
    }

    // Check for collapsible section markers in the message
    const sectionStartMatch = message.match(sectionStartRegex);
    const sectionEndMatch = message.match(sectionEndRegex);

    // Handle section start marker
    if (sectionStartMatch) {
      const [, sectionTimestamp, name, collapsedOption, headerText] = sectionStartMatch;
      const isCollapsed = collapsedOption === 'true';

      // Parse ANSI codes in the header text to preserve colors/styles
      let headerLine = [];
      let headerOffset = 0;
      let parsedHeader = '';

      // Process each character in the header, handling ANSI sequences
      while (headerOffset !== headerText.length) {
        const str = headerText.substring(headerOffset);
        const controlSequence = str.match(ansiRegex);
        if (controlSequence) {
          // Found ANSI sequence - process it and skip over it
          headerOffset += controlSequence.index + controlSequence[0].length;
          handleSequence(controlSequence);
        } else {
          // Regular character - add to parsed header
          const character = str.match(characterRegex);
          parsedHeader += character[0];
          headerOffset += 1;
        }
      }

      // Convert parsed header to JSX with styles
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

      // Store section metadata for later rendering
      // Use isCollapsed to determine initial expanded state (inverted logic: collapsed=true means expanded=false)
      sections.set(name, {
        startIndex: index,
        timestamp: sectionTimestamp,
        header: headerLine.length > 0 ? headerLine : (parsedHeader || name),
        expanded: !isCollapsed, // If collapsed=true, then expanded=false
        firstLogTimestamp: null, // Will be set to the first log line's timestamp
        lastLogTimestamp: null   // Will be set to the last log line's timestamp
      });
      sectionStack.push(name);

      // Don't render the marker line itself - it will be rendered as a section header
      return null;
    }

    // Handle section end marker
    if (sectionEndMatch) {
      const [, , name] = sectionEndMatch;
      const section = sections.get(name);
      if (section) {
        // Mark where this section ends for proper nesting
        section.endIndex = index;
      }
      sectionStack.pop();

      // Don't render the marker line itself
      return null;
    }

    // Parse the message content character by character, handling ANSI sequences
    let offset = 0;
    while (offset !== message.length) {
      const str = message.substring(offset);
      const controlSequence = str.match(ansiRegex);
      if (controlSequence) {
        // Found ANSI control sequence - process it
        offset += controlSequence.index + controlSequence[0].length;
        handleSequence(controlSequence);
      } else {
        // Regular character - add to text buffer
        const character = str.match(characterRegex);
        text += character[0];
        offset += 1;
      }
    }

    // Convert accumulated text to JSX with current styles
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

    // Determine if this line is inside a section and track timestamps
    const currentSection = sectionStack.length > 0 ? sectionStack[sectionStack.length - 1] : null;
    const inSection = currentSection !== null || isInSection;

    // Track first and last timestamps for duration calculation
    if (currentSection && timestamp) {
      const section = sections.get(currentSection);
      if (section) {
        if (!section.firstLogTimestamp) {
          section.firstLogTimestamp = timestamp;
        }
        section.lastLogTimestamp = timestamp;
      }
    }

    // Render the log line with appropriate styling and structure
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

  /**
   * Converts all log entries to JSX and builds nested section structure
   * Uses a stack-based approach to handle nested collapsible sections
   *
   * @returns {Array} Array of JSX elements representing the formatted logs
   */
  const convert = () => {
    // Step 1: Parse all log entries into JSX elements
    const parsedLogs = logs.map((part, index) => {
      text = '';
      line = [];
      return parse(part, index);
    }).filter(Boolean); // Remove null entries (section markers don't render directly)

    // Step 2: Build nested section structure using a stack-based approach
    const result = [];
    const sectionStack = []; // Stack to track currently open sections: [{name, info, content}]
    let logIndex = 0;

    parsedLogs.forEach((logElement) => {
      const sectionName = logElement?.props?.['data-section'];

      if (sectionName) {
        // This log line belongs to a section
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

        // Add log line to the current (innermost) section
        if (sectionStack.length > 0) {
          sectionStack[sectionStack.length - 1].content.push(logElement);
        }
      } else {
        // This log line is not in a section
        if (sectionStack.length > 0) {
          // Add to innermost section (for lines between section start and end)
          sectionStack[sectionStack.length - 1].content.push(logElement);
        } else {
          // Regular log line outside any section
          result.push(logElement);
        }
      }

      // Check if any sections should be closed at this point
      const sectionsToClose = [];
      sectionStack.forEach((section, stackIndex) => {
        if (section.info.endIndex === logIndex + 1) {
          sectionsToClose.push(stackIndex);
        }
      });

      // Close sections from innermost to outermost
      sectionsToClose.sort((a, b) => b - a).forEach(stackIndex => {
        const section = sectionStack[stackIndex];

        // Calculate section duration if timestamps are available
        let duration = null;
        if (section.info.firstLogTimestamp && section.info.lastLogTimestamp) {
          const startTime = new Date(section.info.firstLogTimestamp).getTime();
          const endTime = new Date(section.info.lastLogTimestamp).getTime();
          duration = endTime - startTime;
        }

        // Create the collapsible section element
        const sectionElement = (
          <div className="tkn--log-line tkn--log-line--section" key={`section-${section.info.timestamp}`}>
            <details
              className="tkn--log-section"
              open={section.info.expanded}
            >
              <summary className="tkn--log-section--header">
                <span className="tkn--log-section--header-text">{section.info.header}</span>
                {duration !== null && duration >= 0 && (
                  <span className="tkn--log-section--duration">{formatDuration(duration)}</span>
                )}
              </summary>
              <div className="tkn--log-section--content">
                {section.content}
              </div>
            </details>
          </div>
        );

        // Remove closed section from stack
        sectionStack.splice(stackIndex, 1);

        // Add to parent section or top-level result
        if (sectionStack.length > 0 && stackIndex > 0) {
          sectionStack[stackIndex - 1].content.push(sectionElement);
        } else {
          result.push(sectionElement);
        }
      });

      logIndex++;
    });

    // Close any remaining open sections (from innermost to outermost)
    // This handles cases where section end markers are missing
    while (sectionStack.length > 0) {
      const section = sectionStack.pop();

      // Calculate section duration if timestamps are available
      let duration = null;
      if (section.info.firstLogTimestamp && section.info.lastLogTimestamp) {
        const startTime = new Date(section.info.firstLogTimestamp).getTime();
        const endTime = new Date(section.info.lastLogTimestamp).getTime();
        duration = endTime - startTime;
      }

      const sectionElement = (
        <div className="tkn--log-line tkn--log-line--section" key={`section-${section.info.timestamp}`}>
          <details
            className="tkn--log-section"
            open={section.info.expanded}
          >
            <summary className="tkn--log-section--header">
              <span className="tkn--log-section--header-text">{section.info.header}</span>
              {duration !== null && duration >= 0 && (
                <span className="tkn--log-section--duration">{formatDuration(duration)}</span>
              )}
            </summary>
            <div className="tkn--log-section--content">
              {section.content}
            </div>
          </details>
        </div>
      );

      // Add to parent section or top-level result
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
