import fs from 'fs';
import path from 'path';

import validate_resource_instance_name from '../../validate_resources_instances_names.js';
import { ResourceNameInvalidException, ResourceHandlerNotFoundException } from '../errors/index.js';

export default (project_less_path) => {
  const topics_path = path.join(project_less_path, 'topics');

  if (!fs.existsSync(topics_path)) {
    return;
  }

  const topics = fs
    .readdirSync(topics_path)
    .filter(element => fs
      .statSync(path.join(topics_path, element))
      .isDirectory()
    );

  if (!topics.length) {
    return;
  }

  topics.forEach(topic => {
    if (!validate_resource_instance_name(topic)) {
      throw new ResourceNameInvalidException(
        `Invalid Topic name "${topic}". ${validate_resource_instance_name.regexConstrainMessage}.`
      );
    }

    const topic_path = path.join(topics_path, topic);
    const topic_processors = fs
      .readdirSync(topic_path)
      .filter(element => fs
        .statSync(path.join(topic_path, element))
        .isDirectory()
      );

    if (!topic_processors.length) {
      throw new Error(
        `Topic "${topic}" should contain at least one processor.`
      );
    }

    topic_processors.forEach(processor => {
      if (!validate_resource_instance_name(processor)) {
        throw new ResourceNameInvalidException(
          `Invalid processor name "${processor}" from topic "${topic}". ${validate_resource_instance_name.regexConstrainMessage}.`
        );
      }

      const processor_path = path.join(topic_path, processor);
      const processor_handler = fs
        .readdirSync(processor_path)
        .filter(element =>
          fs.statSync(path.join(processor_path, element)).isFile()
          && /^(index\.js|index\.ts|__init__\.py)$/.test(element)
        );

      if (!processor_handler.length) {
        throw new ResourceHandlerNotFoundException(
          `Processor "${processor}" from topic "${topic}", doesn't have a handler file named "index.js" or "__init__.py".`
        );
      }
    })
  });
}