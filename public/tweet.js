// Make connection

// let socket = io.connect('http://localhost:1900');
let socket = io.connect('http://167.99.124.182:1900');

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
// adding service handler
addMoreServices.addEventListener('click', addAndRemoveService);

// emit event to back end on tweet button click

// add tweetbutton click even listener
tweetBtn.addEventListener('click', () => {
  queryStringAndSendHandler(affiliatLinkInput.value, socket);
});

// Listen To Tweet  Events

socket.on('tweet', data => {
  console.log(data);
  const startDate = new Date();
  consoleHeader.innerHTML = ` <p
  class="startTweet"
  style="text-align: center; font-size: 24px; font-weight: 100; color: rgb(40, 165, 207)"
>
 Tweet Generation Started
 
</p>
<p

<p class="processing" style="text-align: center; font-size: 24px; font-weight: 100; color: #bbb"> Processing...</p>
`;
});
let numOfLinksCounter = 0;

socket.on('tweetLinks', data => {
  numOfLinksCounter++;
  numberOfLinks.innerText = numOfLinksCounter;
  console.log(data.tweetLink);
  $(`#consoleBody`).append(`
  <p
  style="text-align: center; font-size: 20px; font-weight: 100; color: rgb(40, 165, 207)"
>
 ${data.tweetLink}
 
</p>
  `);
  document
    .querySelector(`#consoleBody`)
    .setAttribute('data-csvString', data.csvData);
  console.log(data.csvData);
});

socket.on('tweetEnd', data => {
  // console.log(Link);
  _(
    `.startTweet`
  ).innerHTML = `Tweet Generation Finished! :). Completed in ${data.timeElapsed}s`;
  _(`.processing`).innerHTML = '';
});

const deleteCSV = () => {
  // let date = new Date();
  socket.emit('delete', 'delete');
};
const terminateProcess = () => {
  // let date = new Date();
  // socket.emit('delete', 'delete');
  socket.emit('kill', 1);
  alert('Process Ended');
  $(`#consoleBody`).html(
    `<h2 style="text-align: center; color: purple">poopey!!! it's all gone</h2>`
  );
};

const downloadCsv = async () => {
  try {
    const response = await fetch(`http://167.99.124.182:9808/download`, {
      method: 'GET'
    });
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

let numOfInstanceCounter = 0;
socket.on('seenTweetButton', data => {
  numOfInstanceCounter++;
  numberOfInstances.innerText = numOfInstanceCounter;
});
socket.on('instanceError', data => {
  numOfInstanceCounter--;
  numberOfInstances.innerText = numOfInstanceCounter;
});

socket.on('delete', data => {
  alert(`${data} is deleted`);
});
socket.on('deleteError', data => {
  alert(`${data}`);
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

// (async () => {
//   fetch(`http://167.99.124.182:9808/getVerifiedAccounts`)
//     .then(function(response) {
//       if (response.status !== 200) {
//         console.log(
//           'Looks like there was a problem. Status Code: ' + response.status
//         );
//         return;
//       }

//       // Examine the text in the response
//       response.json().then(function(data) {
//         console.log(data);
//         if (_('.vCont')) {
//           _('.vCont').innerHTML(JSON.stringify(data));
//         }
//       });
//     })
//     .catch(function(err) {
//       console.log('Fetch Error :-S', err);
//     });
// })();
