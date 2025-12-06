---
title: "一键重装 Debian（VPS）"
type: "script"
---
使用 `bin456789/reinstall` 项目一键重装为 Debian 的示例脚本，适合在 VPS 上快速重装系统（注意先备份数据）：

```bash
curl -O https://raw.githubusercontent.com/bin456789/reinstall/main/reinstall.sh \
  || wget -O ${_##*/} $_ \
  && bash reinstall.sh debian --password 'YOUR_PASSWORD_HERE' \
  && reboot
```

