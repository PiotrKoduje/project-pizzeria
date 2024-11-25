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
  }

  renderInMenu(){
    const thisProduct = this;

    const generatedHTML = templates.menuProduct(thisProduct.data);
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    const menuContainer = document.querySelector(select.containerOf.menu);
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

    thisProduct.dom.accordionTrigger.addEventListener('click', function(e){
      e.preventDefault();
      const allActiveProducts = document.querySelectorAll(select.all.menuProductsActive);

      for(const activeProduct of allActiveProducts){
        if(activeProduct != thisProduct.element){
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }
      }

      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
    });
  }

  initOrderForm(){
    const thisProduckt = this;

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
      });
  }
  
  processOrder(){
    const thisProduckt = this;
    
    const formData = utils.serializeFormToObject(thisProduckt.dom.form);
    let price = thisProduckt.data.price;

    for(const paramId in thisProduckt.data.params){ 
      const paramObj = thisProduckt.data.params[paramId];
      
      for(const optionId in paramObj.options){
        const optionObj = paramObj.options[optionId]; //from data
        const optionChosen = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) != -1; //from page
        if(optionChosen && !optionObj.default){
          price += optionObj.price;
        } else if (!optionChosen && optionObj.default){
          price -= optionObj.price;
        }

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