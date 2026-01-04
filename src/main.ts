import * as core from '@actions/core';
import {FoundryInitializer} from './types/types';
import {RepositoryInput} from './api/types/repository';
import {getLogger} from './util/logger';
import {getOctokitClient} from './config/config';
import {getRepositoryService} from './api/services/repositoryService';
import {APP_NAME} from './constants/constants';

const getInitializer = async (): Promise<FoundryInitializer> => {
  try {
    // 1. Gather input from GitHub Actions
    const input: RepositoryInput = {
      token: core.getInput('github-token', {required: true}),
      name: core.getInput('repository-name', {required: true}),
      description: core.getInput('repository-description'),
      private: core.getInput('repository-private') === 'true',
      template: core.getInput('repository-template'),
      organization: core.getInput('organization'),
      autoInit: core.getInput('auto-init') === 'true',
      gitignoreTemplate: core.getInput('gitignore-template'),
      licenseTemplate: core.getInput('license-template'),
    };

    // 2. Initialize logger and clients
    const log = getLogger(APP_NAME);
    const octokitClient = getOctokitClient(input.token);

    // 3. Return complete initializer object
    return {input, octokitClient, log};
  } catch (error) {
    throw new Error(`Failed to initialize Foundry: ${error}`);
  }
};

// Eager initialization
const initialize = getInitializer();

export const run = async (): Promise<void> => {
  try {
    // Wait for initialization to complete
    const {input, octokitClient, log} = await initialize;

    log.info('Foundry initialized');
    log.info(`Creating repository: ${input.name}`);

    // Get repository service with injected dependencies
    const repositoryService = getRepositoryService(octokitClient, log);

    // Create the repository
    const result = await repositoryService.createRepository(input);

    // Set outputs
    core.setOutput('repository-url', result.html_url);
    core.setOutput('repository-name', result.full_name);
    core.setOutput('repository-id', result.id.toString());

    log.info(`Repository created successfully: ${result.html_url}`);
    core.info(`Repository created successfully: ${result.html_url}`);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed('An unknown error occurred');
    }
  }
};
