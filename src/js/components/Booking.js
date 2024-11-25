import { select, templates, settings, classNames } from '../settings.js';
import {utils} from './../utils.js';
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";


class Booking{
  constructor(element){
    const thisBooking = this;

    thisBooking.selectedTable = null;
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.initSending();
  }

  getData(){
    const thisBooking = this;

    const startDataParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey   + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDataParam,
        endDateParam,
      ],
      eventsCurent: [
        settings.db.notRepeatParam,
        startDataParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    const urls = {
      booking:      settings.db.url + '/' + settings.db.bookings + '?' + params.booking.join('&'),
      eventsCurent: settings.db.url + '/' + settings.db.events    + '?' + params.eventsCurent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.events   + '?' + params.eventsRepeat.join('&'),
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurent),
      fetch(urls.eventsRepeat)
    ])
    .then(function(allResponses){
      const bookingsResponse = allResponses[0];
      const eventsCurentResponse = allResponses[1];
      const eventsRepeatResponse = allResponses[2];
      return Promise.all([
        bookingsResponse.json(),
        eventsCurentResponse.json(),
        eventsRepeatResponse.json(),
      ])
    })
    .then(function([bookings, eventsCurent, eventsRepeat]){
      thisBooking.parseData(bookings,eventsCurent,eventsRepeat);
    });
  }

  parseData(bookings,eventsCurent,eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(const item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    
    for(const item of eventsCurent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(const item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate,1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table); 
    }
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }
        
      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  render(element){
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = element.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = element.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = element.querySelectorAll(select.booking.tables);
    thisBooking.dom.tablesWrapper = element.querySelector(select.booking.tablesWrapper);
    thisBooking.dom.submit = element.querySelector(select.booking.submit);
    thisBooking.dom.phone = element.querySelector(select.booking.phone);
    thisBooking.dom.address = element.querySelector(select.booking.address);
    thisBooking.dom.starters = element.querySelectorAll(select.booking.starters);
  }
    
  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.clearTables();
      thisBooking.updateDOM();
    });

    thisBooking.dom.tablesWrapper.addEventListener('click', function(e){
      thisBooking.initTables(e);
    });
  }

  clearTables(){
    const thisBooking = this;

    for(const table of thisBooking.dom.tables){
      table.classList.remove('selected');
  }
  thisBooking.selectedTable = null;
  }

  initTables(e){
    const thisBooking = this;

    if(e.target.hasAttribute('data-table')){
      if(e.target.classList.contains('booked')){
        alert('This table is unavailable');
      } else {
        if(e.target.classList.contains('selected')){
          e.target.classList.remove('selected');
          thisBooking.selectedTable = null;
        } else {
          e.target.classList.add('selected');
          thisBooking.selectedTable = e.target.dataset.table;

          for(const table of thisBooking.dom.tables){
            if(table !== e.target){
              table.classList.remove('selected');
            }
          }
        }
      }
    }
  }

  initSending(){
    const thisBooking = this;

    thisBooking.dom.submit.addEventListener('click', function(e){
      e.preventDefault();
      thisBooking.sendBooking();
    });
  }

  sendBooking(){
    const thisBooking = this;

    if(thisBooking.selectedTable == null){
      alert('Pick a table');
      return;
    }

    const url = settings.db.url + '/' + settings.db.bookings;

    const payload = {};

    payload.date = thisBooking.datePicker.value;
    payload.hour = thisBooking.hourPicker.value;
    payload.table = parseInt(thisBooking.selectedTable);
    payload.duration = thisBooking.hoursAmount.value;
    payload.people = thisBooking.peopleAmount.value;
    payload.starters = [];
    payload.phone = thisBooking.dom.phone.value;
    payload.address = thisBooking.dom.address.value;

    for(const starter of thisBooking.dom.starters){
      if(starter.checked){
        payload.starters.push(starter.value);
      }
    }

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
      }).then(function(){
        thisBooking.getData();
      }).then(function(){
        thisBooking.clearTables();
      }).then(function(){
        alert('Reservation confirmed!');
      });
  }
}

export default Booking;