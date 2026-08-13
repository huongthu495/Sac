
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 0,
    "route": "/"
  },
  {
    "renderMode": 0,
    "route": "/sac-blog"
  },
  {
    "renderMode": 0,
    "route": "/contact"
  },
  {
    "renderMode": 0,
    "route": "/policy"
  },
  {
    "renderMode": 0,
    "route": "/privacy"
  },
  {
    "renderMode": 0,
    "route": "/term"
  },
  {
    "renderMode": 0,
    "route": "/ship"
  },
  {
    "renderMode": 0,
    "route": "/ship-method"
  },
  {
    "renderMode": 0,
    "route": "/how-to-buy"
  },
  {
    "renderMode": 0,
    "route": "/aboutus"
  },
  {
    "renderMode": 0,
    "route": "/about-us"
  },
  {
    "renderMode": 0,
    "route": "/products"
  },
  {
    "renderMode": 0,
    "route": "/products/*"
  },
  {
    "renderMode": 0,
    "route": "/login"
  },
  {
    "renderMode": 0,
    "route": "/signup"
  },
  {
    "renderMode": 0,
    "route": "/forgot-password"
  },
  {
    "renderMode": 0,
    "route": "/reset-password"
  },
  {
    "renderMode": 0,
    "redirectTo": "/account/profile",
    "route": "/account"
  },
  {
    "renderMode": 0,
    "route": "/account/profile"
  },
  {
    "renderMode": 0,
    "route": "/account/address"
  },
  {
    "renderMode": 0,
    "route": "/account/orders"
  },
  {
    "renderMode": 0,
    "route": "/account/wishlist"
  },
  {
    "renderMode": 0,
    "redirectTo": "/account/profile",
    "route": "/account/**"
  },
  {
    "renderMode": 0,
    "route": "/cart"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-TJFRRGCX.js"
    ],
    "route": "/admin"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-TJFRRGCX.js"
    ],
    "route": "/admin/mainpage"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-TJFRRGCX.js"
    ],
    "route": "/admin/orders"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-TJFRRGCX.js"
    ],
    "route": "/admin/users"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-TJFRRGCX.js"
    ],
    "route": "/admin/products"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-TJFRRGCX.js"
    ],
    "route": "/admin/blogs"
  },
  {
    "renderMode": 0,
    "preload": [
      "chunk-TJFRRGCX.js"
    ],
    "route": "/admin/feedbacks"
  },
  {
    "renderMode": 0,
    "route": "/product/*"
  },
  {
    "renderMode": 0,
    "route": "/collections/*"
  },
  {
    "renderMode": 0,
    "route": "/blogs"
  },
  {
    "renderMode": 0,
    "route": "/blogs/*"
  },
  {
    "renderMode": 0,
    "route": "/blog-catalog"
  },
  {
    "renderMode": 0,
    "route": "/letters"
  },
  {
    "renderMode": 0,
    "route": "/blog/*"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 9620, hash: 'dd7a67ba7eb6f60790719ecb817e96a5ca67af363bfd83bfb113cbbcd4fcd3d8', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 9968, hash: '3c666e00b57ba1144e3d691bde5062f9ba7be9e648a0e8f9a5e02ad5ffb73612', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-3SEBDQFR.css': {size: 40, hash: 'RzXWn47xU0o', text: () => import('./assets-chunks/styles-3SEBDQFR_css.mjs').then(m => m.default)}
  },
};
