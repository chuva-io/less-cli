import config from '../../utils/config.js';

const create_api_url = (organization_id, url) => {
    return `${config.LESS_API_BASE_URL}/v1/${organization_id ? `organizations/${organization_id}/` : ''}${url}`;
};

export default create_api_url;