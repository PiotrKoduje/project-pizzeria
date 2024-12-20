class BaseWidget{
  constructor(wrapperElement, initialValue){
    const thisWidget = this;
    
    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;
    thisWidget.correctValue = initialValue;
  }

  get value(){
    const thisWidget = this;

    return thisWidget.correctValue;
  }

  set value(value){
    const thisWidget = this;

    const newValue = thisWidget.parseValue(value);
    
    if(thisWidget.correctValue !== newValue && thisWidget.isValid(value)){
      thisWidget.correctValue = newValue;
    }
    
    thisWidget.renderValue();
    thisWidget.annouce();
  }

  parseValue(value){
    return parseInt(value);
  }

  isValid(value){
    return !isNaN(value);
  }

  renderValue(){
    const thisWidget = this;

    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }

  annouce(){
    const thisWidget = this;
    
    const event = new CustomEvent('updated',{
      bubbles: true
    });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}

export default BaseWidget;
