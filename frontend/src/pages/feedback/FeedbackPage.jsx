import React, { useEffect, useState } from 'react';
import { CheckCircle, MessageSquare, Star } from 'lucide-react';
import { feedbackApi } from '../../api/endpoints';
import { getErrorMessage } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const categories = [
  'overall hospitality and staff',
  'room quality and comfort',
  'in-room dining and restaurant',
  'sanitation and housekeeping',
  'concierge and frontdesk',
];

const formatDate = (date) => {
  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime())
    ? 'Date unavailable'
    : parsedDate.toLocaleDateString();
};

export const FeedbackPage = () => {
  const { isGuest, isManager } = useAuth();
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState(categories[0]);
  const [comment, setComment] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(isManager);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isManager) return undefined;

    let isActive = true;
    const loadFeedback = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const response = await feedbackApi.listFeedback();
        if (isActive) setFeedbacks(response.data?.feedbacks || []);
      } catch (error) {
        if (isActive) setErrorMessage(getErrorMessage(error));
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadFeedback();
    return () => {
      isActive = false;
    };
  }, [isManager]);

  const submitFeedback = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await feedbackApi.submitFeedback({ rating, category, comment });
      setSubmitted(true);
      setComment('');
      setRating(5);
      setCategory(categories[0]);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#F8FAFC' }}>
          {isGuest ? 'Share Your Feedback' : 'Guest Feedback & Ratings'}
        </h1>
        <p style={{ color: '#A8B8CC', fontSize: '0.88rem' }}>
          {isGuest
            ? 'Tell us about your stay and help us make your next visit even better.'
            : 'Review feedback submitted by guests.'}
        </p>
      </div>

      {errorMessage && (
        <div className="card" role="alert" style={{ color: '#FCA5A5', borderColor: '#7F1D1D' }}>
          {errorMessage}
        </div>
      )}

      {isGuest && (
        <div className="card" style={{ maxWidth: '760px' }}>
          <h2 style={{ fontSize: '1.1rem', color: '#F8FAFC', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={18} style={{ color: '#D6B779' }} /> Your Stay Experience
          </h2>
          <p style={{ color: '#A8B8CC', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Your feedback is sent securely to our management team.
          </p>

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <CheckCircle size={42} style={{ color: '#27AE75', marginBottom: '0.75rem' }} />
              <h3 style={{ color: '#F8FAFC', marginBottom: '0.5rem' }}>Thank you for your feedback!</h3>
              <p style={{ color: '#A8B8CC', marginBottom: '1.25rem' }}>
                Your feedback has been submitted successfully.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="btn btn-secondary btn-sm"
              >
                Submit Another Review
              </button>
            </div>
          ) : (
            <form onSubmit={submitFeedback}>
              <div className="form-group">
                <label htmlFor="feedback-rating">Overall Experience Rating</label>
                <div id="feedback-rating" style={{ display: 'flex', gap: '0.5rem', padding: '0.25rem 0' }}>
                  {Array.from({ length: 5 }, (_, index) => {
                    const star = index + 1;
                    return (
                      <button
                        key={star}
                        type="button"
                        aria-label={`Rate ${star} out of 5`}
                        aria-pressed={rating === star}
                        onClick={() => setRating(star)}
                        style={{
                          padding: '0.35rem',
                          cursor: 'pointer',
                          color: star <= rating ? '#D6B779' : '#263E59',
                          background: 'transparent',
                          border: 0,
                        }}
                      >
                        <Star size={26} fill={star <= rating ? '#D6B779' : 'transparent'} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="feedback-category">Review Category</label>
                <select
                  id="feedback-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  <option value={categories[0]}>Overall Hospitality &amp; Staff</option>
                  <option value={categories[1]}>Room Quality &amp; Comfort</option>
                  <option value={categories[2]}>In-Room Dining &amp; Restaurant</option>
                  <option value={categories[3]}>Sanitation &amp; Housekeeping</option>
                  <option value={categories[4]}>Concierge &amp; Front Desk</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="feedback-comment">Comments &amp; Suggestions</label>
                <textarea
                  id="feedback-comment"
                  rows={4}
                  required
                  minLength={3}
                  maxLength={2000}
                  placeholder="Share details of your stay..."
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          )}
        </div>
      )}

      {isManager && (
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', color: '#F8FAFC', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Star size={18} style={{ color: '#D6B779' }} /> Submitted Guest Feedback
          </h2>

          {isLoading ? (
            <p style={{ color: '#A8B8CC' }}>Loading feedback...</p>
          ) : feedbacks.length === 0 ? (
            <p style={{ color: '#A8B8CC' }}>No guest feedback has been submitted yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {feedbacks.map((feedback) => (
                <article
                  key={feedback.id}
                  style={{
                    backgroundColor: '#143253',
                    borderRadius: '8px',
                    padding: '1rem',
                    border: '1px solid #263E59',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    <strong style={{ color: '#F8FAFC' }}>{feedback.author}</strong>
                    <span style={{ color: '#A8B8CC', fontSize: '0.8rem' }}>{formatDate(feedback.date)}</span>
                  </div>
                  {feedback.email && (
                    <p style={{ color: '#A8B8CC', fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                      {feedback.email}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ display: 'flex', color: '#D6B779' }} aria-label={`${feedback.rating} out of 5 stars`}>
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star key={index} size={15} fill={index < feedback.rating ? '#D6B779' : 'transparent'} />
                      ))}
                    </span>
                    <span style={{ color: '#D6B779', fontSize: '0.82rem' }}>{feedback.category}</span>
                  </div>
                  <p style={{ color: '#DCE6F2', fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                    {feedback.comment}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedbackPage;
