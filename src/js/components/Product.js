import {select, classNames, templates} from './../settings.js'
import {utils} from './../utils.js';
import AmountWidget from './AmountWidget.js';

class Product{
    constructor(id, data){
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordin();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder(); 

      //console.log('new Product: ', thisProduct);
      /*
      console.log('accordingTrigger',thisProduct.accordionTrigger);
      console.log('form',thisProduct.form);
      console.log('formInputs',thisProduct.formInputs);
      console.log('cartButton',thisProduct.cartButton);
      console.log('priceElem',thisProduct.priceElem);
      */ 
      //console.log('imageWrapper',thisProduct.imageWrapper);
    }

    renderInMenu(){
      const thisProduct = this;

      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      //console.log(generatedHTML);
      
      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);

    }

    getElements(){
      const thisProduckt = this;
      thisProduckt.dom = {};
      thisProduckt.dom.accordionTrigger = thisProduckt.element.querySelector(select.menuProduct.clickable);
      thisProduckt.dom.form = thisProduckt.element.querySelector(select.menuProduct.form);
      thisProduckt.dom.formInputs = thisProduckt.element.querySelectorAll(select.all.formInputs);
      thisProduckt.dom.cartButton = thisProduckt.element.querySelector(select.menuProduct.cartButton);
      thisProduckt.dom.priceElem = thisProduckt.element.querySelector(select.menuProduct.priceElem);
      thisProduckt.dom.imageWrapper = thisProduckt.element.querySelector(select.menuProduct.imageWrapper);
      thisProduckt.dom.amountWidgetElem = thisProduckt.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordin(){
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */
      //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      //console.log(clickableTrigger);

      /* START: add event listener to clickable trigger on event click */
      thisProduct.dom.accordionTrigger.addEventListener('click', function(e){
        //console.log('works!');

        /* prevent default action for event */
        e.preventDefault();

        /* find all active products */
        const allActiveProducts = document.querySelectorAll(select.all.menuProductsActive);

        /* if there is active product and it's not thisProduct.element, remove class active from it */
        for(const activeProduct of allActiveProducts){
          if(activeProduct != thisProduct.element){
            activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
          }
        }

        /* toggle thisProduckt.element with the .active class */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }

    initOrderForm(){
      const thisProduckt = this;
      //console.log('initOrderForm of ' + thisProduckt.id + ' is running..');

      thisProduckt.dom.form.addEventListener('submit',function(e){
        e.preventDefault();
        thisProduckt.processOrder();
      });

      for(const input of thisProduckt.dom.formInputs){
        input.addEventListener('change', function(){
          thisProduckt.processOrder();
        });
      }

        thisProduckt.dom.cartButton.addEventListener('click', function(e){
          e.preventDefault();
          thisProduckt.processOrder();
          thisProduckt.addToCart();
          //console.log('app.cart.products: ',app.cart.products);
        });
    }
    
    processOrder(){
      const thisProduckt = this;
      //console.log('processOrder of ' + thisProduckt.id + ' is running..');

       // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduckt.dom.form);
      //console.log('formData', formData);

      // set price to default price
      let price = thisProduckt.data.price;

      // for every category
      for(const paramId in thisProduckt.data.params){ 
        const paramObj = thisProduckt.data.params[paramId];
        //console.log('param: ',param);

        // for every option in this category
        for(const optionId in paramObj.options){
          const optionObj = paramObj.options[optionId]; //from data
          const optionChosen = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) != -1; //from page
          if(optionChosen && !optionObj.default){
            price += optionObj.price;
          } else if (!optionChosen && optionObj.default){
            price -= optionObj.price;
          }

          //images
          const images = thisProduckt.dom.imageWrapper.querySelectorAll(`.${paramId}-${optionId}`);

          if (optionChosen){
            for(const image of images){
              image.classList.add(classNames.menuProduct.imageVisible);
            }
          } else {
            for (const image of images){
              image.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }

      thisProduckt.priceSingle = price;
      price *= thisProduckt.amountWidget.value;
      thisProduckt.dom.priceElem.innerHTML = price;
    }

    initAmountWidget(){
      const thisProduckt = this;
      thisProduckt.amountWidget = new AmountWidget(thisProduckt.dom.amountWidgetElem);

      thisProduckt.dom.amountWidgetElem.addEventListener('updated',function(){
        thisProduckt.processOrder();
      });
    }

    addToCart(){
      const thisProduct = this;

      //app.cart.add(thisProduct.prepareCartProduct());
      const event = new CustomEvent('add-to-card', {
        bubbles: true,
        detail: {
            product: thisProduct.prepareCartProduct(),
        }
      });
      thisProduct.element.dispatchEvent(event);
    }

    prepareCartProduct(){
      const thisProduckt = this;

      const productSummary = {};

      productSummary.id = thisProduckt.id;
      productSummary.name = thisProduckt.data.name;
      productSummary.amount = thisProduckt.amountWidget.value;
      productSummary.priceSingle = thisProduckt.priceSingle;
      productSummary.price = productSummary.priceSingle*productSummary.amount;
      productSummary.params = thisProduckt.prepareCartProductParams();

      return productSummary;
    }

    prepareCartProductParams(){
      const thisProduckt = this;

      const params = {};
      const formData = utils.serializeFormToObject(thisProduckt.dom.form);

      // for every category
      for(const paramId in thisProduckt.data.params){ 
        const paramObj = thisProduckt.data.params[paramId];

        params[paramId] = {
          label: paramObj.label,
          options: {}
        }

        // for every option in this category
        for(const optionId in paramObj.options){
          const optionObj = paramObj.options[optionId];
          const optionChosen = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) != -1;
          
          if(optionChosen){
            params[paramId].options[optionId] = optionObj.label;
          }
        }
      }
      
      return params;
    }
  }

  export default Product;