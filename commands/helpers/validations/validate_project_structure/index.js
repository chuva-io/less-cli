import path from 'path';

import validate_apis from './validate_apis/index.js';
import validate_crons from './validate_crons/index.js';
import validate_shared from './validate_shared/index.js';
import validate_topics from './validate_topics/index.js';
import validate_sockets from './validate_sockets/index.js';
import validate_cloud_functions from './validate_cloud_functions/index.js';
import validate_external_topics from './validate_external_topics/index.js';

export default (project_path) => {
  const project_less_path = path.join(project_path, 'less');

  validate_apis(project_less_path);
  validate_crons(project_less_path);
  validate_shared(project_less_path);
  validate_topics(project_less_path);
  validate_sockets(project_less_path);
  validate_cloud_functions(project_less_path);
  validate_external_topics(project_less_path);
}
