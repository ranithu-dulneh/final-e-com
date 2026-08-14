const fs = require('fs');

const path = 'src/pages/AdminPanel.jsx';
let content = fs.readFileSync(path, 'utf8');

const reviewsCodeToInsert = `
        <div className="bg-white p-6 shadow-sm border border-gray-100 max-w-5xl mx-auto mt-8">
            <h2 className="text-xl font-serif mb-6 border-b pb-2">Manage All Reviews</h2>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Product</label>
                <select
                    value={reviewFilterProductId}
                    onChange={(e) => setReviewFilterProductId(e.target.value)}
                    className="w-full md:w-1/2 px-3 py-2 border border-gray-300 focus:border-gold-500 outline-none"
                >
                    <option value="all">All Products</option>
                    {products.filter(p => p.reviews && Object.keys(p.reviews).length > 0).map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-4">
                {products
                    .filter(p => p.reviews && (reviewFilterProductId === 'all' || p.id === reviewFilterProductId))
                    .flatMap(p => Object.entries(p.reviews).map(([reviewId, review]) => ({
                        productId: p.id,
                        productTitle: p.title,
                        reviewId,
                        ...review
                    })))
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map(review => (
                        <div key={review.reviewId} className="border border-gray-200 p-4 rounded-sm relative">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="font-medium text-gray-900">{review.userName}</p>
                                    <p className="text-xs text-gray-500">for {review.productTitle}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} size={12} className={star <= review.rating ? "text-yellow-400 fill-current" : "text-gray-300"} />
                                        ))}
                                        <span className="text-xs text-gray-400 ml-2">{new Date(review.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingReview(review);
                                            setEditReviewComment(review.comment);
                                            setEditReviewRating(review.rating);
                                        }}
                                        className="text-gray-400 hover:text-blue-500 transition-colors"
                                        title="Edit Review"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteReview(review.productId, review.reviewId)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                        title="Delete Review"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {editingReview?.reviewId === review.reviewId ? (
                                <div className="mt-2 space-y-2">
                                    <div className="flex gap-1 mb-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                size={16}
                                                onClick={() => setEditReviewRating(star)}
                                                className={\`cursor-pointer \${star <= editReviewRating ? "text-yellow-400 fill-current" : "text-gray-300"}\`}
                                            />
                                        ))}
                                    </div>
                                    <textarea
                                        value={editReviewComment}
                                        onChange={(e) => setEditReviewComment(e.target.value)}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 focus:border-gold-500 outline-none"
                                        rows="2"
                                    />
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={() => setEditingReview(null)}
                                            className="text-xs px-2 py-1 text-gray-600 hover:text-gray-900"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleUpdateReview(review.productId, review.reviewId)}
                                            className="text-xs px-2 py-1 bg-black text-white hover:bg-gold-600"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-700 mt-2">{review.comment}</p>
                            )}

                            {review.images && review.images.length > 0 && (
                                <div className="flex gap-2 mt-2">
                                    {review.images.map((img, idx) => (
                                        <img key={idx} src={img} alt="" className="w-12 h-12 object-cover border border-gray-200" />
                                    ))}
                                </div>
                            )}

                            {/* Reply Section */}
                            <div className="mt-4 bg-gray-50 p-3 rounded-sm">
                                {review.adminReply ? (
                                    editingReplyId === review.reviewId ? (
                                        <div className="space-y-2">
                                            <textarea
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                className="w-full px-2 py-1 text-sm border border-gray-300 focus:border-gold-500 outline-none"
                                                rows="2"
                                                placeholder="Write a reply..."
                                            />
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => { setEditingReplyId(null); setReplyText(''); }} className="text-xs px-2 py-1 text-gray-600 hover:text-gray-900">Cancel</button>
                                                <button onClick={() => handleSaveReply(review.productId, review.reviewId)} className="text-xs px-2 py-1 bg-black text-white hover:bg-gold-600">Save Reply</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative group">
                                            <p className="text-xs font-semibold text-gray-900 mb-1">Store Reply:</p>
                                            <p className="text-sm text-gray-700">{review.adminReply}</p>
                                            <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                <button onClick={() => { setEditingReplyId(review.reviewId); setReplyText(review.adminReply); }} className="text-gray-400 hover:text-blue-500"><Edit2 size={12} /></button>
                                                <button onClick={() => handleDeleteReply(review.productId, review.reviewId)} className="text-gray-400 hover:text-red-500"><Trash2 size={12} /></button>
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    editingReplyId === review.reviewId ? (
                                        <div className="space-y-2">
                                            <textarea
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                className="w-full px-2 py-1 text-sm border border-gray-300 focus:border-gold-500 outline-none"
                                                rows="2"
                                                placeholder="Write a reply..."
                                            />
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => { setEditingReplyId(null); setReplyText(''); }} className="text-xs px-2 py-1 text-gray-600 hover:text-gray-900">Cancel</button>
                                                <button onClick={() => handleSaveReply(review.productId, review.reviewId)} className="text-xs px-2 py-1 bg-black text-white hover:bg-gold-600">Post Reply</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setEditingReplyId(review.reviewId)}
                                            className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800"
                                        >
                                            <MessageCircle size={12} /> Reply to review
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    ))}

                {products.filter(p => p.reviews && (reviewFilterProductId === 'all' || p.id === reviewFilterProductId)).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No reviews found.</p>
                )}
            </div>
        </div>
`;


const manualReviewSearchStr = `        <div className="bg-white p-6 shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <h2 className="text-xl font-serif mb-6 border-b pb-2">Add Manual Review</h2>`;

if (content.includes(manualReviewSearchStr)) {
    content = content.replace(manualReviewSearchStr, manualReviewSearchStr.replace('Add Manual Review', 'Add Manual Review').replace('max-w-2xl', 'max-w-2xl mb-8') );
}

const reviewsEndSearchStr = `                    {isSubmittingReview ? "Submitting..." : "Add Review"}
                </button>
            </form>
        </div>`;

if (content.includes(reviewsEndSearchStr)) {
    content = content.replace(reviewsEndSearchStr, reviewsEndSearchStr + reviewsCodeToInsert);
    console.log("Injected review management UI.");
} else {
    console.log("Could not find reviews UI injection point");
}


// Add state variables
const stateVars = `
  const [reviewFilterProductId, setReviewFilterProductId] = useState('all');
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [editingReview, setEditingReview] = useState(null);
  const [editReviewComment, setEditReviewComment] = useState("");
  const [editReviewRating, setEditReviewRating] = useState(5);

  const handleDeleteReview = async (productId, reviewId) => {
      if(window.confirm("Are you sure you want to delete this review?")) {
          try {
              await remove(ref(db, \`products/\${productId}/reviews/\${reviewId}\`));
              fetchProducts(); // Refresh
              alert("Review deleted.");
          } catch(err) {
              console.error(err);
              alert("Failed to delete review.");
          }
      }
  };

  const handleUpdateReview = async (productId, reviewId) => {
      try {
          await update(ref(db, \`products/\${productId}/reviews/\${reviewId}\`), {
              comment: editReviewComment,
              rating: editReviewRating
          });
          setEditingReview(null);
          fetchProducts();
          alert("Review updated.");
      } catch (err) {
          console.error(err);
          alert("Failed to update review.");
      }
  };

  const handleSaveReply = async (productId, reviewId) => {
      if(!replyText.trim()) return;
      try {
          await update(ref(db, \`products/\${productId}/reviews/\${reviewId}\`), {
              adminReply: replyText.trim(),
              adminReplyAt: new Date().toISOString()
          });
          setEditingReplyId(null);
          setReplyText("");
          fetchProducts();
      } catch (err) {
          console.error(err);
          alert("Failed to save reply.");
      }
  };

  const handleDeleteReply = async (productId, reviewId) => {
      if(window.confirm("Delete this reply?")) {
          try {
              await update(ref(db, \`products/\${productId}/reviews/\${reviewId}\`), {
                  adminReply: null,
                  adminReplyAt: null
              });
              fetchProducts();
          } catch (err) {
              console.error(err);
              alert("Failed to delete reply.");
          }
      }
  };
`;


const searchStatePoint = `  const [reviewImages, setReviewImages] = useState([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);`;

if (content.includes(searchStatePoint)) {
    content = content.replace(searchStatePoint, searchStatePoint + '\n' + stateVars);
    console.log("Injected state vars.");
} else {
    console.log("Could not find state vars injection point");
}

fs.writeFileSync(path, content);
console.log('File patched successfully.');
