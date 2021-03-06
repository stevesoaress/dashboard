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

import { injectIntl } from 'react-intl';
import React from 'react';
import { urls } from '@tektoncd/dashboard-utils';
import { Link } from 'react-router-dom';
import { Accordion, AccordionItem } from 'carbon-components-react';
import { Table } from '@tektoncd/dashboard-components';

import './Trigger.scss';

const Trigger = ({ intl, eventListenerNamespace, trigger }) => {
  const tableHeaders = [
    {
      key: 'name',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.name',
        defaultMessage: 'Name'
      })
    },
    {
      key: 'value',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.value',
        defaultMessage: 'Value'
      })
    }
  ];

  return (
    <div>
      <h3>Trigger: {trigger.name}</h3>
      <div className="triggerdetails">
        {trigger.bindings && trigger.bindings.length !== 0 && (
          <div className="triggerresourcelinks">
            <span className="resourcekind">
              {intl.formatMessage({
                id: 'dashboard.triggerDetails.triggerBindings',
                defaultMessage: 'TriggerBindings:'
              })}
            </span>
            <div>
              {trigger.bindings.map((binding, index) => (
                <span key={binding.name}>
                  <Link
                    className="triggerresourcelink"
                    to={urls.triggerBindings.byName({
                      namespace: eventListenerNamespace,
                      triggerBindingName: binding.name
                    })}
                  >
                    <span title={binding.name}>{binding.name}</span>
                  </Link>
                  {index !== trigger.bindings.length - 1 && <span>, </span>}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="triggerresourcelinks">
          <span className="resourcekind">
            {intl.formatMessage({
              id: 'dashboard.triggerDetails.triggerTemplate',
              defaultMessage: 'TriggerTemplate:'
            })}
          </span>

          <Link
            className="triggerresourcelink"
            to={urls.triggerTemplates.byName({
              namespace: eventListenerNamespace,
              triggerTemplateName: trigger.template.name
            })}
          >
            <span title={trigger.template.name}>{trigger.template.name}</span>
          </Link>
        </div>
      </div>

      {trigger.interceptors && trigger.interceptors.length !== 0 && (
        <div className="trigger--interceptors">
          <span className="resourcekind">
            {intl.formatMessage({
              id: 'dashboard.triggerDetails.interceptors',
              defaultMessage: 'Interceptors:'
            })}
          </span>
          <Accordion
            className="trigger--interceptors-accordian"
            title="Interceptors"
          >
            {trigger.interceptors.map((interceptor, index) => {
              let interceptorName;
              let interceptorType;
              let content;
              const namespaceText = intl.formatMessage({
                id: 'dashboard.triggerDetails.interceptorNamespace',
                defaultMessage: 'Namespace:'
              });
              const nameText = intl.formatMessage({
                id: 'dashboard.triggerDetails.interceptorName',
                defaultMessage: 'Name:'
              });
              if (interceptor.webhook) {
                // Webhook Interceptor
                if (!interceptor.webhook.objectRef) {
                  return null;
                }
                interceptorType = 'Webhook';
                interceptorName = interceptor.webhook.objectRef.name;
                let headerValues = [];
                if (interceptor.webhook.header) {
                  headerValues = interceptor.webhook.header.map(header => {
                    const headerValue = {
                      id: header.name,
                      name: header.name,
                      value: header.value
                    };
                    // Concatenate values with a comma if value is an array
                    if (Array.isArray(header.value)) {
                      headerValue.value = header.value.join(', ');
                    }
                    return headerValue;
                  });
                }
                const serviceText = intl.formatMessage({
                  id: 'dashboard.triggerDetails.webhookInterceptorService',
                  defaultMessage: 'Service:'
                });
                content = (
                  <>
                    <p>{serviceText}</p>
                    <div className="interceptor--service-details">
                      <p>
                        {nameText} {interceptor.webhook.objectRef.name}
                      </p>
                      {interceptor.webhook.objectRef.namespace && (
                        <p>
                          {namespaceText}{' '}
                          {interceptor.webhook.objectRef.namespace}
                        </p>
                      )}
                    </div>
                    {headerValues.length !== 0 && (
                      <>
                        <p>
                          {intl.formatMessage({
                            id: 'dashboard.triggerDetails.interceptorHeader',
                            defaultMessage: 'Header:'
                          })}
                        </p>
                        <Table
                          headers={tableHeaders}
                          rows={headerValues}
                          emptyTextAllNamespaces={intl.formatMessage({
                            id: 'dashboard.trigger.noHeaders',
                            defaultMessage:
                              'No headers found for this interceptor.'
                          })}
                          emptyTextSelectedNamespace={intl.formatMessage({
                            id: 'dashboard.trigger.noHeaders',
                            defaultMessage:
                              'No headers found for this interceptor.'
                          })}
                          isSortable={false}
                        />
                      </>
                    )}
                  </>
                );
              } else if (interceptor.github || interceptor.gitlab) {
                let data;
                if (interceptor.github) {
                  // GitHub Interceptor
                  interceptorType = 'GitHub';
                  data = interceptor.github;
                } else {
                  // GitLab Interceptor
                  interceptorType = 'GitLab';
                  data = interceptor.gitlab;
                }
                const eventTypes = data.eventTypes.join(', ');
                interceptorName = eventTypes;
                const secretText = intl.formatMessage({
                  id: 'dashboard.triggerDetails.webhookInterceptorSecret',
                  defaultMessage: 'Secret:'
                });
                const secretKeyText = intl.formatMessage({
                  id: 'dashboard.triggerDetails.webhookInterceptorSecretKey',
                  defaultMessage: 'Key:'
                });
                content = (
                  <>
                    <p>{secretText}</p>
                    <div className="interceptor--secret-details">
                      <p>
                        {nameText} {data.secretRef.secretName}
                      </p>
                      <p>
                        {secretKeyText} {data.secretRef.secretKey}
                      </p>
                      {data.secretRef.namespace && (
                        <p>
                          {namespaceText} {data.secretRef.namespace}
                        </p>
                      )}
                    </div>
                    <p>Event Types: {eventTypes}</p>
                  </>
                );
              } else if (interceptor.cel) {
                // CEL Interceptor
                interceptorType = 'CEL';
                interceptorName = interceptor.cel.filter;
                content = (
                  <>
                    <p>
                      {intl.formatMessage({
                        id: 'dashboard.triggerDetails.celInterceptorFilter',
                        defaultMessage: 'Filter:'
                      })}
                    </p>
                    <code className="bx--snippet--multi interceptor--cel-filter">
                      {interceptor.cel.filter}
                    </code>
                  </>
                );
              } else {
                return null;
              }
              const title = intl.formatMessage(
                {
                  id: 'dashboard.triggerDetails.interceptorTitle',
                  defaultMessage:
                    '{interceptorNumber}. ({interceptorType}) {interceptorName}'
                },
                {
                  interceptorNumber: index + 1,
                  interceptorType,
                  interceptorName
                }
              );
              return (
                <AccordionItem key={title} title={title}>
                  {content}
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      )}
    </div>
  );
};

export default injectIntl(Trigger);
