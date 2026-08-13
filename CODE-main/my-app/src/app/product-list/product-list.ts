import { Component, OnInit } from '@angular/core';
import { ProductApiService } from '../product-api.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})

export class ProductList implements OnInit{

  products:any[] = [];
  currentCategory:string | null = null;
  constructor(
    private productService:ProductApiService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ){}
  ngOnInit(): void {

  this.route.paramMap.subscribe(params => {

    const category = this.normalizeCategory(params.get('category'));
    this.currentCategory = category;

    this.productService.getProducts().subscribe((data:any)=>{

      if(category){
        this.products = data.filter(
          (p:any) => this.normalizeCategory(p.product_dept) === category
        );
      } 
      else {
        this.products = data;
      }

      this.cdr.detectChanges(); 
    });

  });

  }

  sortProducts(event:any){
  const value = event.target.value;
    if(value === "priceLow"){
      this.products.sort((a:any,b:any)=> a.unit_price - b.unit_price);
    }
    if(value === "priceHigh"){
      this.products.sort((a:any,b:any)=> b.unit_price - a.unit_price);
    }
    if(value==="nameAZ"){
      this.products.sort((a:any,b:any)=> 
        a.product_name.localeCompare(b.product_name));
    }

    if(value==="nameZA"){
      this.products.sort((a:any,b:any)=> 
        b.product_name.localeCompare(a.product_name));
    }

    if(value==="newest"){
      this.products.sort((a:any,b:any)=> 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    if(value==="oldest"){
      this.products.sort((a:any,b:any)=> 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
  }

  getImageSrc(product: any, imageIndex: number): string {
    const image = product?.images?.[imageIndex]
      || product?.images?.[0]
      || product?.[`image_${imageIndex + 1}`]
      || product?.image_1
      || '';

    if (!image) return '';

    if (image.startsWith('data:') || image.startsWith('http')) {
      return image;
    }

    if (image.startsWith('/')) {
      return image;
    }

    return `/assets/${image}`;
  }

  private normalizeCategory(value: string | null | undefined): string | null {
    if (!value) return null;

    const normalized = value
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-');

    const compact = normalized.replace(/-/g, '');

    if (compact === 'aodai') return 'ao-dai';
    if (compact === 'vietphuc') return 'viet-phuc';
    if (compact === 'aobaba') return 'ao-ba-ba';
    if (compact === 'phukien') return 'phu-kien';

    return normalized.replace(/^-+|-+$/g, '');
  }
}
