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
    message: 'Enter the name of the Module to create. (E.g. "orm_models")',
    default: 'orm_models',
    validate: function (input) {
      if (!/^[a-zA-Z][-a-zA-Z0-9_]*$/.test(input)) {
        return 'The Shared Module should only contain alphanumeric characters, "-", or "_"';
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
  const folder_path = `less/shared/${answers.name}`;
  create_file(folder_path, file_name);
};
