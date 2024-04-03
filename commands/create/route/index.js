import { 
  inquire_unanswered_questions, 
  create_file 
} from '../../helpers/index.js';

const questions = [
  {
    type: 'input',
    name: 'name',
    message: 'Enter the name of the API to create the route for. (E.g. "store_api")',
    validate: function (input) {
      if (!/^[a-zA-Z][-a-zA-Z0-9_]*$/.test(input)) {
        return 'The API name should only contain alphanumeric characters, "-", or "_"';
      }
      return true;
    },
  },
  {
    type: 'input',
    name: 'path',
    message: "Enter the HTTP route path to create. (E.g. '/orders/{order_id}')",
  },
  {
    type: 'list',
    name: 'language',
    message: "Enter the programming language to use for the code.",
    choices: ['js', 'py']
  },
  {
    type: 'list',
    name: 'verb',
    message: "The HTTP verb to use for the route.",
    choices: ['get', 'post', 'put', 'patch', 'delete']
  }
]

export default async (options) => {
  const answers = await inquire_unanswered_questions(options, questions);
  const folder_path = `less/apis/${answers.name}${answers.path}`;
  const file_name = `${answers.verb}.${answers.language}`;
  const file_content = templates[answers.language];
  create_file(folder_path, file_name, file_content);
};

const js_template = `exports.process = async (request, response) => {
  response.body = 'Hello, world.';
  return response;
};
`;

const py_template = `def process(request, response):
  response['body'] = 'Hello, world.'
  return response
`;

const templates = {
  js: js_template,
  py: py_template
};
