import {settings, select, classNames, templates} from './../settings.js';
import {utils} from './../utils.js';
import CartProduct from './CartProduct.js';

class Cart{
    constructor(element){
      const thisCart = this;
      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();

      //console.log('new Cart', thisCart);
    }

    getElements(element){
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = document.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = element.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = element.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = element.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = element.querySelector(select.cart.totalNumber);
      thisCart.dom.form = element.querySelector(select.cart.form);
      thisCart.dom.address = element.querySelector(select.cart.address);
      thisCart.dom.phone = element.querySelector(select.cart.phone);
      //console.log(thisCart.dom.totalPrice);
    }

    initActions(){
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });
      thisCart.dom.productList.addEventListener('remove',function(e){
        e.preventDefault();
        thisCart.remove(e.detail.cartProduct);
      });
      thisCart.dom.form.addEventListener('submit', function(e){
        e.preventDefault();
        thisCart.sendOrder();
      })
    }

    add(menuProduct){
      const thisCart = this;

      const generatedHTML = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      thisCart.dom.productList.appendChild(generatedDOM);
      // console.log('generatedDOM: ',generatedDOM);
      // console.log('toggleTrigger: ', thisCart.dom.toggleTrigger);

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

      console.log('Products: ', this.products);
      //console.log('thisCart.products', thisCart.products);
      thisCart.update();
    }

    update(){
      const thisCart = this;
      const deliveryFee = settings.cart.defaultDeliveryFee;
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;

      for(const product of thisCart.products){
        thisCart.totalNumber += product.amount;
        thisCart.subtotalPrice += product.price;
      }

      thisCart.products.length > 0 ? thisCart.totalPrice = thisCart.subtotalPrice + deliveryFee : thisCart.totalPrice = 0;
      //console.log('totalNumber: ',totalNumber, ' subtotalPrice: ', subtotalPrice, ' totalPrice: ', thisCart.totalPrice);

      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      
      for(const el of thisCart.dom.totalPrice){
        el.innerHTML = thisCart.totalPrice;
      }
    }

    remove(el){
      const thisCart = this;
      el.dom.wrapper.remove();
      const index = thisCart.products.indexOf(el);
      thisCart.products.splice(index, 1);
      thisCart.update();

      //console.log(thisCart.products);
    }

    sendOrder(){
      const thisCart = this;
      const url = settings.db.url + '/' + settings.db.orders;
      const payload = {};

      payload.address = thisCart.dom.address.value;
      payload.phone = thisCart.dom.phone.value;
      payload.totalPrice = thisCart.totalPrice;
      payload.subtotalPrice = thisCart.subtotalPrice;
      payload.totalNumber = thisCart.totalNumber;
      payload.deliveryFee = settings.cart.defaultDeliveryFee;
      payload.products = [];

      for(const prod of thisCart.products){
        payload.products.push(prod.getData());
      }
      //console.log(payload);

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };

      fetch(url, options)
        .then(function(response){
          return response.json();
        }).then(function(parsedResponse){
          console.log('parsedResponse', parsedResponse);
        });
    }
  }

  export default Cart;