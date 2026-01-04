import {Octokit} from '@octokit/rest';
import {Logger} from 'loglevel';
import {RepositoryInput, RepositoryResult} from '../types/repository';

interface RepositoryService {
  createRepository: (input: RepositoryInput) => Promise<RepositoryResult>;
  createFromTemplate: (input: RepositoryInput) => Promise<RepositoryResult>;
  createNewRepository: (input: RepositoryInput) => Promise<RepositoryResult>;
}

export const getRepositoryService = (client: Octokit, log: Logger): RepositoryService => {
  const createFromTemplate = async (input: RepositoryInput): Promise<RepositoryResult> => {
    if (!input.template) {
      throw new Error('Template repository is required');
    }

    const [templateOwner, templateRepo] = input.template.split('/');
    if (!templateOwner || !templateRepo) {
      throw new Error('Invalid template format. Expected format: owner/repository');
    }

    log.info(`Creating repository from template: ${templateOwner}/${templateRepo}`);

    try {
      const response = await client.repos.createUsingTemplate({
        template_owner: templateOwner,
        template_repo: templateRepo,
        owner: input.organization || undefined,
        name: input.name,
        description: input.description,
        private: input.private,
        include_all_branches: false,
      });

      return {
        id: response.data.id,
        full_name: response.data.full_name,
        html_url: response.data.html_url,
      };
    } catch (error) {
      throw new Error(`Failed to create repository from template: ${error}`);
    }
  };

  const createNewRepository = async (input: RepositoryInput): Promise<RepositoryResult> => {
    log.info('Creating new repository');

    try {
      let response;

      if (input.organization) {
        // Create in organization
        response = await client.repos.createInOrg({
          org: input.organization,
          name: input.name,
          description: input.description,
          private: input.private,
          auto_init: input.autoInit,
          gitignore_template: input.gitignoreTemplate || undefined,
          license_template: input.licenseTemplate || undefined,
        });
      } else {
        // Create for authenticated user
        response = await client.repos.createForAuthenticatedUser({
          name: input.name,
          description: input.description,
          private: input.private,
          auto_init: input.autoInit,
          gitignore_template: input.gitignoreTemplate || undefined,
          license_template: input.licenseTemplate || undefined,
        });
      }

      return {
        id: response.data.id,
        full_name: response.data.full_name,
        html_url: response.data.html_url,
      };
    } catch (error) {
      throw new Error(`Failed to create new repository: ${error}`);
    }
  };

  const createRepository = async (input: RepositoryInput): Promise<RepositoryResult> => {
    try {
      // If template is provided, create from template
      if (input.template) {
        return await createFromTemplate(input);
      }

      // Otherwise, create a new repository
      return await createNewRepository(input);
    } catch (error) {
      throw new Error(`Failed to create repository: ${error}`);
    }
  };

  return {
    createRepository,
    createFromTemplate,
    createNewRepository,
  };
};
