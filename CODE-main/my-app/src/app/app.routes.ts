import { Blog } from './sac-blog/blog/blog';
import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Contact } from './contact/contact';
import { Policy } from './customer-support/policy/policy';
import { HowToBuy } from './customer-support/how-to-buy/how-to-buy';
import { AboutUs } from './about-us/about-us';
import { ProductList } from './product-list/product-list';
import { Login } from './login/login';
import { Signup } from './signup/signup';
import { AccountLayout } from './account/account-layout/account-layout';
import { PersonalInformation } from './account/personal-information/personal-information';
import { AddressComponent } from './account/address/address';
import { OrdersComponent } from './account/orders/orders';
import { Wishlist } from './account/wishlist/wishlist';
import { ProductDetail } from './product-detail/product-detail';
import { Cart } from './cart/cart';
import { Collection } from './collection/collection';
import { LettersComponent } from './letters/letters';
import { BlogDetail } from './sac-blog/blog-detail/blog-detail';
import { ForgotPasswordGmail } from './account/forgot-password-gmail/forgot-password-gmail';
import { ForgotPasswordReset } from './account/forgot-password-reset/forgot-password-reset';

export const routes: Routes = [
    { path: 'sac-blog', component: Blog },
  { path: '', component: Home },
  { path: 'contact', component: Contact },
  { path: 'policy', component: Policy },
  { path: 'privacy', component: Policy },
  { path: 'term', component: Policy },
  { path: 'ship', component: Policy },
  { path: 'ship-method', component: Policy },
  { path: 'how-to-buy', component: HowToBuy },
  { path: 'aboutus', component: AboutUs },
  { path: 'about-us', component: AboutUs },
  { path: 'products', component: ProductList },
  { path: 'products/:category', component: ProductList },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'forgot-password', component: ForgotPasswordGmail },
  { path: 'reset-password', component: ForgotPasswordReset },
  {
    path: 'account',
    component: AccountLayout,
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'profile', component: PersonalInformation },
      { path: 'address', component: AddressComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'wishlist', component: Wishlist },
      { path: '**', redirectTo: 'profile' }
    ]
  },
  { path: 'cart', component: Cart },
  {
    path: 'admin',
    loadChildren: () => import('../app/admin/admin-module').then(m => m.AdminModule)
  },
  { path: 'product/:id', component: ProductDetail },
  { path: 'collections/:id', component: Collection },
  { path: 'blogs', component: LettersComponent },
  { path: 'blog-catalog', component: LettersComponent },
  { path: 'letters', component: LettersComponent },
  { path: 'blog/:id', component: BlogDetail },
  { path: 'blogs/:id', component: BlogDetail },
];