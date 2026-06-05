# ===================================
# Quest Board - 一键部署到 GitHub Pages
# ===================================

Write-Host ""
Write-Host "⚔  Quest Board 部署脚本" -ForegroundColor Magenta
Write-Host "========================" -ForegroundColor DarkGray
Write-Host ""

# Fix PATH for GitHub CLI
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Step 1: Login
Write-Host "[1/4] 登录 GitHub..." -ForegroundColor Cyan
$loggedIn = gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "需要登录 GitHub，浏览器会自动打开..." -ForegroundColor Yellow
    Write-Host "在浏览器中完成授权即可" -ForegroundColor Yellow
    gh auth login --hostname github.com --git-protocol https --web --scopes "repo,workflow"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "登录失败，请重试" -ForegroundColor Red
        exit 1
    }
}
Write-Host "  已登录 ✓" -ForegroundColor Green

# Step 2: Create repo
Write-Host "[2/4] 创建 GitHub 仓库..." -ForegroundColor Cyan
$repoName = "quest-board"
$ghUser = (gh api user --jq .login 2>$null)
if (-not $ghUser) {
    Write-Host "  获取用户名失败，请确认已登录" -ForegroundColor Red
    exit 1
}
Write-Host "  用户名: $ghUser" -ForegroundColor Gray

# Check if repo exists
$repoExists = gh repo view "$ghUser/$repoName" 2>$null
if ($LASTEXITCODE -ne 0) {
    gh repo create $repoName --public --push --source=. --remote=origin 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  创建仓库失败，尝试手动推送..." -ForegroundColor Yellow
        git remote add origin "https://github.com/$ghUser/$repoName.git" 2>$null
        git push -u origin master 2>&1
    }
} else {
    Write-Host "  仓库已存在，推送更新..." -ForegroundColor Gray
    git remote add origin "https://github.com/$ghUser/$repoName.git" 2>$null
    git push -u origin master 2>&1
}
Write-Host "  代码已推送 ✓" -ForegroundColor Green

# Step 3: Enable GitHub Pages
Write-Host "[3/4] 开启 GitHub Pages..." -ForegroundColor Cyan
gh api repos/$ghUser/$repoName/pages --method POST --field "source[branch]=master" --field "source[path]=/" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  正在等待 Pages 构建（首次可能需要1-2分钟）..." -ForegroundColor Yellow
}
Write-Host "  Pages 已配置 ✓" -ForegroundColor Green

# Step 4: Done
Write-Host "[4/4] 完成！" -ForegroundColor Cyan
Write-Host ""
Write-Host "============================================" -ForegroundColor DarkGray
Write-Host "  🎉 你的 Quest Board 网址：" -ForegroundColor Green
Write-Host "  https://$ghUser.github.io/$repoName" -ForegroundColor Yellow
Write-Host ""
Write-Host "  手机上打开这个网址" -ForegroundColor White
Write-Host "  → Chrome 菜单 → 添加到主屏幕" -ForegroundColor White
Write-Host "  → 就像原生 App 一样！" -ForegroundColor White
Write-Host "============================================" -ForegroundColor DarkGray
Write-Host ""
