import { useState } from "react";

import {
  Search,
  Star,
  Eye,
  MessageSquare,
  AlertTriangle,
  X,
  UserRound,
  Package,
  Truck,
  CalendarDays,
  ShieldAlert,
  CheckCircle2,
  Send,
} from "lucide-react";

import "./Reviews.css";


const initialReviews = [
  {
    id: 1,
    customer: "Rahul Sharma",
    customerInitials: "RS",
    product: "Wireless Headphones",
    supplier: "TechWorld Supplies",
    rating: 5,
    review:
      "Excellent sound quality and the battery lasts much longer than expected. Delivery was also very quick.",
    date: "01 Oct 2026",
    status: "Published",
    complaint: false,
    complaintReason: "",
  },
  {
    id: 2,
    customer: "Priya Reddy",
    customerInitials: "PR",
    product: "Smart Watch Pro",
    supplier: "Digital Hub",
    rating: 4,
    review:
      "Good smartwatch with useful features. The display is bright and the tracking works well.",
    date: "01 Oct 2026",
    status: "Published",
    complaint: false,
    complaintReason: "",
  },
  {
    id: 3,
    customer: "Arjun Kumar",
    customerInitials: "AK",
    product: "Running Shoes",
    supplier: "Urban Footwear",
    rating: 2,
    review:
      "The product quality was not as expected. The sole started coming off after only a few uses.",
    date: "30 Sep 2026",
    status: "Complaint",
    complaint: true,
    complaintReason: "Product quality issue",
  },
  {
    id: 4,
    customer: "Sneha Patel",
    customerInitials: "SP",
    product: "Bluetooth Speaker",
    supplier: "SoundMax Distributors",
    rating: 5,
    review:
      "Very clear audio and impressive bass for this price. Really happy with the purchase.",
    date: "30 Sep 2026",
    status: "Published",
    complaint: false,
    complaintReason: "",
  },
  {
    id: 5,
    customer: "Vikram Singh",
    customerInitials: "VS",
    product: "Laptop Backpack",
    supplier: "BagZone Wholesale",
    rating: 3,
    review:
      "The bag is decent but the material feels slightly weaker than shown in the pictures.",
    date: "29 Sep 2026",
    status: "Published",
    complaint: false,
    complaintReason: "",
  },
  {
    id: 6,
    customer: "Ananya Rao",
    customerInitials: "AR",
    product: "Cotton Hoodie",
    supplier: "FashionKart Suppliers",
    rating: 1,
    review:
      "Very disappointing experience. The hoodie quality is poor and the stitching was damaged when it arrived.",
    date: "29 Sep 2026",
    status: "Complaint",
    complaint: true,
    complaintReason: "Damaged product received",
  },
  {
    id: 7,
    customer: "Karan Mehta",
    customerInitials: "KM",
    product: "Mechanical Keyboard",
    supplier: "TechWorld Supplies",
    rating: 4,
    review:
      "Great keyboard for work and gaming. Keys feel premium and response is excellent.",
    date: "28 Sep 2026",
    status: "Published",
    complaint: false,
    complaintReason: "",
  },
  {
    id: 8,
    customer: "Meera Nair",
    customerInitials: "MN",
    product: "Ceramic Coffee Mug",
    supplier: "HomeNest Traders",
    rating: 1,
    review:
      "The mug arrived cracked. Packaging was not sufficient to protect the product.",
    date: "28 Sep 2026",
    status: "Complaint",
    complaint: true,
    complaintReason: "Damaged during delivery",
  },
];


function Reviews() {

  const [reviews, setReviews] = useState(initialReviews);

  const [searchTerm, setSearchTerm] = useState("");

  const [ratingFilter, setRatingFilter] = useState("All");

  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedReview, setSelectedReview] = useState(null);

  const [replyReview, setReplyReview] = useState(null);

  const [replyText, setReplyText] = useState("");

  const [suspendSupplier, setSuspendSupplier] = useState(null);

  const [suspendReason, setSuspendReason] = useState("");

  const [adminNotes, setAdminNotes] = useState("");


  const filteredReviews = reviews.filter((review) => {

    const search = searchTerm.toLowerCase();

    const matchesSearch =
      review.customer.toLowerCase().includes(search) ||
      review.product.toLowerCase().includes(search) ||
      review.supplier.toLowerCase().includes(search) ||
      review.review.toLowerCase().includes(search);

    const matchesRating =
      ratingFilter === "All" ||
      review.rating === Number(ratingFilter);

    const matchesStatus =
      statusFilter === "All" ||
      review.status === statusFilter;

    return (
      matchesSearch &&
      matchesRating &&
      matchesStatus
    );
  });


  const totalReviews = reviews.length;

  const fiveStarReviews = reviews.filter(
    (review) => review.rating === 5
  ).length;

  const complaintReviews = reviews.filter(
    (review) => review.complaint
  ).length;

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (total, review) =>
              total + review.rating,
            0
          ) / reviews.length
        ).toFixed(1)
      : "0.0";


  const handleReply = () => {

    if (!replyText.trim()) {
      return;
    }

    setReviews((current) =>
      current.map((review) =>
        review.id === replyReview.id
          ? {
              ...review,
              status: "Responded",
            }
          : review
      )
    );

    setReplyReview(null);
    setReplyText("");

  };


  const handleSuspendSupplier = () => {

    if (!suspendReason.trim()) {
      return;
    }

    setReviews((current) =>
      current.map((review) =>
        review.supplier === suspendSupplier.supplier
          ? {
              ...review,
              status: review.complaint
                ? "Supplier Review"
                : review.status,
            }
          : review
      )
    );

    setSuspendSupplier(null);
    setSuspendReason("");
    setAdminNotes("");

  };


  const getRatingClass = (rating) => {

    if (rating >= 4) {
      return "review-rating good";
    }

    if (rating === 3) {
      return "review-rating average";
    }

    return "review-rating poor";

  };


  const getStatusClass = (status) => {

    if (status === "Published") {
      return "review-status published";
    }

    if (status === "Responded") {
      return "review-status responded";
    }

    if (status === "Complaint") {
      return "review-status complaint";
    }

    return "review-status supplier-review";

  };


  return (
    <div className="reviews-page">

      {/* HEADER */}

      <div className="reviews-page-header">

        <div>

          <p className="reviews-eyebrow">
            CUSTOMER FEEDBACK
          </p>

          <h2>Reviews</h2>

          <p className="reviews-description">
            Monitor customer feedback, complaints and
            supplier quality.
          </p>

        </div>

      </div>


      {/* STATS */}

      <div className="reviews-stats">

        <div className="review-stat-card">

          <div className="review-stat-icon blue">
            <MessageSquare size={20} />
          </div>

          <div>
            <span>Total Reviews</span>
            <strong>{totalReviews}</strong>
          </div>

        </div>


        <div className="review-stat-card">

          <div className="review-stat-icon yellow">
            <Star
              size={20}
              fill="currentColor"
            />
          </div>

          <div>
            <span>Average Rating</span>

            <strong>
              {averageRating}
              <small>/ 5</small>
            </strong>
          </div>

        </div>


        <div className="review-stat-card">

          <div className="review-stat-icon mint">
            <CheckCircle2 size={20} />
          </div>

          <div>
            <span>5 Star Reviews</span>
            <strong>{fiveStarReviews}</strong>
          </div>

        </div>


        <div className="review-stat-card">

          <div className="review-stat-icon red">
            <AlertTriangle size={20} />
          </div>

          <div>
            <span>Open Complaints</span>
            <strong>{complaintReviews}</strong>
          </div>

        </div>

      </div>


      {/* REVIEW TABLE */}

      <div className="reviews-table-card">

        <div className="reviews-toolbar">

          <div className="reviews-search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search customer, product, supplier..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />

          </div>


          <div className="reviews-filters">

            <select
              value={ratingFilter}
              onChange={(event) =>
                setRatingFilter(event.target.value)
              }
            >

              <option value="All">
                All Ratings
              </option>

              <option value="5">
                5 Stars
              </option>

              <option value="4">
                4 Stars
              </option>

              <option value="3">
                3 Stars
              </option>

              <option value="2">
                2 Stars
              </option>

              <option value="1">
                1 Star
              </option>

            </select>


            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >

              <option value="All">
                All Status
              </option>

              <option value="Published">
                Published
              </option>

              <option value="Responded">
                Responded
              </option>

              <option value="Complaint">
                Complaint
              </option>

            </select>

          </div>

        </div>


        <div className="reviews-table-wrapper">

          <table className="reviews-table">

            <thead>

              <tr>

                <th>Customer</th>

                <th>Product</th>

                <th>Supplier</th>

                <th>Rating</th>

                <th>Review</th>

                <th>Date</th>

                <th>Status</th>

                <th>Action</th>

              </tr>

            </thead>


            <tbody>

              {filteredReviews.map((review) => (

                <tr key={review.id}>

                  {/* CUSTOMER */}

                  <td>

                    <div className="review-customer">

                      <div className="review-avatar">
                        {review.customerInitials}
                      </div>

                      <strong>
                        {review.customer}
                      </strong>

                    </div>

                  </td>


                  {/* PRODUCT */}

                  <td>

                    <div className="review-product">

                      <Package size={15} />

                      <span>
                        {review.product}
                      </span>

                    </div>

                  </td>


                  {/* SUPPLIER */}

                  <td>

                    <div className="review-supplier">

                      <Truck size={14} />

                      <span>
                        {review.supplier}
                      </span>

                    </div>

                  </td>


                  {/* RATING */}

                  <td>

                    <div
                      className={getRatingClass(
                        review.rating
                      )}
                    >

                      <Star
                        size={14}
                        fill="currentColor"
                      />

                      <strong>
                        {review.rating}.0
                      </strong>

                    </div>

                  </td>


                  {/* REVIEW */}

                  <td>

                    <div className="review-text">

                      <p>
                        {review.review}
                      </p>

                      {review.complaint && (

                        <span className="complaint-label">

                          <AlertTriangle size={11} />

                          Complaint

                        </span>

                      )}

                    </div>

                  </td>


                  {/* DATE */}

                  <td>

                    <div className="review-date">

                      <CalendarDays size={13} />

                      <span>
                        {review.date}
                      </span>

                    </div>

                  </td>


                  {/* STATUS */}

                  <td>

                    <span
                      className={getStatusClass(
                        review.status
                      )}
                    >

                      <span className="review-status-dot"></span>

                      {review.status}

                    </span>

                  </td>


                  {/* ACTION */}

                  <td>

                    <div className="review-actions">

                      <button
                        title="View Review"
                        onClick={() =>
                          setSelectedReview(review)
                        }
                      >
                        <Eye size={16} />
                      </button>


                      <button
                        title="Respond"
                        onClick={() => {
                          setReplyReview(review);
                          setReplyText("");
                        }}
                      >
                        <MessageSquare size={16} />
                      </button>


                      {review.complaint && (

                        <button
                          className="danger-action"
                          title="Supplier Action"
                          onClick={() =>
                            setSuspendSupplier(review)
                          }
                        >
                          <ShieldAlert size={16} />
                        </button>

                      )}

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>


          {filteredReviews.length === 0 && (

            <div className="reviews-empty">

              <MessageSquare size={40} />

              <h3>No reviews found</h3>

              <p>
                Try changing your search or filters.
              </p>

            </div>

          )}

        </div>


        {/* FOOTER */}

        <div className="reviews-table-footer">

          <span>
            Showing {filteredReviews.length} of{" "}
            {reviews.length} reviews
          </span>

          <div className="reviews-pagination">

            <button disabled>‹</button>

            <button className="active">
              1
            </button>

            <button>2</button>

            <button>3</button>

            <button>›</button>

          </div>

        </div>

      </div>


      {/* VIEW REVIEW MODAL */}

      {selectedReview && (

        <div
          className="reviews-modal-overlay"
          onClick={() => setSelectedReview(null)}
        >

          <div
            className="review-view-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="review-modal-close"
              onClick={() =>
                setSelectedReview(null)
              }
            >
              <X size={19} />
            </button>


            <div className="review-modal-heading">

              <div className="review-large-avatar">
                {selectedReview.customerInitials}
              </div>

              <div>

                <p>CUSTOMER REVIEW</p>

                <h3>
                  {selectedReview.customer}
                </h3>

                <div className="review-modal-rating">

                  {Array.from(
                    { length: 5 },
                    (_, index) => (
                      <Star
                        key={index}
                        size={16}
                        fill={
                          index <
                          selectedReview.rating
                            ? "currentColor"
                            : "none"
                        }
                      />
                    )
                  )}

                  <strong>
                    {selectedReview.rating}.0
                  </strong>

                </div>

              </div>

            </div>


            <div className="review-modal-product">

              <Package size={17} />

              <div>

                <span>PRODUCT</span>

                <strong>
                  {selectedReview.product}
                </strong>

              </div>

            </div>


            <div className="review-modal-supplier">

              <Truck size={17} />

              <div>

                <span>SUPPLIER</span>

                <strong>
                  {selectedReview.supplier}
                </strong>

              </div>

            </div>


            <div className="review-full-text">

              <span>REVIEW</span>

              <p>
                {selectedReview.review}
              </p>

            </div>


            {selectedReview.complaint && (

              <div className="review-complaint-box">

                <AlertTriangle size={18} />

                <div>

                  <strong>
                    Customer Complaint
                  </strong>

                  <p>
                    {selectedReview.complaintReason}
                  </p>

                </div>

              </div>

            )}


            <div className="review-modal-footer">

              <span>
                {selectedReview.date}
              </span>

              <button
                className="review-reply-button"
                onClick={() => {
                  setReplyReview(selectedReview);
                  setSelectedReview(null);
                }}
              >

                <MessageSquare size={16} />

                Respond

              </button>

            </div>

          </div>

        </div>

      )}


      {/* RESPONSE MODAL */}

      {replyReview && (

        <div
          className="reviews-modal-overlay"
          onClick={() => setReplyReview(null)}
        >

          <div
            className="review-response-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="review-modal-close"
              onClick={() =>
                setReplyReview(null)
              }
            >
              <X size={19} />
            </button>


            <div className="response-heading">

              <div className="response-icon">
                <MessageSquare size={21} />
              </div>

              <div>

                <p>SUPPORT RESPONSE</p>

                <h3>
                  Respond to Review
                </h3>

              </div>

            </div>


            <div className="response-review-preview">

              <strong>
                {replyReview.customer}
              </strong>

              <div className="preview-stars">

                {Array.from(
                  { length: replyReview.rating },
                  (_, index) => (
                    <Star
                      key={index}
                      size={13}
                      fill="currentColor"
                    />
                  )
                )}

              </div>

              <p>
                "{replyReview.review}"
              </p>

            </div>


            <label className="response-label">
              Your Response
            </label>

            <textarea
              value={replyText}
              onChange={(event) =>
                setReplyText(event.target.value)
              }
              placeholder="Write a professional response to the customer..."
              rows="5"
            />


            <div className="response-footer">

              <button
                className="response-cancel"
                onClick={() =>
                  setReplyReview(null)
                }
              >
                Cancel
              </button>

              <button
                className="response-send"
                onClick={handleReply}
              >

                <Send size={16} />

                Send Response

              </button>

            </div>

          </div>

        </div>

      )}


      {/* SUPPLIER SUSPENSION MODAL */}

      {suspendSupplier && (

        <div
          className="reviews-modal-overlay"
          onClick={() =>
            setSuspendSupplier(null)
          }
        >

          <div
            className="supplier-action-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="review-modal-close"
              onClick={() =>
                setSuspendSupplier(null)
              }
            >
              <X size={19} />
            </button>


            <div className="supplier-warning-icon">
              <ShieldAlert size={25} />
            </div>


            <p className="supplier-action-eyebrow">
              SUPPLIER MANAGEMENT
            </p>

            <h3>
              Review Supplier Complaint
            </h3>

            <p className="supplier-action-description">
              This complaint is associated with{" "}
              <strong>
                {suspendSupplier.supplier}
              </strong>
              . Record the reason before taking
              supplier action.
            </p>


            <div className="supplier-complaint-summary">

              <div>

                <span>Customer</span>

                <strong>
                  {suspendSupplier.customer}
                </strong>

              </div>

              <div>

                <span>Product</span>

                <strong>
                  {suspendSupplier.product}
                </strong>

              </div>

              <div>

                <span>Complaint</span>

                <strong>
                  {suspendSupplier.complaintReason}
                </strong>

              </div>

            </div>


            <div className="supplier-form-group">

              <label>
                Suspension / Action Reason
              </label>

              <select
                value={suspendReason}
                onChange={(event) =>
                  setSuspendReason(event.target.value)
                }
              >

                <option value="">
                  Select a reason
                </option>

                <option value="Repeated product quality complaints">
                  Repeated product quality complaints
                </option>

                <option value="Damaged products">
                  Damaged products
                </option>

                <option value="Supplier fulfillment issue">
                  Supplier fulfillment issue
                </option>

                <option value="Customer safety concern">
                  Customer safety concern
                </option>

              </select>

            </div>


            <div className="supplier-form-group">

              <label>
                Admin Notes
              </label>

              <textarea
                value={adminNotes}
                onChange={(event) =>
                  setAdminNotes(event.target.value)
                }
                placeholder="Add internal notes..."
                rows="4"
              />

            </div>


            <div className="supplier-action-footer">

              <button
                className="supplier-cancel"
                onClick={() =>
                  setSuspendSupplier(null)
                }
              >
                Cancel
              </button>

              <button
                className="supplier-suspend"
                onClick={handleSuspendSupplier}
                disabled={!suspendReason}
              >

                <ShieldAlert size={16} />

                Record Supplier Action

              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


export default Reviews;