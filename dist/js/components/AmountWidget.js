import {settings, select } from './../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget{
    constructor(element){
      super(element, settings.amountWidget.defaultValue);

      const thisWidget = this;
      thisWidget.getElements(element);
      //thisWidget.setValue(thisWidget.dom.input.value);

      //////thisWidget.setValue(thisWidget.setDefaultInputValue());
      thisWidget.initActions();
      thisWidget.renderValue();

      //console.log('AmountWidget: ', thisWidget);
      // console.log('constructor argument: ', element);
    }

    getElements(){
      const thisWidget = this;
      /////thisWidget.element = element;
      thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
      thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
    }

    isValid(value){
      return !isNaN(value)
      && value >= settings.amountWidget.defaultMin 
      && value <= settings.amountWidget.defaultMax
    }

    renderValue(){
      const thisWidget = this;
      thisWidget.dom.input.value = thisWidget.value;
    }
    
    initActions(){
      const thisWidget = this;
      thisWidget.dom.input.addEventListener('change', function(){
        //thisWidget.setValue(thisWidget.dom.input.value);
        thisWidget.value = thisWidget.dom.input.value;
      });

      thisWidget.dom.linkDecrease.addEventListener('click', function(e){
        e.preventDefault;
        //thisWidget.setValue(thisWidget.value - 1);
        thisWidget.value = thisWidget.value - 1;
      }); 

      thisWidget.dom.linkIncrease.addEventListener('click', function(e){
        e.preventDefault;
        //thisWidget.setValue(thisWidget.value + 1);
        thisWidget.value = thisWidget.value + 1;
      }); 
    }

    // setDefaultInputValue(){
    //   const thisWidget = this;
    //   if(isNaN(thisWidget.dom.input.value)){
    //     return settings.amountWidget.defaultValue;
    //   } else {
    //     return thisWidget.dom.input.value;
    //   }
    // }   
  }

  export default AmountWidget;