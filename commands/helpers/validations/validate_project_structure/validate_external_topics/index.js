import fs from 'fs';
import path from 'path';

import validate_resource_instance_name from '../../validate_resources_instances_names.js';
import { ResourceNameInvalidException, ResourceHandlerNotFoundException } from '../errors/index.js';

export default (project_less_path) => {
  const external_topics_projects_path = path.join(project_less_path, 'external_topics');
  
  if (!fs.existsSync(external_topics_projects_path)) {
    return;
  }

  const external_topics_projects_placeholders = fs
    .readdirSync(external_topics_projects_path)
    .filter((element) => fs
      .statSync(path.join(external_topics_projects_path, element))
      .isDirectory()
    );

  if (!external_topics_projects_placeholders.length) {
    return;
  }

  external_topics_projects_placeholders.forEach((external_topics_project_placeholder) => {
    if (!validate_resource_instance_name(external_topics_project_placeholder)) {
      throw new ResourceNameInvalidException(
        `Invalid project placeholder name "${external_topics_project_placeholder}" for external topics.
${validate_resource_instance_name.regexConstrainMessage}.`
      );
    }

    const external_project_topics_path = path.join(
      external_topics_projects_path,
      external_topics_project_placeholder
    );

    const topics = fs
      .readdirSync(external_project_topics_path)
      .filter(element => fs
        .statSync(path.join(external_project_topics_path, element))
        .isDirectory()
      );

    if (!topics.length) {
      throw new ResourceHandlerNotFoundException(
        `external project "${external_topics_project_placeholder}" located at "less/external_topics", should contain at least one topic.`
      );
    }

    topics.forEach(topic => {
      if (!validate_resource_instance_name(topic)) {
        throw new ResourceNameInvalidException(
          `Invalid external topic name "${topic}" located on "less/external_topics/${external_topics_project_placeholder}".
${validate_resource_instance_name.regexConstrainMessage}`
        );
      }

      const topic_path = path.join(external_project_topics_path, topic);
      const topic_processors = fs
        .readdirSync(topic_path)
        .filter(element => fs
          .statSync(path.join(topic_path, element))
          .isDirectory()
        );

      if (!topic_processors.length) {
        throw new ResourceHandlerNotFoundException(
          `External topic "${topic}" from external project placholder "${external_topics_project_placeholder}" should contain at least one processor.`
        );
      }

      topic_processors.forEach(processor => {
        if (!validate_resource_instance_name(processor)) {
          throw new ResourceNameInvalidException(
            `Invalid processor name "${processor}" from external topic "${topic}" located at "less/external_topics/${external_topics_project_placeholder}".
${validate_resource_instance_name.regexConstrainMessage}`
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
            `Processor "${processor}" from external topic "${topic}" located at "less/external_topics/${external_topics_project_placeholder}, doesn't have a handler file named "index.js", "index.ts", or "__init__.py".`
          );
        }
      })
    });
  });
}