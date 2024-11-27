import {settings, select, classNames, templates} from './../settings.js';
import {utils} from './../utils.js';
import CartProduct from './CartProduct.js';

class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();
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
  }

  initActions(){
    const thisCart = this;

    const hideFunc = function(){
      thisCart.dom.wrapper.classList.remove(classNames.cart.wrapperActive);
      document.body.removeEventListener('click', hideFunc);
    }

    thisCart.dom.toggleTrigger.addEventListener('click', function(){
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      thisCart.dom.wrapper.addEventListener('click',(e) => {
        e.stopPropagation();
      });
      setTimeout(() => {
        document.body.addEventListener('click', hideFunc)
      }, 100)
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
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

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
    thisCart.products.length > 0 ? thisCart.dom.deliveryFee.innerHTML = deliveryFee : thisCart.dom.deliveryFee.innerHTML = 0;
  
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    
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
  }

  clearCart(){
    const thisCart = this;

    for(let i = thisCart.products.length - 1; i >= 0; i--){
      thisCart.remove(thisCart.products[i]);
    }
    thisCart.dom.phone.value = '';
    thisCart.dom.address.value = '';
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

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    if(thisCart.validOrder(payload)){
      fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(){
        alert('Order confirmed');
      }).then(function(){
        thisCart.clearCart();
      })
    }
      
  }

  validOrder(order){
    let msg = '';
    
    const conditions = [
      isNaN(order.totalNumber) || order.totalNumber == 0,
      !order.phone,
      !order.address
    ]

    const content = [
      'You need to order something',
      'Enter your phone',
      'Enter your address'
    ]

    for(let i = 0; i< conditions.length; i++){
      if(conditions[i]){
        msg=content[i];
        break;
      }
    }

    if(msg == ''){
      return true;
    } else {
      alert(msg);
      return false;
    }
  }
}

  export default Cart;