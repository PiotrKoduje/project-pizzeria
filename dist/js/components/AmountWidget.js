import {settings, select } from './../settings.js';

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
      
      //  newValue > settings.amountWidget.defaultMax ? thisWidget.value = settings.amountWidget.defaultMax : thisWidget.value = newValue; 
      //  newValue < settings.amountWidget.defaultMin ? thisWidget.value = settings.amountWidget.defaultMin : thisWidget.value = newValue; 
      
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
      const event = new CustomEvent('updated',{
        bubbles: true
      });
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

  export default AmountWidget;