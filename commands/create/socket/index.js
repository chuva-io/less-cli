import { 
  inquire_unanswered_questions, 
  create_file ,
  language_file_names
} from '../../helpers/index.js';

import { socket as socket_templates } from '../../../utils/templates.js';

const questions = [
  {
    type: 'input',
    name: 'name',
    message: 'Enter the name of the Web Socket to create or to add channels to. (E.g. "realtime_chat")',
    default: 'realtime_chat',
    validate: function (input) {
      if (!/^[a-zA-Z][-a-zA-Z0-9_]*$/.test(input)) {
        return 'The Web Socket name should only contain alphanumeric characters, "-", or "_"';
      }
      return true;
    },
  },
  {
    type: 'list',
    name: 'language',
    message: "Enter the programming language to use for the code.",
    choices: ['js', 'ts', 'py']
  }
]

export default async (options) => {
  const answers = await inquire_unanswered_questions(options, questions);
  const file_name = language_file_names[answers.language];

  const connect_folder_path = `less/sockets/${answers.name}/connect`;
  const connect_file_content = connect_templates[answers.language];
  create_file(connect_folder_path, file_name, connect_file_content);
  
  const disconnect_folder_path = `less/sockets/${answers.name}/disconnect`;
  const disconnect_file_content = disconnect_templates[answers.language];
  create_file(disconnect_folder_path, file_name, disconnect_file_content);

  if (answers.channels) {
    answers.channels.forEach(channel => {
      let channel_folder_path = `less/sockets/${answers.name}/${channel}`;
      let channel_file_content = channel_templates[answers.language];
      create_file(channel_folder_path, file_name, channel_file_content);
    });
  }
}

const js_connect_template = `exports.process = async ({ connection_id }) => {
  console.log('Client connected: ' + connection_id);
  // Save the client's connection_id so you can send messages to them later.
};
`;

const js_disconnect_template = `exports.process = async ({ connection_id }) => {
  console.log('Client disconnected: ' + connection_id);
  // Delete the connection_id from your database.
};
`;

const py_connect_template = `def process(data):
  connection_id = data.get('connection_id')
  print(f'Client connected: {connection_id}');
  # Save the client's connection_id so you can send messages to them later.
`;

const py_disconnect_template = `def process(data):
  connection_id = data.get('connection_id')
  # Delete the connection_id from your database.
`;

const connect_templates = {
  js: js_connect_template,
  ts: socket_templates.load_connect_ts(),
  py: py_connect_template
};

const disconnect_templates = {
  js: js_disconnect_template,
  ts: socket_templates.load_disconnect_ts(),
  py: py_disconnect_template
};

const js_channel_template = `exports.process = async ({ data, connection_id }) => {
  console.log(\`Received message from: $\{connection_id\}\`);
  console.log(\`Message: $\{data\}\`);
};
`;

const py_channel_template = `def process(input_data):
  data = input_data.get('data')
  connection_id = input_data.get('connection_id')
`;

const channel_templates = {
  js: js_channel_template,
  ts: socket_templates.load_channel_ts(),
  py: py_channel_template
};
