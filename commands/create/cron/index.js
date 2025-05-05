import { 
  inquire_unanswered_questions, 
  create_file,
  language_file_names
} from '../../helpers/index.js';

import { cron as cron_templates } from '../../../utils/templates.js';

const questions = [
  {
    type: 'input',
    name: 'name',
    message: 'Enter the name of the CRON Job to create. (E.g. "generate_report")',
    default: 'generate_report',
    validate: function (input) {
      if (!/^[a-zA-Z][-a-zA-Z0-9_]*$/.test(input)) {
        return 'The CRON Job should only contain alphanumeric characters, "-", or "_"';
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
  const folder_path = `less/crons/${answers.name}`;

  const template_map = {
    js: js_template,
    ts: cron_templates.load_cron_ts(),
    py: py_template
  };

  const file_content = template_map[answers.language];
  create_file(folder_path, file_name, file_content);
};

const js_template = `exports.process = async () => {
  console.log('Running CRON job...');
};
`;

const py_template = `def process():
  print('Running CRON job...')
`;
