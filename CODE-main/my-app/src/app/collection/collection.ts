import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './collection.html',
  styleUrl: './collection.css',
})
export class Collection implements OnInit, OnDestroy {
  collectionTitle: string = '';
  album: string[] = [];
  private destroy$ = new Subject<void>();
  @ViewChild('heroVideo') videoElement!: ElementRef<HTMLVideoElement>;


  private data: any = {
    'kim-chi-ngoc-diep': {
      title: 'Kim Chi Ngọc Diệp',
      images: [
        '/assets/kimchingocdiep1.png',
        '/assets/kimchingocdiep2.png',
        '/assets/kimchingocdiep3.png',
        '/assets/kimchingocdiep4.png',
        '/assets/kimchingocdiep5.png',
        '/assets/kimchingocdiep6.png',
        '/assets/kimchingocdiep7.png',
        '/assets/kimchingocdiep8.png'
      ]
    },
    'nhuoc-cam-phu-hoa': {
      title: 'Nhược Cẩm Phù Hoa',
      images: [
        '/assets/nhuoccamphuhoa1.png',
        '/assets/nhuoccamphuhoa2.png',
        '/assets/nhuoccamphuhoa3.png',
        '/assets/nhuoccamphuhoa4.png',
        '/assets/nhuoccamphuhoa5.png',
        '/assets/nhuoccamphuhoa6.png',
        '/assets/nhuoccamphuhoa7.png',
        '/assets/nhuoccamphuhoa8.png'
      ]
    },
    'thuy-tuc-uyen-tam': {
      title: 'Thuỷ Túc Uyên Tầm',
      images: [
        '/assets/thuytucuyentam1.png',
        '/assets/thuytucuyentam2.png',
        '/assets/thuytucuyentam3.png',
        '/assets/thuytucuyentam4.png',
        '/assets/thuytucuyentam5.png',
        '/assets/thuytucuyentam6.png',
        '/assets/thuytucuyentam7.png',
        '/assets/thuytucuyentam8.png'
      ]
    },
    'y-hien': {
      title: 'Ý Hiên',
      images: [
        '/assets/yhien1.png',
        '/assets/yhien2.png',
        '/assets/yhien3.png',
        '/assets/yhien4.png',
        '/assets/yhien5.png',
        '/assets/yhien6.png',
        '/assets/yhien7.png',
        '/assets/yhien8.png'
      ]
    }
  };


  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Mute video
    setTimeout(() => {
      if (this.videoElement?.nativeElement) {
        this.videoElement.nativeElement.muted = true;
        this.videoElement.nativeElement.volume = 0;
      }
    }, 100);

    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = params['id'] || params['collectionName'];
        if (this.data[id]) {
          this.collectionTitle = this.data[id].title;
          this.album = this.data[id].images;
        } else {
          // Se a coleção não for encontrada, limpar os dados
          this.collectionTitle = '';
          this.album = [];
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

