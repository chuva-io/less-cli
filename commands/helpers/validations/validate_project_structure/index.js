import path from 'path';
import fs from 'fs';

import validate_apis from './validate_apis/index.js';
import validate_crons from './validate_crons/index.js';
import validate_shared from './validate_shared/index.js';
import validate_topics from './validate_topics/index.js';
import validate_sockets from './validate_sockets/index.js';
import validate_cloud_functions from './validate_cloud_functions/index.js';
import validate_external_topics from './validate_external_topics/index.js';
import { ResourceHandlerNotFoundException, ResourceNameInvalidException } from './errors/index.js';

export default async (project_path) => {
  const project_less_path = path.join(project_path, 'less');
  const resources_types = ['apis', 'crons', 'shared', 'topics', 'sockets', 'functions', 'external_topics'];

  const less_allowed_folders_message = 
    `The "less" folder should only contain folders that match the following:${
      resources_types.map(resource_type => `\n\t- ${resource_type}`).join('')
    }`;

  let resources_found = false;
  fs.readdirSync(project_less_path).forEach(resource_type => {
    const resource_path = path.join(project_less_path, resource_type);

    if (
      !fs.statSync(resource_path).isDirectory()
      || !resources_types.includes(resource_type)
    ) {
      throw new ResourceNameInvalidException(`Invalid resource type "${resource_type}" in the "less" folder.\n${less_allowed_folders_message}`);
    }

    const resources_exists = (
      fs.existsSync(resource_path)
      && fs
        .readdirSync(resource_path)
        .filter(element => fs.statSync(path.join(resource_path, element)).isDirectory())
        .length
    );
  
    if (resources_exists) {
      resources_found = true;
    }
  });

  if (!resources_found) {
    throw new ResourceHandlerNotFoundException(`No resources found in the "less" folder. ${less_allowed_folders_message}`);
  }

  validate_apis(project_less_path);
  await validate_crons(project_less_path);
  validate_shared(project_less_path);
  validate_topics(project_less_path);
  validate_sockets(project_less_path);
  validate_cloud_functions(project_less_path);
  validate_external_topics(project_less_path);
}
