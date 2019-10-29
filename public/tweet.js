// Make connection

// let socket = io.connect('http://localhost:1000');
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

const downloadCsv = async () => {
  try {
    const response = await fetch(`http://167.99.124.182:9808/download`, {
      method: 'GET'
      // credentials: 'include'
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
  // doc();

  // let csvData = document
  //   .querySelector(`#consoleBody`)
  //   .getAttribute('data-csvString');
  // const blob = new Blob([csvData], { type: 'text/csv' });

  // const url = window.URL.createObjectURL(blob);
  // const a = document.createElement('a');
  // const date = new Date();
  // a.setAttribute('hidden', url);
  // a.setAttribute('href', url);
  // a.setAttribute('download', `download${date.getMilliseconds()}.csv`);
  // document.body.appendChild(a);
  // a.click();
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
