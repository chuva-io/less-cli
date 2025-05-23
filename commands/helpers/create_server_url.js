import config from '../../utils/config.js';

const create_server_url = (organization_id, url) => {
    return `${config.LESS_SERVER_BASE_URL}/v1/${organization_id ? `organizations/${organization_id}/` : ''}${url}`;
};

export default create_server_url;