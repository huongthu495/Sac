import { Injectable } from '@angular/core';

// Local storage based review management service
@Injectable({
  providedIn: 'root',
})
export class ReviewApiService {
  private readonly REVIEWS_KEY = 'userReviews';

  constructor() {}

  // Get all reviews for a user
  getReviewsByUser(userId: string): any[] {
    const reviews = localStorage.getItem(this.REVIEWS_KEY);
    if (!reviews) return [];
    const allReviews = JSON.parse(reviews);
    return allReviews.filter((r: any) => r.userId === userId);
  }

  // Get reviews for a specific order
  getReviewsByOrder(orderId: string): any[] {
    const reviews = localStorage.getItem(this.REVIEWS_KEY);
    if (!reviews) return [];
    const allReviews = JSON.parse(reviews);
    return allReviews.filter((r: any) => r.orderId === orderId);
  }

  // Create a review
  createReview(reviewData: any): any {
    const reviews = localStorage.getItem(this.REVIEWS_KEY);
    const allReviews = reviews ? JSON.parse(reviews) : [];
    
    const newReview = {
      _id: Date.now().toString(),
      ...reviewData,
      createdAt: new Date().toISOString(),
    };
    
    allReviews.push(newReview);
    localStorage.setItem(this.REVIEWS_KEY, JSON.stringify(allReviews));
    return newReview;
  }

  // Update a review
  updateReview(reviewId: string, reviewData: any): any {
    const reviews = localStorage.getItem(this.REVIEWS_KEY);
    if (!reviews) return null;
    
    const allReviews = JSON.parse(reviews);
    const review = allReviews.find((r: any) => r._id === reviewId);
    
    if (review) {
      Object.assign(review, reviewData);
      localStorage.setItem(this.REVIEWS_KEY, JSON.stringify(allReviews));
    }
    
    return review;
  }

  // Delete a review
  deleteReview(reviewId: string): void {
    const reviews = localStorage.getItem(this.REVIEWS_KEY);
    if (!reviews) return;
    
    const allReviews = JSON.parse(reviews);
    const filtered = allReviews.filter((r: any) => r._id !== reviewId);
    localStorage.setItem(this.REVIEWS_KEY, JSON.stringify(filtered));
  }
}
