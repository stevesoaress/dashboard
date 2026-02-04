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

import LogFormat from './LogFormat';

const ansiColors = (() => {
  const logs = [];
  // 16 named 'system' colors
  [30, 90, 40, 100].forEach(seq => {
    let line = '';
    for (let i = 0; i < 8; i += 1) {
      line += `\u001b[${seq + i}m${i}  \u001b[0m`;
    }
    logs.push(line);
  });
  logs.push('');
  // 256-colors
  [38, 48].forEach(seq => {
    let line = '';
    for (let i = 0; i < 256; i += 1) {
      line += `\u001b[${seq};5;${i}m${i}  \u001b[0m`;
      if ((i + 1) % 6 === 4) {
        logs.push(line);
        line = '';
      }
    }
    logs.push('');
  });
  return logs.map(message => ({ message }));
})();

const ansiTextStyles = (() => {
  const textStyles = {
    bold: 1,
    italic: 3,
    underline: 4,
    conceal: 8,
    cross: 9
  };

  const logs = Object.entries(textStyles).map(([key, value]) => ({
    message: `\u001b[${value}m${key}\u001b[0m`
  }));
  return logs;
})();

export default {
  component: LogFormat,
  parameters: {
    themes: {
      themeOverride: 'dark'
    }
  },
  title: 'LogFormat'
};

export const Colors = {
  args: {
    logs: ansiColors
  }
};

export const TextStyles = {
  args: {
    logs: ansiTextStyles
  }
};

export const URLDetection = {
  args: {
    logs: `
+ curl https://raw.githubusercontent.com/tektoncd/pipeline/master/tekton/koparse/koparse.py --output /usr/bin/koparse.py
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                  Dload  Upload   Total   Spent    Left  Speed
    0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0   0  3946    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     01100  3946  100  3946    0     0  13421      0 --:--:-- --:--:-- --:--:-- 13376
+ chmod +x /usr/bin/koparse.py
+ REGIONS=(us eu asia)
+ IMAGES=(gcr.io/tekton-releases/github.com/tektoncd/dashboard/cmd/dashboard)
+ BUILT_IMAGES=($(/usr/bin/koparse.py --path /workspace/output/bucket-for-dashboard/latest/tekton-dashboard-release.yaml --base gcr.io/tekton-releases/github.com/tektoncd/dashboard --images \${IMAGES[@]}))
`
      .split('\n')
      .map(message => ({ message }))
  }
};

export const LogLevelsAndTimestamps = {
  args: {
    fields: {
      level: true,
      timestamp: true
    },
    logs: [
      {
        timestamp: '2024-11-14T14:10:53.354144861Z',
        level: 'info',
        message: 'Cloning repo'
      },
      {
        timestamp: '2024-11-14T14:10:56.300268594Z',
        level: 'debug',
        message:
          '[get_repo_params:30] | get_repo_name called for https://github.com/example-org/example-app. Repository Name identified as example-app'
      },
      {
        timestamp: '2024-11-14T14:10:56.307088791Z',
        level: 'debug',
        message:
          '[get_repo_params:18] | get_repo_owner called for https://github.com/example-org/example-app. Repository Owner identified as example-org'
      },
      {
        timestamp: '2024-11-14T14:10:56.815017386Z',
        level: 'debug',
        message:
          '[get_repo_params:212] | Unable to locate repository parameters for key https://github.com/example-org/example-app in the cache. Attempt to fetch repository parameters.'
      },
      {
        timestamp: '2024-11-14T14:10:56.819937688Z',
        level: 'debug',
        message:
          '[get_repo_params:39] | get_repo_server_name called for https://github.com/example-org/example-app. Repository Server Name identified as github.com'
      },
      {
        timestamp: '2024-11-14T14:10:56.819947739Z',
        level: 'trace',
        message: '{ "metric_name": "script_duration", "value": 1234 }'
      },
      {
        timestamp: '2024-11-14T14:10:56.869719012Z',
        level: null,
        message: 'Sample with no log level'
      },
      {
        timestamp: '2024-11-14T14:10:56.869719012Z',
        level: 'error',
        message: 'Sample error'
      },
      {
        timestamp: '2024-11-14T14:10:56.869719012Z',
        level: 'warning',
        message: 'Sample warning'
      },
      {
        timestamp: '2024-11-14T14:10:56.869719012Z',
        level: 'notice',
        message: 'Sample notice'
      },
      {
        timestamp: '2024-11-14T14:10:56.869719012Z',
        command: 'group',
        expanded: false,
        message: 'Collapsed group'
      },
      {
        timestamp: '2024-11-14T14:10:56.869719012Z',
        command: 'group',
        expanded: true,
        message: 'Expanded group'
      },
      {
        timestamp: '2024-11-14T14:10:56.869719012Z',
        level: 'info',
        isInGroup: true,
        message: 'First line inside group'
      },
      {
        timestamp: '2024-11-14T14:10:56.869719012Z',
        level: 'debug',
        isInGroup: true,
        message: 'Second line inside group'
      },
      {
        timestamp: '2024-11-14T14:10:56.869719012Z',
        isInGroup: true,
        message: 'A line with no log level inside a group'
      }
    ]
  }
};

export const CollapsibleSections = {
  args: {
    fields: {
      timestamp: true
    },
    logs: [
      {
        timestamp: '2024-11-14T14:10:53.354144861Z',
        message: 'Starting build process'
      },
      {
        timestamp: '2024-11-14T14:10:54.354144861Z',
        message: '\x1b[0Ksection_start:1700000001:prepare_env\r\x1b[0KPreparing Environment'
      },
      {
        timestamp: '2024-11-14T14:10:55.354144861Z',
        message: 'Installing dependencies...'
      },
      {
        timestamp: '2024-11-14T14:10:56.354144861Z',
        message: 'npm install completed'
      },
      {
        timestamp: '2024-11-14T14:10:57.354144861Z',
        message: '\x1b[0Ksection_end:1700000001:prepare_env\r\x1b[0K'
      },
      {
        timestamp: '2024-11-14T14:10:58.354144861Z',
        message: '\x1b[0Ksection_start:1700000002:build\r\x1b[0KBuilding Application'
      },
      {
        timestamp: '2024-11-14T14:10:59.354144861Z',
        message: 'Compiling source files...'
      },
      {
        timestamp: '2024-11-14T14:11:00.354144861Z',
        message: '\x1b[32mBuild successful!\x1b[0m'
      },
      {
        timestamp: '2024-11-14T14:11:01.354144861Z',
        message: '\x1b[0Ksection_end:1700000002:build\r\x1b[0K'
      },
      {
        timestamp: '2024-11-14T14:11:02.354144861Z',
        message: '\x1b[0Ksection_start:1700000003:tests\r\x1b[0KRunning Tests'
      },
      {
        timestamp: '2024-11-14T14:11:03.354144861Z',
        message: 'Test suite started'
      },
      {
        timestamp: '2024-11-14T14:11:04.354144861Z',
        message: '✓ Unit tests passed (45/45)'
      },
      {
        timestamp: '2024-11-14T14:11:05.354144861Z',
        message: '✓ Integration tests passed (12/12)'
      },
      {
        timestamp: '2024-11-14T14:11:06.354144861Z',
        message: '\x1b[0Ksection_end:1700000003:tests\r\x1b[0K'
      },
      {
        timestamp: '2024-11-14T14:11:07.354144861Z',
        message: '\x1b[32mAll tasks completed successfully!\x1b[0m'
      }
    ]
  }
};

export const CollapsibleSectionWithLogLevels = {
  args: {
    fields: {
      timestamp: true,
      level: true
    },
    logs: [
      {
        timestamp: '2024-11-14T14:10:53.354144861Z',
        level: 'info',
        message: 'Starting deployment process'
      },
      {
        timestamp: '2024-11-14T14:10:54.354144861Z',
        message: '\x1b[0Ksection_start:1700000001:warnings\r\x1b[0K\x1b[33m⚠️  Warnings\x1b[0m'
      },
      {
        timestamp: '2024-11-14T14:10:55.354144861Z',
        level: 'warning',
        message: '::warning::Deprecated API usage detected in module auth.js'
      },
      {
        timestamp: '2024-11-14T14:10:56.354144861Z',
        level: 'warning',
        message: '::warning::Missing environment variable DATABASE_URL, using default'
      },
      {
        timestamp: '2024-11-14T14:10:57.354144861Z',
        level: 'warning',
        message: '::warning::Package lodash@4.17.20 has known vulnerabilities'
      },
      {
        timestamp: '2024-11-14T14:10:58.354144861Z',
        message: '\x1b[0Ksection_end:1700000001:warnings\r\x1b[0K'
      },
      {
        timestamp: '2024-11-14T14:10:59.354144861Z',
        message: '\x1b[0Ksection_start:1700000002:debug\r\x1b[0K\x1b[35m🔍 Debug Information\x1b[0m'
      },
      {
        timestamp: '2024-11-14T14:11:00.354144861Z',
        level: 'debug',
        message: 'Loading configuration from /etc/app/config.yaml'
      },
      {
        timestamp: '2024-11-14T14:11:01.354144861Z',
        level: 'debug',
        message: 'Initializing database connection pool (size: 10)'
      },
      {
        timestamp: '2024-11-14T14:11:02.354144861Z',
        level: 'debug',
        message: 'Registering 15 API routes'
      },
      {
        timestamp: '2024-11-14T14:11:03.354144861Z',
        level: 'debug',
        message: 'Cache warming completed in 234ms'
      },
      {
        timestamp: '2024-11-14T14:11:04.354144861Z',
        message: '\x1b[0Ksection_end:1700000002:debug\r\x1b[0K'
      },
      {
        timestamp: '2024-11-14T14:11:05.354144861Z',
        message: '\x1b[0Ksection_start:1700000003:info\r\x1b[0K\x1b[36mℹ️  Build Process\x1b[0m'
      },
      {
        timestamp: '2024-11-14T14:11:06.354144861Z',
        level: 'info',
        message: 'Compiling TypeScript files...'
      },
      {
        timestamp: '2024-11-14T14:11:07.354144861Z',
        level: 'info',
        message: 'Bundling assets with webpack'
      },
      {
        timestamp: '2024-11-14T14:11:08.354144861Z',
        level: 'info',
        message: 'Optimizing images (12 files)'
      },
      {
        timestamp: '2024-11-14T14:11:09.354144861Z',
        level: 'info',
        message: '\x1b[32mBuild completed successfully!\x1b[0m'
      },
      {
        timestamp: '2024-11-14T14:11:10.354144861Z',
        message: '\x1b[0Ksection_end:1700000003:info\r\x1b[0K'
      },
      {
        timestamp: '2024-11-14T14:11:11.354144861Z',
        message: '\x1b[0Ksection_start:1700000004:errors\r\x1b[0K\x1b[31m❌ Errors\x1b[0m'
      },
      {
        timestamp: '2024-11-14T14:11:12.354144861Z',
        level: 'error',
        message: '::error::Failed to connect to Redis at localhost:6379'
      },
      {
        timestamp: '2024-11-14T14:11:13.354144861Z',
        level: 'error',
        message: '::error::Database migration failed: duplicate key violation'
      },
      {
        timestamp: '2024-11-14T14:11:14.354144861Z',
        level: 'error',
        message: '::error::Authentication service unavailable (timeout after 30s)'
      },
      {
        timestamp: '2024-11-14T14:11:15.354144861Z',
        message: '\x1b[0Ksection_end:1700000004:errors\r\x1b[0K'
      },
      {
        timestamp: '2024-11-14T14:11:16.354144861Z',
        level: 'info',
        message: '\x1b[33m⚠️  Deployment completed with errors\x1b[0m'
      }
    ]
  }
};
