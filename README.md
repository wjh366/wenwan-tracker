# 📿 文玩盘玩记录

记录百香籽、金刚菩提、星月菩提等手串的盘玩过程与包浆颜色变化。纯静态单页应用，无需构建，数据保存在浏览器本地（localStorage），可离线使用。

## 功能
- 管理多条手串：名称、材质、开盘日期、备注
- 每日记录：日期、盘玩时长、佩戴时长、方式标签（手盘/刷/佩戴/手套）、照片、备注
- 照片自动缩放（最长边 800px）并提取中心 30% 区域平均色
- 颜色变化时间线：色块条 + 色相/亮度折线图；累计盘玩/佩戴小时数
- JSON 备份导出/导入

## 使用
直接双击打开 `index.html`，或本地启动：
```bash
python3 -m http.server 8000   # 然后访问 http://localhost:8000
```
也可部署到 GitHub Pages 等任何静态托管。

在线访问：https://wjh366.github.io/wenwan-tracker/

## 注意
- 数据仅存于当前浏览器，清除浏览器数据会丢失，请定期导出备份。
- localStorage 容量约 5MB，照片较多时可能写满。
- 拍照时尽量保持相同光线、背景与角度，颜色对比才有意义。

## English
A tiny offline, no-build static web app to track patina/color changes of bead bracelets (bodhi seeds etc.). Log daily handling time, methods and photos; average color of each photo's center is extracted and plotted over time. Data lives in localStorage; export/import JSON backups. Open `index.html` or serve with any static server.

## License
MIT © Wang Jinhan
