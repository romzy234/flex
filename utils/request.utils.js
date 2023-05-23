const axios = require('axios');

exports.fetchRequest = async (url, method, headers, data, params) => {
  const options = {
    url: url,
    data,
    params,
    method,
    headers
  };

  const request = await axios(options);
  return request.data;
};
