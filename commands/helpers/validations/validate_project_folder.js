import fs from 'fs';
import path from 'path';
const validate_project_dir = (project_path) => {
    const less_logic_path = path.join(project_path, 'less')
    if (!fs.existsSync(less_logic_path)) {
        throw new Error(`The folder ${project_path} is not a less project`);
    }
}

export default validate_project_dir;