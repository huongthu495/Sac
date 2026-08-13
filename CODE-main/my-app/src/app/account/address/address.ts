import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddressService } from '../../address.service';
import { LocationApiService } from '../../location-api.service';

interface AccountAddress {
  _id?: string;
  userId: string;
  phone: string;
  address: string;
  ward: string;
  city: string;
}

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './address.html',
  styleUrl: './address.css',
})
export class AddressComponent implements OnInit {
  userId = '';
  isEditing = false;
  isSaving = false;

  address: AccountAddress = {
    userId: '',
    phone: '',
    address: '',
    ward: '',
    city: '',
  };

  formAddress: AccountAddress = {
    userId: '',
    phone: '',
    address: '',
    ward: '',
    city: '',
  };

  // 👉 DROPDOWN DATA
  provinces: any[] = [];
  wards: any[] = [];

  selectedProvince: any;
  selectedWard: any;

  constructor(
    private addressService: AddressService,
    private locationService: LocationApiService,
    @Inject(PLATFORM_ID) private platformId: Object
    , private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // load tỉnh
    this.locationService.getProvinces().subscribe({
      next: (data) => {
        console.log("PROVINCES:", data); // 👈 thêm dòng này
        this.provinces = data;
      },
      error: (err) => {
        console.error("ERROR LOAD LOCATION:", err);
      }
    });

    // load user
    if (typeof localStorage !== 'undefined') {
      const userRaw = localStorage.getItem('user');
      if (!userRaw) return;

      try {
        const user = JSON.parse(userRaw);
        this.userId = user._id || user.id || '';
        this.address.userId = this.userId;
        this.loadAddress();
      } catch {
        this.userId = '';
      }
    }
  }

  private loadAddress(): void {
    if (!this.userId) return;

    this.addressService.getAddressByUser(this.userId).subscribe({
      next: (res: any) => {
        const value = Array.isArray(res) ? res[0] : res;
        if (value && (value.city || value.address)) {
          this.address = {
            _id: value._id,
            userId: this.userId,
            phone: value.phone || '',
            address: value.address || '',
            ward: value.ward || '',
            city: value.city || '',
          };
        } else {
          this.isEditing = true;
        }
        // ensure view updates immediately after async load
        this.defChangeRec();
      },
      error: () => {
        this.isEditing = true;
        this.defChangeRec();
      },
    });
  }

  startEdit() {
    this.formAddress = { ...this.address };
    this.isEditing = true;

    const setupProvinceWard = () => {
      if (this.address.city) {
        const provinceObj = this.provinces.find(p => p.name === this.address.city || p.name?.includes(this.address.city));
        if (provinceObj && provinceObj.code) {
          this.selectedProvince = provinceObj.code;
          this.locationService.getDistricts(provinceObj.code).subscribe(districts => {
            this.wards = [];
            districts.forEach((d: any) => {
              if (d.wards) this.wards = this.wards.concat(d.wards);
            });
            this.wards.sort((a: any, b: any) => a.name.localeCompare(b.name));
            if (this.address.ward) {
              const wardObj = this.wards.find((w: any) => w.name === this.address.ward);
              if (wardObj) this.selectedWard = wardObj.code;
            }
            this.defChangeRec();
          });
        } else {
          // if province not found by name, still trigger change detection
          this.defChangeRec();
        }
      } else {
        this.defChangeRec();
      }
    };

    if (this.provinces && this.provinces.length) {
      setupProvinceWard();
    } else {
      // load provinces now and then setup
      this.locationService.getProvinces().subscribe({
        next: (data) => {
          this.provinces = data;
          setupProvinceWard();
        },
        error: () => setupProvinceWard()
      });
    }
  }

  cancelEdit() {
    this.isEditing = false;
  }

  // 👉 CHỌN TỈNH (load wards directly from districts list)
  onProvinceChange(event: any) {
    const code = Number(event.target.value);

    this.selectedProvince = this.provinces.find(p => p.code === code);
    this.formAddress.city = this.selectedProvince?.name || '';

    if (code) {
      this.locationService.getDistricts(code).subscribe(districts => {
        this.wards = [];
        districts.forEach((d: any) => {
          if (d.wards) this.wards = this.wards.concat(d.wards);
        });
        this.wards.sort((a: any, b: any) => a.name.localeCompare(b.name));
      });
    } else {
      this.wards = [];
    }
  }

  // Force change detection so autofilled values appear immediately
  defChangeRec() {
    try {
      this.cdr.detectChanges();
    } catch (e) {
      // ignore
    }
  }

  // removed district selection (wards loaded from province)

  // 👉 CHỌN PHƯỜNG
  onWardChange(event: any) {
    const code = Number(event.target.value);

    this.selectedWard = this.wards.find(w => w.code === code);
    this.formAddress.ward = this.selectedWard?.name || '';
  }

  saveAddress(): void {
    if (this.isSaving || !this.userId) return;

    this.isSaving = true;

    const payload = {
      ...this.formAddress,
      userId: this.userId,
    };

    const request$ = this.address._id
      ? this.addressService.updateAddress(this.address._id, payload)
      : this.addressService.createAddress(payload);

    request$.subscribe({
      next: (res: any) => {
        this.address = res;
        this.isSaving = false;
        this.isEditing = false;
        alert('Lưu địa chỉ thành công');
      },
      error: () => {
        this.isSaving = false;
        alert('Lưu địa chỉ thất bại, vui lòng thử lại');
      },
    });
  }
}