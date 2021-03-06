// Make connection

let socket = io.connect('http://167.99.124.182:3900');
// let socket = io.connect('http://localhost:3900');
// const apiKeyMobileSMS = `b26b5a48c0f72eeeff426ace85c4255f`;

// querySelectorFucntion

const tweetBtn = _('.ButtonCont a');
const progressConsole = _('#progressConsole');
const affiliatLinkInput = _('.AffiliatLinkCont input');
const serviceTab = _('.ServiceTab');
const addMoreServices = _('#addMoreServices');
const cancelServices = $$('[data-id="cancelService"]');
const consoleBody = _('#consoleBody');
const consoleHeader = _('#consoleHeader');
const numberOfInstances = _('.numberOfInstances .target');
const numberOfLinks = _('.numberOfLinksGenerated .target');

socket.on('tweet', data => {
  _(`[data-id="${data.email}"] .statusCircle`).className =
    'statusCircle loadingState';
});
let numOfLinksCounter = 0;

socket.on('tweetLinks', data => {
  _(`[data-id="${data.email}"] .statusCircle`).className =
    'statusCircle active';

  _(`[data-id="${data.email}"] .count`).innerText = `${parseInt(
    _(`[data-id="${data.email}"] .count`).innerText
  ) + 1}`;
});

socket.on('tweetEnd', data => {
  _(`[data-id="${data.email}"] .statusCircle`).className =
    'statusCircle killed';
});

socket.on('deleteRecord', data => {
  _(`[data-id="${data.email}"] .statusCircle`).className =
    'statusCircle destroyed';
  _(`[data-id="${data.email}"] .destroyedBackdrop`).style.display = 'block';
  _(`[data-id="${data.email}"] .destroyedBackdrop`).innerHTML =
    '<p class="DestroyedText">Instance has been destroyed: Too many failed attempts to tweet</p>';
});

const deleteCSV = offer => {
  socket.emit('delete', {
    command: 'delete',
    offer
  });
};
const askDeleteCSV = offer => {
  _('.modal').style.display = 'block';
  _('.backdrop').style.display = 'block';
  _('.modal').innerHTML = `
    <div class="ButtonsCont"> 
      <button onclick="deleteCSV(${offer})" class="DeleteOffer">Confirmation of Delete of Offer ${offer}</button>
    </div>
  `;
};
const removeModal = () => {
  _('.modal').style.display = 'none';
  _('.backdrop').style.display = 'none';
};

const downloadCsv = async offer => {
  console.log(offer);
  // return;
  try {
    const response = await fetch(
      `http://167.99.124.182:9808/downloadnew?q=${offer}`,
      {
        method: 'GET'
      }
    );
    console.log(response);
    if (response.status === 200) {
      const blob = await response.blob();
      // console.log(doc);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date();
      a.setAttribute('hidden', url);
      a.setAttribute('href', url);
      a.setAttribute('download', `download${date.getMilliseconds()}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    // return;
  } catch (error) {}

  // document.body.removeChild(a);
};

// visual display of values

// let numOfInstanceCounter = 0;

socket.on('seenTweetButton', data => {
  _(`[data-id="${data.email}"] .statusCircle`).className =
    'statusCircle active';
});
// socket.on('instanceError', data => {
//   numOfInstanceCounter--;
//   numberOfInstances.innerText = numOfInstanceCounter;
// });

socket.on('delete', data => {
  alert(`${data} is deleted`);
});
socket.on('deleteError', data => {
  alert(`${data}`);
});
const terminateProcess = () => {
  _('.downloadRefreshLoader').style.display = 'block';
  socket.emit('kill', 1);
};
socket.on('errorActivity', data => {
  _('downloadRefreshLoader').style.display = 'none';
});
socket.on('restartAll', data => {
  _('.downloadRefreshLoader').style.display = 'none';
  $$('.vCont .userActionCont .statusCircle').forEach(statusCircle => {
    statusCircle.className = 'statusCircle killed';
  });
});

const verifyAccount = () => {
  fetch(`http://167.99.124.182:9808/deleteAll`)
    .then(function(response) {
      if (response.status !== 200) {
        console.log(
          'Looks like there was a problem. Status Code: ' + response.status
        );
        return;
      }

      // Examine the text in the response
      response.json().then(function(data) {
        console.log(data);
        alert(
          'accounts cleared please wait for 10 minutes for the verification process'
        );
      });
    })
    .catch(function(err) {
      console.log('Fetch Error :-S', err);
    });
};
const fetchMobSMSBalance = async () => {
  fetch(`http://167.99.124.182:9808/balanceOnSMS`)
    // fetch(`http://localhost:9808/balanceOnSMS`)

    .then(function(response) {
      if (response.status !== 200) {
        console.log(
          'Looks like there was a problem. Status Code: ' + response.status
        );
        return;
      }

      // Examine the text in the response
      response.json().then(function(data) {
        console.log(data);
        _('.balanceNumber').innerHTML = parseFloat(data.balance).toFixed(2);
        if (parseFloat(data.balance) < 3) {
          _('.balanceNumber').style.color = 'red';
        }
        setTimeout(() => {
          fetchMobSMSBalance();
        }, 60000);
      });
    });
};
// `https://mobilesms.io/webapp/api?action=balance&key=${apiKeyMobileSMS}`
const getAllAccounts = () => {
  fetch(`http://167.99.124.182:9808/getVerifiedAccounts`)
    // fetch(`http://localhost:9808/getVerifiedAccounts`)
    .then(function(response) {
      if (response.status !== 200) {
        console.log(
          'Looks like there was a problem. Status Code: ' + response.status
        );
        return;
      }

      // Examine the text in the response
      response.json().then(function(data) {
        console.log(data);
        if (data['users'].length <= 0) {
          _('.vCont').innerHTML = `<div class='emptyUsers'>
              <h2 style="text-align: center">There are no verified Users</h2>
            </div>`;
          return;
        }

        _('.vCont').innerHTML = data['users'].map(user => {
          return ` <div class='userActionCont' data-id="${user.email}">
          <div class="userDetails">
            <h3 class="email"> ${user.email}</h3>
              <div class="twitterDetailsCont">
          
              <h3 class="email"> ${user.twitterpassword}</h3>
             </div>
            </div>
            <div class="enterLinkCont"> <input data-input="${
              user.email
            }" type="text" value="${
            user.baseLink ? user.baseLink : ''
          }" placeholder="Enter Link"/> </div>
         
            <div class="start" data-email="${
              user.email
            }" data-twitterpassword="${user.twitterpassword}"><button ${
            !user.baseLink ? 'disabled' : ''
          }> Start </button> </div>
            
            
            <div class="offerSelect" data-select="${user.email}">
            <select>
              <option ${user.offer === 1 ? 'selected' : ''} value="1">1</option>
              <option  ${
                user.offer === 2 ? 'selected' : ''
              } value="2">2</option>
              <option ${user.offer === 3 ? 'selected' : ''} 
              value="3">3</option>
            </select>
            </div>
            <div class="count"> ${
              user.tweetLinks ? user.tweetLinks.length : 0
            } links </div>
            <div class="statusCircle ${
              user.loading ? 'loadingState' : user.active ? 'active' : 'killed'
            }"></div>
            <div class="destroyedBackdrop">
           
            </div>
          </div>
            
          `;
        });
        $$(`.enterLinkCont input`).forEach((input, i) => {
          input.addEventListener('input', e => {
            console.log('change', e.target.value);
            if (e.target.value.length <= 0) {
              _(
                `[data-email="${data['users'][i].email}"] button`
              ).disabled = true;
            } else {
              _(
                `[data-email="${data['users'][i].email}"] button`
              ).disabled = false;
            }
          });
        });

        //select

        $$(`.offerSelect select`).forEach((input, i) => {
          input.addEventListener('change', e => {
            console.log('change', e.target.value);

            console.log(
              _(`[data-select="${data['users'][i].email}"] select`).value
            );
          });
        });

        // start button algorithm
        $$('.start button').forEach((start, i) => {
          start.addEventListener('click', () => {
            let baseLink = _(`[data-input="${data['users'][i].email}"]`).value;
            let offer = _(`[data-select="${data['users'][i].email}"] select`)
              .value;
            // console.log(offer, 'this is the offer from start');
            // return;
            socket.emit('tweetStart', {
              email: data['users'][i].email,
              twitterpassword: data['users'][i].twitterpassword,
              outlookpwd: data['users'][i].outlookpwd,
              phone: data['users'][i].phone,
              baseLink,
              offer
            });
          });
        });

        // stop button algorithm
        // $$('.stop button').forEach((stop, i) => {
        //   stop.addEventListener('click', () => {
        //     let baseLink = _(`[data-input="${data['users'][i].email}"]`).value;
        //     socket.emit('stop', {
        //       email: data['users'][i].email,
        //       twitterpassword: data['users'][i].twitterpassword,
        //       outlookpwd: data['users'][i].outlookpwd,
        //       phone: data['users'][i].phone,
        //       baseLink
        //     });
        //   });
        // });
      });
    })
    .catch(function(err) {
      console.log('Fetch Error :-S', err);
    });
};
getAllAccounts();
fetchMobSMSBalance();
