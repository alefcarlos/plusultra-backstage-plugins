import { executeShellCommand } from '@backstage/plugin-scaffolder-backend';
import { resolveSafeChildPath } from '@backstage/backend-common';
import { InputError } from "@backstage/errors";

import { Config } from "@backstage/config";
import { ScmIntegrationRegistry } from "@backstage/integration";
import { spawn, SpawnOptionsWithoutStdio } from 'child_process';

import { createTemplateAction } from '@backstage/plugin-scaffolder-node';

export const dotnetNugetAddAction = (options: {
    integrations: ScmIntegrationRegistry;
  }) => {
    const { integrations } = options;

  

    return createTemplateAction<{ useConfiguredFeeds: boolean, packageSource: string }>({
        id: 'dotnet:nuget:add',
        description: 'Adds nuget sources',
        schema: {
            input: {
                type: 'object',
                properties: {
                    useConfiguredFeeds: {
                        type: 'boolean',
                        title: 'Use configured feeds from app-config.yml'
                    },
                    packageSource: {
                        type: 'string',
                        title: 'URL of the package source'
                    }
                },
            },
        },
        async handler(ctx) {
            //TODO: switch on incoming host to select integration
            const host = "github.com";
            const integrationConfig = integrations.github.byHost(host);
      
            if (!integrationConfig) {
              throw new InputError(
                `No matching integration configuration for host ${host}, please check your integrations config`
              );
            }
      
            if (!integrationConfig.config.token) {
              throw new InputError(`No token provided for Azure Integration ${host}`);
            }
      
            const token = integrationConfig.config.token!;

            var arg = ['nuget', 'add', 'source', ctx.input.packageSource, '-u', 'backstage', '-p', token, '--store-password-in-clear-text']
            
            const process = spawn('dotnet', arg);

            process.stdout.on('data', stream => {
                ctx.logStream.write(stream);
            });
        
            process.on('error', error => {
                ctx.logStream.write(error);
            });
        
            process.on('close', code => {
              if (code !== 0) {
                ctx.logStream.write(code.toString());
              }
             
            });


            ctx.logger.info(`lol`);
        },
    });
};

function stringify(value: any) {
    switch (typeof value) {
        case 'string': return value;
        case 'object': return JSON.stringify(value);
        default: return String(value);
    }
};


 
