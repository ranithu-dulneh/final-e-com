const fs = require('fs');

const path = 'src/pages/AdminPanel.jsx';
let content = fs.readFileSync(path, 'utf8');

const badStr1 = `      ) : activeTab === 'reviews' ? (
        // Manual Reviews View
        <div className="bg-white p-6 shadow-sm border border-gray-100 max-w-2xl mb-8 mx-auto">`;
const goodStr1 = `      ) : activeTab === 'reviews' ? (
        // Manual Reviews View
        <>
        <div className="bg-white p-6 shadow-sm border border-gray-100 max-w-2xl mb-8 mx-auto">`;

content = content.replace(badStr1, goodStr1);

const badStr2 = `            </form>
        </div>
        <>
        <div className="bg-white p-6 shadow-sm border border-gray-100 max-w-5xl mx-auto mt-8">`;

const goodStr2 = `            </form>
        </div>
        <div className="bg-white p-6 shadow-sm border border-gray-100 max-w-5xl mx-auto mt-8">`;

content = content.replace(badStr2, goodStr2);


fs.writeFileSync(path, content);
