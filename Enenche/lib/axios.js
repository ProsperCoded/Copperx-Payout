const axios = require("axios");

function getAxiosInstance(BASE_URL, headers = {}) {
    return {
        get(method, params) {
            return axios.get(`${BASE_URL}/${method}`, { params, headers });
        },
        post(method, data) {
            return axios.post(`${BASE_URL}/${method}`, data, { headers });
        }
    };
}

module.exports = { getAxiosInstance };
