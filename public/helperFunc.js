const _ = identifier => {
  return document.querySelector(identifier);
};
const $$ = identifier => {
  return document.querySelectorAll(identifier);
};

const addAndRemoveService = () => {
  console.log('adding more');
  $(`.ServiceTab`).append(`<div class="numberOfLinksCont">
  <input
    title="Add a Service Tag . eg: amazon, roblox etc"
    type="text"
    placeholder="Enter a service"
    data-purpose="service"
  />
  <span>=</span>
  <input
    type="text"
    title="Enter a Service value that would be after the '=' in the link"
    placeholder="Enter service value"
    data-purpose="value"
  />
  <i style="font-size: 30px; color: rgb(207, 40, 40);"
              class="fa fa-times-circle"
              title="Cancel Service"
          
              data-id="cancelService"
            ></i>
 
</div>`);
  let cancelList = $$('[data-id="cancelService"]');
  console.log(cancelList);
  cancelList.forEach(cancelService => {
    if (cancelService.getAttribute('data-first') == 'true') {
    } else {
      cancelService.addEventListener('click', e => {
        console.log('cancel');
        e.target.parentNode.parentNode.removeChild(e.target.parentNode);
      });
    }
  });
  let inputList = $$('input');
  // console.log(input);
  inputList.forEach(input => {
    input.addEventListener('change', e => {
      e.target.style.border = '1px solid rgb(40, 165, 207)';
    });
  });
};

const queryStringAndSendHandler = (affiliateLink, socket) => {
  // get all data-purpose tags
  if (affiliateLink == '') {
    console.log('empty link');
    _(`.errorLink`).innerHTML =
      '<p style="color:red" >Please fill the link</p>';

    return;
  }

  let baseLink = `${affiliateLink}?`;
  // let baseLink = `${affiliateLink}/?`;

  // get data-purpose="service"

  const services = [...$$(`[data-purpose="service"]`)].splice(1);
  const serviceValues = [...$$(`[data-purpose="value"]`)].splice(1);

  console.log(services, serviceValues);
  if (services.length === 0 && serviceValues.length === 0) {
    _(`.error`).innerHTML = '';

    baseLink += `Domain=`;

    _("[href='#progressConsole']").click();
    let inputList = $$('input');
    // console.log(input);
    inputList.forEach(input => {
      input.addEventListener('keydown', e => {
        e.target.style.border = '1px solid rgb(40, 165, 207)';
      });
    });

    connectingSocket(baseLink, socket);
  }
  for (i = 0; i < services.length; i++) {
    console.log('now');
    services[i].style.border = '1px solid rgb(40, 165, 207)';
    serviceValues[i].style.border = '1px solid rgb(40, 165, 207)';
    console.log(services[i].value, serviceValues[i].value);
    if (
      services[i].value == 'domain' &&
      serviceValues[i].value == `random number`
    ) {
      console.log('skip');
    } else if (services[i].value == '' || serviceValues[i].value == '') {
      console.log('empty attributes');
      services[i].style.border = '1px solid red';
      serviceValues[i].style.border = '1px solid red';

      _(`.error`).innerHTML =
        '<h3 style="color:red">There are Empty Attributes</h3>';
      return;
    } else {
      _(`.error`).innerHTML = '';

      if (i !== services.length - 1) {
        baseLink += `${services[i].value}=${serviceValues[i].value}&`;
      } else {
        baseLink += `${services[i].value}=${serviceValues[i].value}&Domain=`;
      }
      _("[href='#progressConsole']").click();
      let inputList = $$('input');
      // console.log(input);
      inputList.forEach(input => {
        input.addEventListener('keydown', e => {
          e.target.style.border = '1px solid rgb(40, 165, 207)';
        });
      });

      connectingSocket(baseLink, socket);
    }
  }

  // console.log(baseLink);
};

const connectingSocket = (baseLink, socket) => {
  console.log(baseLink);
  socket.emit('tweetStart', {
    baseLink
  });
};
