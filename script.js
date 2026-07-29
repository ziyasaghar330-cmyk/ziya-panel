// ZIYA Panel - VPN Config Management System
// Standalone Version

class ZiyaPanel {
    constructor() {
        this.isLoggedIn = false;
        this.adminPassword = '990099Zz'; // Default password - change in production
        this.users = [];
        this.settings = {
            botLink: 'https://t.me/your_bot',
            theme: 'dark'
        };
        
        this.initializeStorage();
        this.setupEventListeners();
        this.checkLoginStatus();
    }

    initializeStorage() {
        // Load data from localStorage
        const savedUsers = localStorage.getItem('ziya_users');
        const savedSettings = localStorage.getItem('ziya_settings');
        const savedPassword = localStorage.getItem('ziya_password');
        
        if (savedUsers) {
            this.users = JSON.parse(savedUsers);
        }
        
        if (savedSettings) {
            this.settings = JSON.parse(savedSettings);
        }
        
        if (savedPassword) {
            this.adminPassword = savedPassword;
        }
        
        // Add sample users if none exist
        if (this.users.length === 0) {
            this.users = [
                {
                    id: 1,
                    username: 'user1',
                    volume: 5,
                    duration: 30,
                    price: 50000,
                    subLink: 'https://example.com/sub/user1',
                    status: 'active',
                    createdAt: new Date().toISOString(),
                    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                },
                {
                    id: 2,
                    username: 'user2',
                    volume: 10,
                    duration: 60,
                    price: 100000,
                    subLink: 'https://example.com/sub/user2',
                    status: 'active',
                    createdAt: new Date().toISOString(),
                    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
                }
            ];
            this.saveUsers();
        }
    }

    setupEventListeners() {
        // Login Form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Add User Button
        document.getElementById('add-user-btn').addEventListener('click', () => {
            this.openUserModal();
        });

        // User Form
        document.getElementById('user-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddUser();
        });

        // Close Modal Buttons
        document.getElementById('close-modal-btn').addEventListener('click', () => {
            this.closeUserModal();
        });

        document.getElementById('close-settings-btn').addEventListener('click', () => {
            this.closeSettingsModal();
        });

        // Settings
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.openSettingsModal();
        });

        document.getElementById('settings-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSettings();
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // Theme Toggle
        document.getElementById('theme-btn').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Search and Filter
        document.getElementById('search-input').addEventListener('input', () => {
            this.renderUsers();
        });

        document.getElementById('status-filter').addEventListener('change', () => {
            this.renderUsers();
        });

        // Close modal when clicking outside
        document.getElementById('user-modal').addEventListener('click', (e) => {
            if (e.target.id === 'user-modal') {
                this.closeUserModal();
            }
        });

        document.getElementById('settings-modal').addEventListener('click', (e) => {
            if (e.target.id === 'settings-modal') {
                this.closeSettingsModal();
            }
        });
    }

    handleLogin() {
        const password = document.getElementById('password-input').value;
        
        if (password === this.adminPassword) {
            this.isLoggedIn = true;
            localStorage.setItem('ziya_logged_in', 'true');
            this.showPage('dashboard-page');
            this.renderDashboard();
            this.showToast('خوش آمدید!', 'success');
        } else {
            this.showToast('رمز عبور اشتباه است', 'error');
        }
    }

    logout() {
        if (confirm('آیا می‌خواهید خروج کنید؟')) {
            this.isLoggedIn = false;
            localStorage.removeItem('ziya_logged_in');
            document.getElementById('password-input').value = '';
            this.showPage('login-page');
            this.showToast('خروج موفق', 'success');
        }
    }

    checkLoginStatus() {
        const loggedIn = localStorage.getItem('ziya_logged_in') === 'true';
        if (loggedIn) {
            this.isLoggedIn = true;
            this.showPage('dashboard-page');
            this.renderDashboard();
        } else {
            this.showPage('login-page');
        }
    }

    showPage(pageId) {
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('dashboard-page').classList.add('hidden');
        document.getElementById(pageId).classList.remove('hidden');
    }

    renderDashboard() {
        this.updateStats();
        this.renderUsers();
    }

    updateStats() {
        const totalUsers = this.users.length;
        const activeUsers = this.users.filter(u => u.status === 'active').length;
        const totalTraffic = this.users.reduce((sum, u) => sum + u.volume, 0);
        const totalRevenue = this.users.reduce((sum, u) => sum + u.price, 0);

        document.getElementById('total-users').textContent = totalUsers;
        document.getElementById('active-users').textContent = activeUsers;
        document.getElementById('total-traffic').textContent = totalTraffic + ' GB';
        document.getElementById('total-revenue').textContent = totalRevenue.toLocaleString('fa-IR') + ' تومان';
    }

    renderUsers() {
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        const statusFilter = document.getElementById('status-filter').value;

        let filteredUsers = this.users.filter(user => {
            const matchesSearch = user.username.toLowerCase().includes(searchTerm);
            const matchesStatus = !statusFilter || user.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = '';

        if (filteredUsers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-gray-400">کاربری یافت نشد</td></tr>';
            return;
        }

        filteredUsers.forEach(user => {
            const expiresDate = new Date(user.expiresAt);
            const daysLeft = Math.ceil((expiresDate - new Date()) / (1000 * 60 * 60 * 24));
            
            const row = document.createElement('tr');
            row.className = 'fade-in';
            row.innerHTML = `
                <td class="py-3 px-4">${user.username}</td>
                <td class="py-3 px-4">
                    <span class="badge-${user.status}">
                        ${user.status === 'active' ? '✅ فعال' : '❌ غیرفعال'}
                    </span>
                </td>
                <td class="py-3 px-4">${user.volume} GB</td>
                <td class="py-3 px-4">${daysLeft} روز</td>
                <td class="py-3 px-4">${user.price.toLocaleString('fa-IR')} تومان</td>
                <td class="py-3 px-4 flex gap-2">
                    <button onclick="panel.copySubLink('${user.subLink}')" class="text-blue-400 hover:text-blue-300" title="کپی لینک">📋</button>
                    <button onclick="panel.editUser(${user.id})" class="text-yellow-400 hover:text-yellow-300" title="ویرایش">✏️</button>
                    <button onclick="panel.toggleUserStatus(${user.id})" class="text-green-400 hover:text-green-300" title="تغییر وضعیت">🔄</button>
                    <button onclick="panel.deleteUser(${user.id})" class="text-red-400 hover:text-red-300" title="حذف">🗑️</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        this.updateStats();
    }

    openUserModal(userId = null) {
        const modal = document.getElementById('user-modal');
        const title = document.getElementById('modal-title');
        
        if (userId) {
            title.textContent = 'ویرایش کاربر';
            const user = this.users.find(u => u.id === userId);
            document.getElementById('username-input').value = user.username;
            document.getElementById('volume-input').value = user.volume;
            document.getElementById('duration-input').value = user.duration;
            document.getElementById('price-input').value = user.price;
            document.getElementById('sub-link-input').value = user.subLink;
            document.getElementById('user-form').dataset.userId = userId;
        } else {
            title.textContent = 'افزودن کاربر جدید';
            document.getElementById('user-form').reset();
            delete document.getElementById('user-form').dataset.userId;
        }
        
        modal.classList.remove('hidden');
    }

    closeUserModal() {
        document.getElementById('user-modal').classList.add('hidden');
        document.getElementById('user-form').reset();
    }

    handleAddUser() {
        const username = document.getElementById('username-input').value;
        const volume = parseInt(document.getElementById('volume-input').value);
        const duration = parseInt(document.getElementById('duration-input').value);
        const price = parseInt(document.getElementById('price-input').value);
        const subLink = document.getElementById('sub-link-input').value;
        
        const userId = document.getElementById('user-form').dataset.userId;
        
        if (userId) {
            // Edit existing user
            const userIndex = this.users.findIndex(u => u.id === parseInt(userId));
            if (userIndex !== -1) {
                this.users[userIndex] = {
                    ...this.users[userIndex],
                    username,
                    volume,
                    duration,
                    price,
                    subLink
                };
                this.showToast('کاربر با موفقیت ویرایش شد', 'success');
            }
        } else {
            // Add new user
            const newUser = {
                id: Math.max(...this.users.map(u => u.id), 0) + 1,
                username,
                volume,
                duration,
                price,
                subLink,
                status: 'active',
                createdAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString()
            };
            this.users.push(newUser);
            this.showToast('کاربر جدید اضافه شد', 'success');
        }
        
        this.saveUsers();
        this.closeUserModal();
        this.renderUsers();
    }

    editUser(userId) {
        this.openUserModal(userId);
    }

    deleteUser(userId) {
        if (confirm('آیا می‌خواهید این کاربر را حذف کنید؟')) {
            this.users = this.users.filter(u => u.id !== userId);
            this.saveUsers();
            this.renderUsers();
            this.showToast('کاربر حذف شد', 'success');
        }
    }

    toggleUserStatus(userId) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            user.status = user.status === 'active' ? 'inactive' : 'active';
            this.saveUsers();
            this.renderUsers();
            this.showToast(`وضعیت کاربر به ${user.status === 'active' ? 'فعال' : 'غیرفعال'} تغییر یافت`, 'success');
        }
    }

    copySubLink(link) {
        navigator.clipboard.writeText(link).then(() => {
            this.showToast('لینک کپی شد', 'success');
        }).catch(() => {
            this.showToast('خطا در کپی لینک', 'error');
        });
    }

    openSettingsModal() {
        document.getElementById('bot-link-input').value = this.settings.botLink;
        document.getElementById('settings-modal').classList.remove('hidden');
    }

    closeSettingsModal() {
        document.getElementById('settings-modal').classList.add('hidden');
    }

    handleSettings() {
        const newPassword = document.getElementById('new-password-input').value;
        const botLink = document.getElementById('bot-link-input').value;

        if (newPassword) {
            this.adminPassword = newPassword;
            localStorage.setItem('ziya_password', newPassword);
            this.showToast('رمز عبور تغییر یافت', 'success');
        }

        if (botLink) {
            this.settings.botLink = botLink;
            localStorage.setItem('ziya_settings', JSON.stringify(this.settings));
            this.showToast('تنظیمات ذخیره شد', 'success');
        }

        this.closeSettingsModal();
    }

    toggleTheme() {
        const isDark = document.body.classList.contains('dark');
        if (isDark) {
            document.body.classList.remove('dark');
            document.body.classList.add('light-mode');
            localStorage.setItem('ziya_theme', 'light');
        } else {
            document.body.classList.remove('light-mode');
            document.body.classList.add('dark');
            localStorage.setItem('ziya_theme', 'dark');
        }
    }

    saveUsers() {
        localStorage.setItem('ziya_users', JSON.stringify(this.users));
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize Panel
let panel;
document.addEventListener('DOMContentLoaded', () => {
    panel = new ZiyaPanel();
});
