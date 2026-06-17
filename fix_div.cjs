const fs = require('fs');

let content = fs.readFileSync('src/pages/Profile.jsx', 'utf8');
content += '\n</div>';

fs.writeFileSync('src/pages/Profile.jsx', content);
console.log('Added closing div');
