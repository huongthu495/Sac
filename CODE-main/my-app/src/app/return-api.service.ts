import { Injectable } from '@angular/core';

// Local storage based return management service
@Injectable({
  providedIn: 'root',
})
export class ReturnApiService {
  private readonly RETURNS_KEY = 'userReturns';

  constructor() {}

  // Get all returns for a user
  getReturnsByUser(userId: string): any[] {
    const returns = localStorage.getItem(this.RETURNS_KEY);
    if (!returns) return [];
    const allReturns = JSON.parse(returns);
    return allReturns.filter((r: any) => r.userId === userId);
  }

  // Create a return request
  createReturn(returnData: any): any {
    const returns = localStorage.getItem(this.RETURNS_KEY);
    const allReturns = returns ? JSON.parse(returns) : [];
    
    const newReturn = {
      _id: Date.now().toString(),
      ...returnData,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    
    allReturns.push(newReturn);
    localStorage.setItem(this.RETURNS_KEY, JSON.stringify(allReturns));
    return newReturn;
  }

  // Update return status
  updateReturnStatus(returnId: string, status: string): any {
    const returns = localStorage.getItem(this.RETURNS_KEY);
    if (!returns) return null;
    
    const allReturns = JSON.parse(returns);
    const returnItem = allReturns.find((r: any) => r._id === returnId);
    
    if (returnItem) {
      returnItem.status = status;
      localStorage.setItem(this.RETURNS_KEY, JSON.stringify(allReturns));
    }
    
    return returnItem;
  }

  // Delete a return
  deleteReturn(returnId: string): void {
    const returns = localStorage.getItem(this.RETURNS_KEY);
    if (!returns) return;
    
    const allReturns = JSON.parse(returns);
    const filtered = allReturns.filter((r: any) => r._id !== returnId);
    localStorage.setItem(this.RETURNS_KEY, JSON.stringify(filtered));
  }
}
