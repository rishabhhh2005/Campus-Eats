import Feedback from '../models/feedback.js';
import User from '../models/user.js';

export const submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    if (!rating || !comment) {
      return res.status(400).json({ error: 'Rating and comment are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const feedback = await Feedback.create({
      userId,
      userName: user.name,
      rating,
      comment
    });

    res.status(201).json({ message: 'Thank You for your feedback', feedback });
  } catch (error) {
    console.error('submitFeedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ timestamp: -1 }).limit(10);
    res.json(feedbacks);
  } catch (error) {
    console.error('getFeedbacks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
