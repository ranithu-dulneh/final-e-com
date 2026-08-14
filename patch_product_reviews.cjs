const fs = require('fs');

const path = 'src/pages/ProductDetails.jsx';
let content = fs.readFileSync(path, 'utf8');

const userReviewsSearchStr = `                                   {review.images && review.images.length > 0 && (
                                       <div className="flex gap-2 mt-3 overflow-x-auto">
                                           {review.images.map((imgUrl, imgIdx) => (
                                               <img
                                                 key={imgIdx}
                                                 src={imgUrl}
                                                 alt="Review"
                                                 className="w-20 h-20 object-cover border border-gray-200 cursor-pointer hover:opacity-90"
                                                 onClick={() => setSelectedReviewImage(imgUrl)}
                                               />
                                           ))}
                                       </div>
                                   )}
                               </div>
                           ))}`;

const replaceWithAdminReply = `                                   {review.images && review.images.length > 0 && (
                                       <div className="flex gap-2 mt-3 overflow-x-auto">
                                           {review.images.map((imgUrl, imgIdx) => (
                                               <img
                                                 key={imgIdx}
                                                 src={imgUrl}
                                                 alt="Review"
                                                 className="w-20 h-20 object-cover border border-gray-200 cursor-pointer hover:opacity-90"
                                                 onClick={() => setSelectedReviewImage(imgUrl)}
                                               />
                                           ))}
                                       </div>
                                   )}
                                   {review.adminReply && (
                                       <div className="mt-4 bg-gray-50 border-l-2 border-gold-500 p-3 text-sm">
                                           <p className="font-semibold text-gray-900 mb-1">Store Owner</p>
                                           <p className="text-gray-700">{review.adminReply}</p>
                                       </div>
                                   )}
                               </div>
                           ))}`;

if (content.includes(userReviewsSearchStr)) {
    content = content.replace(userReviewsSearchStr, replaceWithAdminReply);
    console.log("Injected admin reply display.");
} else {
    console.log("Could not find point to inject admin reply display in ProductDetails.jsx");
}

fs.writeFileSync(path, content);
console.log('File patched successfully.');
