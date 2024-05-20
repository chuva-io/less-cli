import { 
  inquire_unanswered_questions, 
  create_file,
  create_folder,
  language_file_names
} from '../../helpers/index.js';

const questions = [
  {
    type: 'rawList',
    name: 'names',
    message: 'Enter a list of Subscribers to create. (E.g. "send_welcome_email send_to_analytics")',
    default: 'send_welcome_email send_to_analytics',
    validate: function (input) {
      if (!/^[a-zA-Z][-a-zA-Z0-9_]*$/.test(input)) {
        return 'The Subscribers to the Topic should only contain alphanumeric characters, "-", or "_"';
      }
      return true;
    },
  },
  {
    type: 'input',
    name: 'topic',
    message: 'Enter the name of the Topic to create or to add Subscribers to. (E.g. "user_created")',
    default: 'user_created',
    validate: function (input) {
      if (!/^[a-zA-Z][-a-zA-Z0-9_]*$/.test(input)) {
        return 'The Topic name should only contain alphanumeric characters, "-", or "_"';
      }
      return true;
    },
  },
  {
    type: 'list',
    name: 'language',
    message: "Enter the programming language to use for the code.",
    choices: ['js', 'py']
  }
]

export default async (options) => {
  const answers = await inquire_unanswered_questions(options, questions);
  
  let topic_path;
  if (answers.externalTopic) {
    topic_path = `less/external_topics/${answers.externalTopic}`;
  }
  else {
    topic_path = 'less/topics';
  }

  answers.names.forEach(subscriber => {
    let subscriber_folder_path = `${topic_path}/${answers.topic}/${subscriber}`;
    let subscriber_file_content = subscriber_templates[answers.language];
    const file_name = language_file_names[answers.language];
    create_file(subscriber_folder_path, file_name, subscriber_file_content);
  });
}

const js_subscriber_template = `exports.process = async (message) => {
  console.log(\`Processing message: $\{message\}\`);
};
`;

const py_subscriber_template = `def process(message):
  print(f"Processing message: \{message\}")
`;

const subscriber_templates = {
  js: js_subscriber_template,
  py: py_subscriber_template
};
