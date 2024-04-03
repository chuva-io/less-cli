import { 
  inquire_unanswered_questions, 
  create_file,
  create_folder,
  language_file_names
} from '../../helpers/index.js';

const questions = [
  {
    type: 'input',
    name: 'name',
    message: 'Enter the name of the Cloud Function to create. (E.g. "add_numbers")',
    default: 'add_numbers',
    validate: function (input) {
      if (!/^[a-zA-Z][-a-zA-Z0-9_]*$/.test(input)) {
        return 'The Cloud Function should only contain alphanumeric characters, "-", or "_"';
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
  const file_name = language_file_names[answers.language];
  const folder_path = `less/functions/${answers.name}`;
  const file_content = templates[answers.language];
  create_file(folder_path, file_name, file_content);
};

const js_template = `exports.process = ({ a, b }) => {
  return a + b;
};
`;

const py_template = `def process(data):
  return data['a'] + data['b']
`;

const templates = {
  js: js_template,
  py: py_template
};
