import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './UserRating.css';

const UserRating = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Get userId and vehicleId from location state
  const { userId, vehicleId } = location.state || {};

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch user details
        const userRes = await axios.get(`http://localhost:5000/api/profile/${userId}`);
        setUser(userRes.data);
        // Fetch vehicle details
        const vehicleRes = await axios.get(`http://localhost:5000/api/vehicles/${vehicleId}`);
        setVehicle(vehicleRes.data);
      } catch (err) {
        setError('Failed to fetch user or vehicle information.');
      } finally {
        setLoading(false);
      }
    };
    if (userId && vehicleId) {
      fetchData();
    } else {
      setError('Missing user or vehicle information.');
      setLoading(false);
    }
  }, [userId, vehicleId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      alert('Please select a rating');
      return;
    }
    if (!user || !vehicle) {
      alert('Missing user or vehicle information');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await axios.post('http://localhost:5000/api/ratings/submit', {
        userId: user._id,
        vehicleId: vehicle._id,
        rating,
        comment
      });
      if (response.data.success) {
        alert('Thank you for your rating!');
        navigate('/'); // Redirect to homepage
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Error submitting rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="user-rating-container"><div className="user-rating-card">Loading...</div></div>;
  if (error) return <div className="user-rating-container"><div className="user-rating-card">{error}</div></div>;

  return (
    <div className="user-rating-container">
      <div className="user-rating-card">
        <h2 className="user-rating-title">Rate Your Vehicle</h2>
        <div style={{ marginBottom: '1rem', fontWeight: 500 }}>
          Vehicle: {vehicle?.name}<br />
          User: {user?.firstName} {user?.lastName}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${hover >= star || rating >= star ? 'filled' : ''}`}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(star)}
                role="button"
                tabIndex={0}
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
              >
                ★
              </span>
            ))}
          </div>
          <textarea
            className="user-rating-comment"
            placeholder="Leave a comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />
          <button 
            type="submit" 
            className="user-rating-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserRating; 