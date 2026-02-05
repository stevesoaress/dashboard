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

export const LargeCollapsibleSection = {
  args: {
    fields: {
      timestamp: true,
      level: true
    },
    logs: (() => {
      const logs = [
        {
          timestamp: '2024-11-14T14:10:53.354144861Z',
          level: 'info',
          message: 'Starting large data processing job with 50 batches'
        }
      ];

      // Generate 50 sections with 50 log lines each (2500 total)
      const colors = [31, 32, 33, 34, 35, 36, 37, 91, 92, 93, 94, 95, 96, 97];
      const bgColors = [40, 41, 42, 43, 44, 45, 46, 47, 100, 101, 102, 103, 104, 105, 106, 107];
      const styles = ['', '\x1b[1m', '\x1b[3m', '\x1b[4m', '\x1b[1m\x1b[3m'];
      const levels = ['info', 'debug', 'warning', 'error', 'trace'];
      const sectionColors = [36, 32, 33, 35, 34, 91, 92, 93, 94, 95];

      let recordNum = 1;

      for (let section = 1; section <= 50; section++) {
        const sectionColor = sectionColors[section % sectionColors.length];
        const sectionTimestamp = 1700000000 + section;

        // Section start
        logs.push({
          timestamp: `2024-11-14T14:${10 + Math.floor(recordNum / 60)}:${(54 + recordNum) % 60}.${String(recordNum).padStart(9, '0')}Z`,
          message: `\x1b[0Ksection_start:${sectionTimestamp}:batch_${section}\r\x1b[0K\x1b[1m\x1b[${sectionColor}m📦 Batch ${section}/50 (Records ${recordNum}-${recordNum + 49})\x1b[0m`
        });

        // Generate 50 log lines for this section
        for (let i = 0; i < 50; i++, recordNum++) {
          const color = colors[recordNum % colors.length];
          const bgColor = bgColors[Math.floor(recordNum / 100) % bgColors.length];
          const style = styles[recordNum % styles.length];
          const level = levels[recordNum % levels.length];

          let message = '';

          // Add variety to the messages
          if (recordNum % 10 === 0) {
            // Every 10th line: colored background with text
            message = `${style}\x1b[${bgColor}m\x1b[37mProcessing record ${recordNum}/2500 - Batch ${section}\x1b[0m`;
          } else if (recordNum % 7 === 0) {
            // Every 7th line: bold colored text
            message = `\x1b[1m\x1b[${color}mRecord ${recordNum}: Status=SUCCESS, Duration=${Math.floor(Math.random() * 1000)}ms\x1b[0m`;
          } else if (recordNum % 5 === 0) {
            // Every 5th line: italic text
            message = `\x1b[3m\x1b[${color}mValidating data for record ${recordNum}...\x1b[0m`;
          } else if (recordNum % 3 === 0) {
            // Every 3rd line: underlined text
            message = `\x1b[4m\x1b[${color}mTransforming record ${recordNum} with schema v2.1\x1b[0m`;
          } else {
            // Regular colored text
            message = `\x1b[${color}mProcessing record ${recordNum}: ${['pending', 'active', 'completed', 'verified'][recordNum % 4]}\x1b[0m`;
          }

          logs.push({
            timestamp: `2024-11-14T14:${10 + Math.floor(recordNum / 60)}:${(54 + recordNum) % 60}.${String(recordNum).padStart(9, '0')}Z`,
            level,
            message
          });
        }

        // Section end
        logs.push({
          timestamp: `2024-11-14T14:${10 + Math.floor(recordNum / 60)}:${(54 + recordNum) % 60}.${String(recordNum).padStart(9, '0')}Z`,
          message: `\x1b[0Ksection_end:${sectionTimestamp}:batch_${section}\r\x1b[0K`
        });
      }

      logs.push({
        timestamp: '2024-11-14T14:52:35.354144861Z',
        level: 'info',
        message: '\x1b[1m\x1b[32m✓ Processing completed successfully - 50 batches, 2500 records processed\x1b[0m'
      });

      return logs;
    })()
  }
};

export const NestedCollapsibleSections = {
  args: {
    fields: {
      timestamp: true,
      level: true
    },
    logs: (() => {
      const logs = [
        {
          timestamp: '2024-11-14T14:10:53.354144861Z',
          level: 'info',
          message: 'Starting deployment pipeline with 1000 log lines'
        },
        {
          timestamp: '2024-11-14T14:10:54.354144861Z',
          message: '\x1b[0Ksection_start:1700000001:deployment\r\x1b[0K\x1b[1m\x1b[36m🚀 Deployment Process\x1b[0m'
        },
        {
          timestamp: '2024-11-14T14:10:55.354144861Z',
          level: 'info',
          message: 'Initializing deployment environment'
        }
      ];

      const colors = [31, 32, 33, 34, 35, 36];
      const levels = ['info', 'debug', 'trace'];
      let lineNum = 1;

      // Build Stage with nested sections (300 lines)
      logs.push({
        timestamp: `2024-11-14T14:10:56.${String(lineNum++).padStart(9, '0')}Z`,
        message: '\x1b[0Ksection_start:1700000002:build\r\x1b[0K\x1b[1m\x1b[32m  🔨 Build Stage\x1b[0m'
      });

      // NPM Install (100 lines)
      logs.push({
        timestamp: `2024-11-14T14:10:57.${String(lineNum++).padStart(9, '0')}Z`,
        message: '\x1b[0Ksection_start:1700000003:npm_install\r\x1b[0K\x1b[1m\x1b[35m    📦 NPM Install\x1b[0m'
      });
      for (let i = 0; i < 100; i++, lineNum++) {
        const color = colors[i % colors.length];
        logs.push({
          timestamp: `2024-11-14T14:11:${String(i % 60).padStart(2, '0')}.${String(lineNum).padStart(9, '0')}Z`,
          level: levels[i % levels.length],
          message: `\x1b[${color}mInstalling package ${i + 1}/100: ${['react', 'lodash', 'axios', 'express', 'webpack'][i % 5]}@${i}.0.0\x1b[0m`
        });
      }
      logs.push({
        timestamp: `2024-11-14T14:11:00.${String(lineNum++).padStart(9, '0')}Z`,
        message: '\x1b[0Ksection_end:1700000003:npm_install\r\x1b[0K'
      });

      // TypeScript Compilation (100 lines)
      logs.push({
        timestamp: `2024-11-14T14:11:01.${String(lineNum++).padStart(9, '0')}Z`,
        message: '\x1b[0Ksection_start:1700000004:typescript\r\x1b[0K\x1b[1m\x1b[34m    📘 TypeScript Compilation\x1b[0m'
      });
      for (let i = 0; i < 100; i++, lineNum++) {
        const color = colors[i % colors.length];
        logs.push({
          timestamp: `2024-11-14T14:12:${String(i % 60).padStart(2, '0')}.${String(lineNum).padStart(9, '0')}Z`,
          level: levels[i % levels.length],
          message: `\x1b[${color}mCompiling ${['src/components', 'src/utils', 'src/api', 'src/containers', 'src/routes'][i % 5]}/file${i}.ts\x1b[0m`
        });
      }
      logs.push({
        timestamp: `2024-11-14T14:12:00.${String(lineNum++).padStart(9, '0')}Z`,
        message: '\x1b[0Ksection_end:1700000004:typescript\r\x1b[0K'
      });

      // Webpack Bundling (100 lines)
      logs.push({
        timestamp: `2024-11-14T14:12:01.${String(lineNum++).padStart(9, '0')}Z`,
        message: '\x1b[0Ksection_start:1700000005:webpack\r\x1b[0K\x1b[1m\x1b[33m    📦 Webpack Bundling\x1b[0m'
      });
      for (let i = 0; i < 100; i++, lineNum++) {
        const color = colors[i % colors.length];
        logs.push({
          timestamp: `2024-11-14T14:13:${String(i % 60).padStart(2, '0')}.${String(lineNum).padStart(9, '0')}Z`,
          level: levels[i % levels.length],
          message: `\x1b[${color}mBundling chunk ${i + 1}/100 (${Math.floor(Math.random() * 500)}kb)\x1b[0m`
        });
      }
      logs.push({
        timestamp: `2024-11-14T14:13:00.${String(lineNum++).padStart(9, '0')}Z`,
        level: 'info',
        message: '\x1b[32m✓ Build completed\x1b[0m'
      });
      logs.push({
        timestamp: `2024-11-14T14:13:01.${String(lineNum++).padStart(9, '0')}Z`,
        message: '\x1b[0Ksection_end:1700000005:webpack\r\x1b[0K'
      });
      logs.push({
        timestamp: `2024-11-14T14:13:02.${String(lineNum++).padStart(9, '0')}Z`,
        message: '\x1b[0Ksection_end:1700000002:build\r\x1b[0K'
      });

      // Test Stage with nested sections (350 lines)
      logs.push({
        timestamp: `2024-11-14T14:13:03.${String(lineNum++).padStart(9, '0')}Z`,
        message: '\x1b[0Ksection_start:1700000006:tests\r\x1b[0K\x1b[1m\x1b[33m  🧪 Test Stage\x1b[0m'
      });

      // Unit Tests (150 lines)
      logs.push({
        timestamp: `2024-11-14T14:13:04.${String(lineNum++).padStart(9, '0')}Z`,
        message: '\x1b[0Ksection_start:1700000007:unit_tests\r\x1b[0K\x1b[1m\x1b[36m    🔬 Unit Tests\x1b[0m'
      });
      for (let i = 0; i < 150; i++, lineNum++) {
        const color = colors[i % colors.length];
        const status = i % 10 === 0 ? '\x1b[32m✓ PASS\x1b[0m' : '\x1b[90m○ SKIP\x1b[0m';
        logs.push({
          timestamp: `2024-11-14T14:14:${String(i % 60).padStart(2, '0')}.${String(lineNum).padStart(9, '0')}Z`,
          level: levels[i % levels.length],
          message: `\x1b[${color}m${status} Test suite ${i + 1}/150: ${['Component', 'Utils', 'API', 'Hooks', 'Store'][i % 5]} tests\x1b[0m`
        });
      }
      logs.push({
        timestamp: `2024-11-14T14:14:00.${String(lineNum++).padStart(9, '0')}Z`,
        message: '\x1b[0Ksection_end:1700000007:unit_tests\r\x1b[0K'
      });

      // Integration Tests (100 lines)
      logs.push({
        timestamp: `2024-11-14T14:14:01.${String(lineNum++).padStart(9, '0')}Z`,
        message: '\x1b[0Ksection_start:1700000008:integration_tests\r\x1b[0K\x1b[1m\x1b[35m    🔗 Integration Tests\x1b[0m'
      });
      for (let i = 0; i < 100; i++, lineNum++) {
        const color = colors[i % colors.length];
        logs.push({
          timestamp: `2024-11-14T14:15:${String(i % 60).padStart(2, '0')}.${String(lineNum).padStart(9, '0')}Z`,
          level: levels[i % levels.length],
          message: `\x1b[${color}m\x1b[32m✓\x1b[0m Integration test ${i + 1}/100: ${['API', 'Database', 'Auth', 'Payment', 'Email'][i % 5]} integration\x1b[0m`
        });
      }
      logs.push({
        timestamp: `2024-11-14T14:15:00.${String(lineNum++).padStart(9, '0')}Z`,
        message: '\x1b[0Ksection_end:1700000008:integration_tests\r\x1b[0K'
      });

      // E2E Tests (100 lines)
      logs.push({
        timestamp: `2024-11-14T14:15:01.${String(lineNum++).padStart(9, '0')}Z`,
        message: '\x1b[0Ksection_start:1700000009:e2e_tests\r\x1b[0K\x1b[1m\x1b[34m    🌐 E2E Tests\x1b[0m'
      });
      for (let i = 0; i < 100; i++, lineNum++) {
        const color = colors[i % colors.length];
        logs.push({
          timestamp: `2024-11-14T14:16:${String(i % 60).padStart(2, '0')}.${String(lineNum).padStart(9, '0')}Z`,
          level: levels[i % levels.length],
          message: `\x1b[${color}m\x1b[32m✓\x1b[0m E2E test ${i + 1}/100: ${['Login', 'Checkout', 'Dashboard', 'Profile', 'Settings'][i % 5]} flow\x1b[0m`
        });
      }
      logs.push({
        timestamp: `2024-11-14T14:16:00.${String(lineNum++).padStart(9, '0')}Z`,
        message: '\x1b[0Ksection_end:1700000009:e2e_tests\r\x1b[0K'
      });
      logs.push({
        timestamp: `2024-11-14T14:16:01.${String(lineNum++).padStart(9, '0')}Z`,
        message: '\x1b[0Ksection_end:1700000006:tests\r\x1b[0K'
      });

      // Deploy Stage with nested sections (350 lines)
      logs.push({
        timestamp: `2024-11-14T14:16:02.${String(lineNum++).padStart(9, '0')}Z`,
        message: '\x1b[0Ksection_start:1700000010:deploy\r\x1b[0K\x1b[1m\x1b[32m  🌐 Deploy Stage\x1b[0m'
      });

      // Docker Build (150 lines)
      logs.push({
        timestamp: `2024-11-14T14:16:03.${String(lineNum++).padStart(9, '0')}Z`,
        message: '\x1b[0Ksection_start:1700000011:docker\r\x1b[0K\x1b[1m\x1b[34m    🐳 Docker Build\x1b[0m'
      });
      for (let i = 0; i < 150; i++, lineNum++) {
        const color = colors[i % colors.length];
        logs.push({
          timestamp: `2024-11-14T14:17:${String(i % 60).padStart(2, '0')}.${String(lineNum).padStart(9, '0')}Z`,
          level: levels[i % levels.length],
          message: `\x1b[${color}mStep ${i + 1}/150: ${['COPY', 'RUN', 'ENV', 'EXPOSE', 'CMD'][i % 5]} ${['package.json', 'npm install', 'NODE_ENV=production', 'PORT 3000', 'node server.js'][i % 5]}\x1b[0m`
        });
      }
      logs.push({
        timestamp: `2024-11-14T14:17:00.${String(lineNum++).padStart(9, '0')}Z`,
        message: '\x1b[0Ksection_end:1700000011:docker\r\x1b[0K'
      });

      // Kubernetes Deploy (100 lines)
      logs.push({
        timestamp: `2024-11-14T14:17:01.${String(lineNum++).padStart(9, '0')}Z`,
        message: '\x1b[0Ksection_start:1700000012:kubernetes\r\x1b[0K\x1b[1m\x1b[36m    ☸️  Kubernetes Deploy\x1b[0m'
      });
      for (let i = 0; i < 100; i++, lineNum++) {
        const color = colors[i % colors.length];
        logs.push({
          timestamp: `2024-11-14T14:18:${String(i % 60).padStart(2, '0')}.${String(lineNum).padStart(9, '0')}Z`,
          level: levels[i % levels.length],
          message: `\x1b[${color}mDeploying pod ${i + 1}/100 to ${['us-east-1', 'us-west-2', 'eu-west-1', 'ap-south-1', 'ap-northeast-1'][i % 5]}\x1b[0m`
        });
      }
      logs.push({
        timestamp: `2024-11-14T14:18:00.${String(lineNum++).padStart(9, '0')}Z`,
        message: '\x1b[0Ksection_end:1700000012:kubernetes\r\x1b[0K'
      });

      // Health Checks (100 lines)
      logs.push({
        timestamp: `2024-11-14T14:18:01.${String(lineNum++).padStart(9, '0')}Z`,
        message: '\x1b[0Ksection_start:1700000013:health_checks\r\x1b[0K\x1b[1m\x1b[32m    ✓ Health Checks\x1b[0m'
      });
      for (let i = 0; i < 100; i++, lineNum++) {
        const color = colors[i % colors.length];
        logs.push({
          timestamp: `2024-11-14T14:19:${String(i % 60).padStart(2, '0')}.${String(lineNum).padStart(9, '0')}Z`,
          level: levels[i % levels.length],
          message: `\x1b[${color}m\x1b[32m✓\x1b[0m Health check ${i + 1}/100: ${['HTTP', 'Database', 'Cache', 'Queue', 'Storage'][i % 5]} - OK\x1b[0m`
        });
      }
      logs.push({
        timestamp: `2024-11-14T14:19:00.${String(lineNum++).padStart(9, '0')}Z`,
        message: '\x1b[0Ksection_end:1700000013:health_checks\r\x1b[0K'
      });
      logs.push({
        timestamp: `2024-11-14T14:19:01.${String(lineNum++).padStart(9, '0')}Z`,
        level: 'info',
        message: '\x1b[32m✓ Deployment completed\x1b[0m'
      });
      logs.push({
        timestamp: `2024-11-14T14:19:02.${String(lineNum++).padStart(9, '0')}Z`,
        message: '\x1b[0Ksection_end:1700000010:deploy\r\x1b[0K'
      });

      logs.push({
        timestamp: `2024-11-14T14:19:03.${String(lineNum++).padStart(9, '0')}Z`,
        level: 'info',
        message: `\x1b[1m\x1b[32m✓ Deployment pipeline completed successfully - ${lineNum} log lines processed\x1b[0m`
      });
      logs.push({
        timestamp: `2024-11-14T14:19:04.${String(lineNum++).padStart(9, '0')}Z`,
        message: '\x1b[0Ksection_end:1700000001:deployment\r\x1b[0K'
      });

      return logs;
    })()
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
