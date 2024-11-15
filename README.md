# BoardX Theme Demo

这是一个用于学习Ghost主题开发的演示项目，集成了Tailwind CSS。

## 快速开始

### 1. 环境要求

- Node.js (推荐 v16+)
- Ghost CLI
- npm 或 yarn

### 2. 克隆项目

```bash
git clone [项目地址]
cd ghost_demo
```

### 3. 环境变量配置

1. 复制环境变量模板文件：
```bash
cp .env.example .env
```

2. 获取Ghost Admin API Key：
   - 访问Ghost管理面板 (http://localhost:2368/ghost/)
   - 进入Settings > Integrations
   - 点击"Add custom integration"
   - 填写名称（如"Theme Management"）
   - 复制Admin API Key（格式为 {key_id}:{key_secret}）
   - 将API Key添加到.env文件中

### 4. 安装依赖

1. 安装Ghost：
```bash
ghost install local
```

2. 安装主题依赖：
```bash
cd content/themes/boardx_theme_demo
npm install
```

3. 构建主题样式：
```bash
npm run build
```

### 5. 实用脚本说明

项目包含几个实用的管理脚本，使用前请确保已正确配置环境变量：

1. `generate_posts.js`
   - 用途：生成示例文章
   - 运行：`node content/generate_posts.js`
   - 功能：创建20篇测试文章，包含随机标签和内容

2. `delete_posts.js`
   - 用途：清理文章（保留"Coming soon"文章）
   - 运行：`node content/delete_posts.js`
   - 功能：删除所有测试文章，但保留特定文章

3. `create_sample_page.js`
   - 用途：创建示例页面
   - 运行：`node content/create_sample_page.js`
   - 功能：创建一个展示主题特性的示例页面

4. `update_about_page.js`
   - 用途：更新About页面
   - 运行：`node content/update_about_page.js`
   - 功能：使用预设模板更新About页面内容

### 6. 开发模式

1. 启动Ghost：
```bash
ghost start
```

2. 启动主题开发服务器：
```bash
cd content/themes/boardx_theme_demo
npm run dev
```

现在你可以访问：
- 网站首页：http://localhost:2368
- 管理面板：http://localhost:2368/ghost/

### 7. 主题结构

```
boardx_theme_demo/
├── assets/
│   └── css/
│       ├── screen.css      # 编译后的CSS
│       └── tailwind.css    # Tailwind源文件
├── default.hbs            # 基础模板
├── index.hbs             # 首页模板
├── post.hbs              # 文章页模板
├── page.hbs              # 普通页面模板
├── page-about.hbs        # About页面专用模板
├── tag.hbs              # 标签页模板
└── package.json         # 项目配置文件
```

### 8. Git相关说明

项目已配置.gitignore文件，以下文件不会被提交到仓库：
- node_modules/
- .env（包含敏感信息）
- 构建输出文件（如screen.css）
- 编辑器配置文件
- 临时文件和日志

在提交代码前请确保：
1. 敏感信息（如API密钥）已从代码中移除
2. 环境变量已正确配置在.env文件中
3. 构建产物未被提交
4. 已更新.env.example作为配置参考

### 9. 常见问题

1. API脚本报错
   - 检查.env文件是否存在
   - 确认API Key是否正确
   - 确保Ghost服务正在运行

2. 样式不生效
   - 运行 `npm run build` 重新构建样式
   - 检查Ghost主题是否正确激活

3. 页面模板不生效
   - 重启Ghost服务
   - 检查模板文件命名是否正确

## 许可证

MIT License
