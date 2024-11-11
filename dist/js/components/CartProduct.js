import {select} from './../settings.js';
import AmountWidget from './AmountWidget.js';

class CartProduct{
    constructor(menuProduct, element){
      const thisCartProduct = this;
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.params = menuProduct.params;

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();
      //console.log('thisCartProduct', thisCartProduct)
    }

    getElements(element){
      //console.log(element);
      const thisCartProduct = this;
      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = element.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = element.querySelector(select.cartProduct.price);
      thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);
    }

    initAmountWidget(){
      const thisCartProduct = this;
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.amount*thisCartProduct.priceSingle;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;

        //console.log('thisCartProduct.amountWidgect', thisCartProduct.amountWidget);

      });
    }

    remove(){
      const thisCartProduct = this;

      const event = new CustomEvent('remove',{
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });
      thisCartProduct.dom.wrapper.dispatchEvent(event);
      //console.log('element to remove: ', thisCartProduct);
    }

    initActions(){
      const thisCartProduct = this;
      thisCartProduct.dom.edit.addEventListener('click', function(e){
        e.preventDefault();
      });
      thisCartProduct.dom.remove.addEventListener('click', function(e){
        e.preventDefault();
        thisCartProduct.remove();
      });
    }

    getData(){
      const thisCartProduct = this;
      const orderSummary = {};

      orderSummary.id = thisCartProduct.id;
      orderSummary.name = thisCartProduct.name;
      orderSummary.amount = thisCartProduct.amount;
      orderSummary.price = thisCartProduct.price;
      orderSummary.priceSingle = thisCartProduct.priceSingle;
      orderSummary.params = thisCartProduct.params;
      
      return orderSummary;
    }
  }

  export default CartProduct;