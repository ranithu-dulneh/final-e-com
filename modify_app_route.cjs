const fs = require('fs');

const filePath = 'src/App.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const importSearch = `import OrderHistory from "./pages/OrderHistory";`;
const importReplace = `import OrderHistory from "./pages/OrderHistory";
import WarrantyClaim from "./pages/WarrantyClaim";`;

content = content.replace(importSearch, importReplace);

const routeSearch = `              <Route path="/order-history" element={<OrderHistory />} />`;
const routeReplace = `              <Route path="/order-history" element={<OrderHistory />} />
              <Route path="/warranty-claim" element={<WarrantyClaim />} />`;

content = content.replace(routeSearch, routeReplace);
fs.writeFileSync(filePath, content);
console.log('Done routing warranty');
