import { select, templates } from "../settings.js";
import Flickity from './../../vendor/flickity/flickity.js';

class Home{
  constructor(element){
    const thisHome = this;

    thisHome.render(element);
    thisHome.initActions();
    thisHome.initCarousel();
  }

  render(element){
    const thisHome = this;
    
    const generatedHTML = templates.home();
    
    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;

    thisHome.dom.order = element.querySelector(select.home.order);
    thisHome.dom.booking = element.querySelector(select.home.booking);
    thisHome.dom.tiles = element.querySelector(select.home.tiles);
    thisHome.dom.carousel = element.querySelector(select.home.carousel);
  }

  initActions(){
    const thisHome = this;
    thisHome.dom.tiles.addEventListener('click', function(e){
      const pageId = e.target.getAttribute('data-tile') || e.target.parentElement.getAttribute('data-tile');
      if(pageId !== 'info')
      thisHome.annouce(pageId);
    });
  }

  annouce(pageId){
    const thisHome = this;
    const event = new CustomEvent('tileClicked',{
      bubbles: true,
      detail: {
        pageId: pageId,
      }
    });
    thisHome.dom.wrapper.dispatchEvent(event);
  }

  initCarousel(){
    const thisHome = this;

    const flkty = new Flickity(thisHome.dom.carousel,{  
      cellAlign: 'left',
      contain: true,
      autoPlay: 3000,
      wrapAround: true,
      prevNextButtons: false,
    });
    flkty.used = true;
  }
}

export default Home;