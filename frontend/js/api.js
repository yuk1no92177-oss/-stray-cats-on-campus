// API 请求封装
const API = {
  baseURL: '/api',

  async request(method, url, data) {
    const config = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data && !(data instanceof FormData)) {
      config.body = JSON.stringify(data);
    } else if (data instanceof FormData) {
      // FormData 时删除 Content-Type 让浏览器自动设置
      delete config.headers['Content-Type'];
      config.body = data;
    }

    try {
      const res = await fetch(`${this.baseURL}${url}`, config);
      const result = await res.json();
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('login.html')) {
          window.location.href = 'login.html';
        }
      }
      return result;
    } catch (err) {
      console.error('API Error:', err);
      return { code: 500, msg: '网络错误', error: err.message };
    }
  },

  get(url) { return this.request('GET', url); },
  post(url, data) { return this.request('POST', url, data); },
  put(url, data) { return this.request('PUT', url, data); },
  delete(url) { return this.request('DELETE', url); },

  // 上传文件
  async upload(url, formData) {
    const config = { method: 'POST' };
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = { 'Authorization': `Bearer ${token}` };
    }
    config.body = formData;

    try {
      const res = await fetch(`${this.baseURL}${url}`, config);
      return await res.json();
    } catch (err) {
      return { code: 500, msg: '上传失败' };
    }
  }
};
