import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  api = "http://localhost:3000/addresses";
  constructor(private http: HttpClient) {}
  getAddressByUser(userId:any){
    // Normalize response: backend returns an object (or null),
    // some callers previously treated arrays — coerce to single object.
    return this.http.get<any>(this.api + "/" + userId).pipe(
      map(res => Array.isArray(res) ? res[0] : res)
    );
  }
  createAddress(data:any){
    return this.http.post(this.api, data);
  }
  updateAddress(id:any,data:any){
    return this.http.put(this.api + "/" + id, data);
  }
  deleteAddress(id:any){
    return this.http.delete(this.api + "/" + id);
  }

  // Format an address value into the string: "address, ward, city"
  // Accepts either a string or an object with { address, ward, city }.
  formatAddress(addr:any): string {
    if (!addr && addr !== '') return '';
    if (typeof addr === 'string') return addr;
    try {
      const parts: string[] = [];
      const a = (addr.address || addr.addr || addr.street || '').toString().trim();
      const w = (addr.ward || addr.wards || '').toString().trim();
      const c = (addr.city || addr.province || '').toString().trim();
      if (a) parts.push(a);
      if (w) parts.push(w);
      if (c) parts.push(c);
      return parts.join(', ');
    } catch (e) {
      return '';
    }
  }
}
