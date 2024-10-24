/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

const select = {
  templateOf: {
    menuProduct: "#template-menu-product",
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

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
      console.log('imageWrapper',thisProduct.imageWrapper);
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
      thisProduckt.accordionTrigger = thisProduckt.element.querySelector(select.menuProduct.clickable);
      thisProduckt.form = thisProduckt.element.querySelector(select.menuProduct.form);
      thisProduckt.formInputs = thisProduckt.element.querySelectorAll(select.all.formInputs);
      thisProduckt.cartButton = thisProduckt.element.querySelector(select.menuProduct.cartButton);
      thisProduckt.priceElem = thisProduckt.element.querySelector(select.menuProduct.priceElem);
      thisProduckt.imageWrapper = thisProduckt.element.querySelector(select.menuProduct.imageWrapper);
      thisProduckt.amountWidgetElem = thisProduckt.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordin(){
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */
      //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      //console.log(clickableTrigger);

      /* START: add event listener to clickable trigger on event click */
      thisProduct.accordionTrigger.addEventListener('click', function(e){
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

      thisProduckt.form.addEventListener('submit',function(e){
        e.preventDefault();
        thisProduckt.processOrder();
      });

      for(const input of thisProduckt.formInputs){
        input.addEventListener('change', function(){
          thisProduckt.processOrder();
        });

        thisProduckt.cartButton.addEventListener('click', function(e){
          e.preventDefault();
          thisProduckt.processOrder();
        });
      }

    }
    
    processOrder(){
      const thisProduckt = this;
      //console.log('processOrder of ' + thisProduckt.id + ' is running..');

       // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduckt.form);
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
          const images = thisProduckt.imageWrapper.querySelectorAll(`.${paramId}-${optionId}`);

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

      price *= thisProduckt.amountWidget.value;
      thisProduckt.priceElem.innerHTML = price;
    }

    initAmountWidget(){
      const thisProduckt = this;
      thisProduckt.amountWidget = new AmountWidget(thisProduckt.amountWidgetElem);

      thisProduckt.amountWidgetElem.addEventListener('updated',function(){
        thisProduckt.processOrder();
      });
    }
  }

  class AmountWidget{
    constructor(element){
      const thisWidget = this;
      thisWidget.getElements(element);
      //thisWidget.setValue(thisWidget.input.value);
      thisWidget.setValue(thisWidget.setDefaultInputValue());
      thisWidget.initActions();

      // console.log('AmountWidget: ', thisWidget);
      // console.log('constructor argument: ', element);
    }

    getElements(element){
      const thisWidget = this;
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value){
      const thisWidget = this;
      const newValue = parseInt(value);

      /*Validation*/
      if(thisWidget.value !== newValue && !isNaN(value)){
        thisWidget.value = newValue;
      }
      
      if(newValue > settings.amountWidget.defaultMax) {
        thisWidget.value = settings.amountWidget.defaultMax; 
      }

      if(newValue < settings.amountWidget.defaultMin) {
        thisWidget.value = settings.amountWidget.defaultMin; 
      }
      //Why doesn't it work?
      // newValue > settings.amountWidget.defaultMax ? thisWidget.value = settings.amountWidget.defaultMax : thisWidget.value = newValue; 
      // newValue < settings.amountWidget.defaultMin ? thisWidget.value = settings.amountWidget.defaultMin : thisWidget.value = newValue; 
      
      thisWidget.input.value = thisWidget.value;
      //console.log('setValue called');

      thisWidget.annouce();
    }
    
    initActions(){
      //console.log('here');
      const thisWidget = this;
      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkDecrease.addEventListener('click', function(e){
        e.preventDefault;
        thisWidget.setValue(thisWidget.value - 1);
      }); 

      thisWidget.linkIncrease.addEventListener('click', function(e){
        e.preventDefault;
        thisWidget.setValue(thisWidget.value + 1);
      }); 
    }

    annouce(){
      const thisWidget = this;
      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }

    setDefaultInputValue(){
      const thisWidget = this;
      if(isNaN(thisWidget.input.value)){
        return settings.amountWidget.defaultValue;
      } else {
        return thisWidget.input.value;
      }
    }   
  }

  const app = {
    initMenu: function(){
      const thisApp = this;
      console.log('thisApp.data: ', thisApp.data);
      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function(){
      const thisApp = this;
      thisApp.data = dataSource;
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
