// 用户认证相关
const Auth = {
  // 检查是否登录
  isLoggedIn() {
    return !!localStorage.getItem('token');
  },

  // 获取当前用户
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // 是否是管理员
  isAdmin() {
    const user = this.getUser();
    return user && user.role === 'admin';
  },

  // 登录
  async login(username, password) {
    const res = await API.post('/users/login', { username, password });
    if (res.code === 200) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res;
  },

  // 注册
  async register(data) {
    return await API.post('/users/register', data);
  },

  // 退出
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  },

  // 获取用户信息
  async getProfile() {
    return await API.get('/users/profile');
  }
};

// 页面加载时更新导航栏状态
document.addEventListener('DOMContentLoaded', () => {
  // 更新底部导航高亮
  const navLinks = document.querySelectorAll('.bottom-nav a');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('text-orange-500');
      link.classList.add('font-bold');
    }
  });
});
