import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, of, catchError } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LocationApiService {
  private locations$: Observable<any[]> | null = null;

  // Fallback data trong trường hợp không load được file
  private fallbackData = [
    {
      "name": "Bến Tre",
      "code": 83,
      "districts": [
        {
          "name": "Huyện Chợ Lách",
          "code": 833,
          "wards": [
            {
              "name": "Xã Sơn Định",
              "code": 29056
            }
          ]
        }
      ]
    }
  ];

  constructor(private http: HttpClient) {}

  private getLocations(): Observable<any[]> {
    if (!this.locations$) {
      this.locations$ = this.http.get<any[]>('location.json').pipe(
        catchError((error) => {
          console.warn('Cannot load location.json, using fallback data:', error);
          return of(this.fallbackData);
        }),
        shareReplay(1)
      );
    }
    return this.locations$;
  }

  getAllLocations(): Observable<any[]> {
    return this.getLocations();
  }

  getProvinces(): Observable<any[]> {
    return this.getLocations();
  }

  getDistricts(provinceCode: number): Observable<any[]> {
    return this.getLocations().pipe(
      map(provinces => {
        const province = provinces.find(p => p.code === provinceCode);
        if (!province) return [];

        // Support two JSON shapes:
        // 1) province.districts -> [{ wards: [...] }, ...]
        // 2) province.wards -> flat list (no districts)
        if (province.districts && Array.isArray(province.districts)) {
          return province.districts;
        }

        if (province.wards && Array.isArray(province.wards)) {
          // Normalize to an array of one "district-like" object that contains wards
          return [{ name: province.name, code: province.code, wards: province.wards }];
        }

        return [];
      })
    );
  }

  getWards(districtCode: number): Observable<any[]> {
    return this.getLocations().pipe(
      map(provinces => {
        for (let p of provinces) {
          // handle nested districts
          if (p.districts && Array.isArray(p.districts)) {
            const district = p.districts.find((d: any) => d.code === districtCode);
            if (district) return district.wards || [];
          }

          // handle flat structure where provinces directly contain wards
          if (p.wards && p.code === districtCode) {
            return p.wards;
          }
        }
        return [];
      })
    );
  }
}