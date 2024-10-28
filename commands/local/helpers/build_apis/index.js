import fs from 'fs';
import path from 'path';
import build from './build.js';

const topics_api_route = `const { topics } = require('@chuva.io/less');

exports.process = async (req, res) => {
  const { topic_id } = req.params;

  if (!topics[topic_id]) {
    res.statusCode = 404;
    res.body = JSON.stringify({ error: 'Topic not found' });

    return res;
  }

  await topics[topic_id].publish(JSON.parse(req.body));

  res.statusCode = 202;
  return res;
};
`;

export default (config) => {
  const project_topics_path = path.resolve(
    config.project_less_resources_location,
    config.less_resources.topics
  );

  const created_topic_api_path = path.resolve(
    config.project_less_resources_location,
    config.less_resources.apis,
    'topic',
    'topics',
    '{topic_id}'
  );

  const topics_resources_exists = fs.existsSync(project_topics_path)
    && Boolean(fs.readdirSync(project_topics_path).length);

  if (topics_resources_exists) {
    fs.mkdirSync(created_topic_api_path, { recursive: true });
    fs.writeFileSync(
      path.resolve(
        created_topic_api_path,
        'post.js'
      ),
      topics_api_route
    );
  }

  build(config);

  if (fs.existsSync(created_topic_api_path)) {
    const path_to_remove = created_topic_api_path.split('/');
    path_to_remove.pop();
    path_to_remove.pop();
    fs.rmSync(path_to_remove.join('/'), { recursive: true, force: true });
  }
}