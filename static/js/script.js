/**
 * Setup
 */

let request = new XMLHttpRequest();

request.onload = () => {
  if (request.status === 200) {
    const json = request.response;
    document.getElementById("balance").innerHTML = json["balance"];
  }
};

request.responseType = "json";
request.open("GET", "/balanceValue/935457932", true);
request.setRequestHeader("Accept", "application/json");
request.send();

function inPost(value) {
  postReq("935457932", Number(value));
}

function postReq(userId, value) {
  let body = [userId, value];
  let secondRequest = new XMLHttpRequest();
  secondRequest.open("POST", "/editValue", true);
  secondRequest.setRequestHeader("Content-type", "application/json");
  secondRequest.send(JSON.stringify(body));
}

const debugEl = document.getElementById('debug'),
  // Mapping of indexes to icons: start from banana in middle of initial position and then upwards
  iconMap = ["banana", "seven", "cherry", "plum", "orange", "bell", "bar", "lemon", "melon"],
  // Width of the icons
  icon_width = 79,
  // Height of one icon in the strip
  icon_height = 79,
  // Number of icons in the strip
  num_icons = 9,
  // Max-speed in ms for animating one icon down
  time_per_icon = 100,
  // Holds icon indexes
  indexes = [0, 0, 0];

let leverBall = document.querySelector('#lever-ball');
let leverBar = document.querySelector('#lever-bar');

let root = document.querySelector(':root');

/**
 * Roll one reel
 */
const roll = (reel, offset = 0) => {
  // Minimum of 2 + the reel offset rounds
  const delta = (offset + 2) * num_icons + Math.round(Math.random() * num_icons);

  // Return promise so we can wait for all reels to finish
  return new Promise((resolve, reject) => {
    const style = getComputedStyle(reel),
      // Current background position
      backgroundPositionY = parseFloat(style["background-position-y"]),
      // Target background position
      targetBackgroundPositionY = backgroundPositionY + delta * icon_height,
      // Normalized background position, for reset
      normTargetBackgroundPositionY = targetBackgroundPositionY % (num_icons * icon_height);

    // Delay animation with timeout, for some reason a delay in the animation property causes stutter
    setTimeout(() => {
      // Set transition properties ==> https://cubic-bezier.com/#.41,-0.01,.63,1.09
      reel.style.transition = `background-position-y ${(8 + 1 * delta) * time_per_icon}ms cubic-bezier(.41,-0.01,.63,1.09)`;
      // Set background position
      reel.style.backgroundPositionY = `${backgroundPositionY + delta * icon_height}px`;
    }, offset * 150);

    // After animation
    setTimeout(() => {
      // Reset position, so that it doesn't get higher without limit
      reel.style.transition = `none`;
      reel.style.backgroundPositionY = `${normTargetBackgroundPositionY}px`;
      // Resolve this promise
      resolve(delta % num_icons);
    }, (8 + 1 * delta) * time_per_icon + offset * 150);
  });
};

/**
 * Roll all reels, when promise resolves roll again
 */
let isAnimationInProgress = false;

function handleAnimationEnd() {
  // Разблокировать анимацию слотов
  isAnimationInProgress = false;

  // Убрать классы анимации рычага
  leverBall.classList.remove('downBall');
  leverBar.classList.remove('downBar');

  // Удалить обработчик события, чтобы избежать многократного выполнения
  document.querySelector(".slots").removeEventListener('transitionend', handleAnimationEnd);
}

function rollAll() {
  debugEl.textContent = 'rolling...';
  const reelsList = document.querySelectorAll('.slots > .reel');

  // Сброс значений indexes перед новым запуском анимации
  indexes.fill(0);

  Promise.all([...reelsList].map((reel, i) => roll(reel, i)))
    .then(deltas => {
      // add up indexes
      deltas.forEach((delta, i) => indexes[i] = (indexes[i] + delta) % num_icons);
      debugEl.textContent = indexes.map(i => iconMap[i]).join(' - ');

      // Win conditions
      if (indexes[0] === indexes[1] || indexes[1] === indexes[2]) {
        const winCls = indexes[0] === indexes[2] ? "win2" : "win1";
        document.querySelector(".slots").classList.add(winCls);

        // Добавить обработчик события transitionend
        document.querySelector(".slots").addEventListener('transitionend', handleAnimationEnd);

        setTimeout(() => {
          document.querySelector(".slots").classList.remove(winCls);
          // Again!
          rollAll();
        }, 2000);
      } else {
        // Again!
        handleAnimationEnd();
      }
    });


  leverBall.addEventListener('click', function () {
  // Если анимация уже выполняется, не обрабатывать клик
  if (isAnimationInProgress) {
    return;
  }

  // Блокировать анимацию слотов
  isAnimationInProgress = true;

  // Запустить анимацию рычага
  leverBall.classList.add('downBall');
  leverBar.classList.add('downBar');

  // Запустить анимацию слотов и после ее завершения разблокировать
  rollAll();
});
}