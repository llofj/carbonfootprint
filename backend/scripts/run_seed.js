const { exec } = require('child_process');
const path = require('path');

// 脚本路径
const seedScriptPath = path.join(__dirname, 'seed_leaderboard.js');

console.log('正在运行排名数据导入脚本...');
exec(`node ${seedScriptPath}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`执行脚本出错: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`脚本错误: ${stderr}`);
    return;
  }
  console.log(stdout);
  console.log('排名数据导入完成!');
}); 