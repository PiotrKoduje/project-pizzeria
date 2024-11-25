import {settings, select, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
import Home from './components/Home.js';


const app = {
  initPages: function(){
    const thisApp = this;
    
    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '');
    //console.log('idFromHash: ',idFromHash);
    
    let pageMatchingHash = thisApp.pages[0].id;
    
    for(const page of thisApp.pages){
      if(page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }
    
    //console.log('pageMatchingHash: ',pageMatchingHash);
    thisApp.activatePage(pageMatchingHash);
    
    for(const link of thisApp.navLinks){
      link.addEventListener('click',function(e){
        const clickedElement = this;
        e.preventDefault();

        /* get page id from href attribute */
        const id = clickedElement.getAttribute('href').replace('#', '');

        /* run thisApp.activatePage with that id */
        thisApp.activatePage(id);

        /* change URL hash */
        window.location.hash = '#/' + id;
      });
    }
  },

  activatePage: function(pageId){
    const thisApp = this;
    /* add class 'active' to matching page, remove from non-matching */
    for(const page of thisApp.pages){
      //page.id == pageId ? page.classList.add(classNames.pages.active) : page.classList.remove(classNames.pages.active);
      page.classList.toggle(
        classNames.pages.active,
        page.id == pageId
      );
    }
    /* add class 'active' to matching link, remove from non-matching */
    for(const link of thisApp.navLinks){
      link.classList.toggle(
        classNames.nav.active, 
        link.getAttribute('href') == '#' + pageId
      );
    }
  },

  initMenu: function(){
    const thisApp = this;
    //console.log('thisApp.data: ', thisApp.data);
    for(let productData of thisApp.data.products){
      new Product(productData.id, productData);
    }
  },

  initData: function(){
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then(function(rowResponse){
        return rowResponse.json();
      }).then(function(parsedResponse){
        //console.log('parsedResponse', parsedResponse);

        /*save parsedResponse as thisApp.data.products*/
        thisApp.data.products = parsedResponse;

        /*execute initMenu method */
        thisApp.initMenu();
      });
  },

  initCart: function(){
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-card', function(e){
      app.cart.add(e.detail.product);
    })
  },

  initBooking: function(){
    const thisApp = this;
    const bookingContainer = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(bookingContainer);
  },

  initHome: function(){
    const thisApp = this;
    const homeContainer = document.querySelector(select.containerOf.home);
    thisApp.home = new Home(homeContainer);
    //console.log(thisApp.home.dom.wrapper);

    thisApp.home.dom.wrapper.addEventListener('tileClicked',function(e){
      thisApp.activatePage(e.detail.pageId);
    })
  },

  init: function(){
    const thisApp = this;
    // console.log('*** App starting ***');
    // console.log('thisApp:', thisApp);
    // console.log('classNames:', classNames);
    // console.log('settings:', settings);
    // console.log('templates:', templates);

    thisApp.initData();
    thisApp.initCart();
    thisApp.initPages();
    thisApp.initBooking();
    thisApp.initHome();
    //console.log(thisApp);
  },
};

app.init();

