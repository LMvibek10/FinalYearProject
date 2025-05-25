import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ad_ratings.css';
import Sidebar from '../component/ad_sidebar';

const AdRatings = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filterRating, setFilterRating] = useState('all'); // all, 1, 2, 3, 4, 5
  const [sortOrder, setSortOrder] = useState('newest'); // newest, oldest, highest, lowest

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/ratings/all');
      
      if (response.data.success) {
        setRatings(response.data.data);
      } else {
        setError('Failed to fetch ratings');
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
      setError('Error loading ratings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getStarDisplay = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return '#10b981'; // Green
    if (rating >= 3) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  // Filter and sort ratings
  const filteredAndSortedRatings = ratings
    .filter(rating => {
      if (filterRating === 'all') return true;
      return rating.rating === parseInt(filterRating);
    })
    .sort((a, b) => {
      switch (sortOrder) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const getAverageRating = () => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return (sum / ratings.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach(rating => {
      distribution[rating.rating]++;
    });
    return distribution;
  };

  const distribution = getRatingDistribution();

  return (
    <div className="admin-dashboard">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="ratings-container">
          <div className="ratings-header">
            <h1>Vehicle Ratings & Reviews</h1>
            <div className="ratings-stats">
              <div className="stat-card">
                <h3>Total Reviews</h3>
                <p className="stat-number">{ratings.length}</p>
              </div>
              <div className="stat-card">
                <h3>Average Rating</h3>
                <p className="stat-number">{getAverageRating()} ⭐</p>
              </div>
              <div className="stat-card">
                <h3>Rating Distribution</h3>
                <div className="rating-bars">
                  {[5, 4, 3, 2, 1].map(star => (
                    <div key={star} className="rating-bar">
                      <span>{star}⭐</span>
                      <div className="bar-container">
                        <div 
                          className="bar-fill" 
                          style={{ 
                            width: `${ratings.length > 0 ? (distribution[star] / ratings.length) * 100 : 0}%`,
                            backgroundColor: getRatingColor(star)
                          }}
                        ></div>
                      </div>
                      <span>{distribution[star]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="ratings-filters">
            <div className="filter-group">
              <label>Filter by Rating:</label>
              <select 
                value={filterRating} 
                onChange={(e) => setFilterRating(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Sort by:</label>
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)}
                className="filter-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>
          </div>

          <div className="ratings-content">
            {loading ? (
              <div className="loading">Loading ratings...</div>
            ) : filteredAndSortedRatings.length === 0 ? (
              <div className="no-ratings">
                {filterRating === 'all' ? 'No ratings found' : `No ${filterRating}-star ratings found`}
              </div>
            ) : (
              <div className="ratings-grid">
                {filteredAndSortedRatings.map((rating) => (
                  <div key={rating._id} className="rating-card">
                    <div className="rating-card-header">
                      <div className="vehicle-info">
                        <img 
                          src={rating.vehicle?.image || '/placeholder.svg?height=80&width=120'} 
                          alt={rating.vehicle?.name || 'Vehicle'}
                          className="vehicle-thumbnail"
                        />
                        <div className="vehicle-details">
                          <h3>{rating.vehicle?.name || 'Unknown Vehicle'}</h3>
                          <p className="vehicle-category">
                            {rating.vehicle?.category} • {rating.vehicle?.subcategory}
                          </p>
                          <div className="vehicle-rating">
                            Overall: {rating.vehicle?.rating?.toFixed(1) || 'N/A'} ⭐
                          </div>
                        </div>
                      </div>
                      <div className="rating-info">
                        <div className="user-rating">
                          <span className="rating-stars" style={{ color: getRatingColor(rating.rating) }}>
                            {getStarDisplay(rating.rating)}
                          </span>
                          <span className="rating-number">({rating.rating}/5)</span>
                        </div>
                        <div className="anonymous-user">
                          👤 {rating.user.anonymous}
                        </div>
                      </div>
                    </div>
                    
                    {rating.comment && (
                      <div className="rating-comment">
                        <p>"{rating.comment}"</p>
                      </div>
                    )}
                    
                    <div className="rating-footer">
                      <span className="rating-date">
                        {formatDate(rating.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdRatings; 