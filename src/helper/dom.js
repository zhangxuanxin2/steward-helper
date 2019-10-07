import $ from 'jquery'
import keyboardJS from 'keyboardjs'
import axios from 'axios'

let isSetup, stop;

const outlineCls = 'ext-hp-ms-over';
const startOutlineEvt = 'ext-hp-startoutline';
const stopOutlineEvt = 'ext-hp-clearoutline';

function insertCss() {
    const css = document.createElement("style");

    css.type = "text/css";
    css.innerHTML = `.${outlineCls} {outline: 2px dotted #ccc}`;
    document.body.appendChild(css);
}

function start() {
    function listenMouseout(event) {
        $(event.target).removeClass(outlineCls);
    }
    $(document).on('mouseout', listenMouseout);

    function listenMouseover(event) {
        $(event.target).addClass(outlineCls);
    }

    $(document).on('mouseover', listenMouseover);

    function stop() {
        $(document).off('mouseover', listenMouseover);
        $(document).off('mouseout', listenMouseout);
    }

    return stop;
}

function clear() {
    $(`.${outlineCls}`).removeClass(outlineCls);
}

let outlinedCallback
function startOutline(callback) {
    outlinedCallback = callback
    stop && stop();
    stop = start();
}

function stopOutline() {
    outlinedCallback = null
    stop && stop();
    clear();
}

function setup() {
    if (!isSetup) {
      insertCss();

      $(document).on(startOutlineEvt, startOutline);
      $(document).on(stopOutlineEvt, stopOutline);
  
      $(document).on('click', function(event) {
          if ($(event.target).hasClass(outlineCls)) {
              event.stopPropagation();
              event.preventDefault();
              if (outlinedCallback) {
                  outlinedCallback(event.target);
                  stopOutline();
              } else {
                  stop && stop();
              }
  
              return false;
          }
      });
  
      console.log('extension helper inited');
      isSetup = true
    }
}

function getOutlinedElem() {
    return $(`.${outlineCls}`).get(0);
}

let actionCache = {
  $elem: null,
  subActions: null
};

function resetActionCache() {
  actionCache = {
      $elem: null,
      subActions: null
  };
}

export function readMode() {
  setup()
  startOutline(elem => {
    const $elem = $(elem)

    actionCache.$elem = $elem;
    hideSiblings($elem);

    elem.scrollIntoView();
  })
}

function hideSiblings($el) {
  if ($el && $el.length) {
      $el.siblings().not('#steward-main,#wordcard-main').css({
          visibility: 'hidden',
          opacity: 0
      }).addClass('s-a-rm-hn');
      hideSiblings($el.parent())
  } else {
      console.log('Enter reading mode');
      keyboardJS.bind('esc', function showNode() {
          $('.s-a-rm-hn').css({
              visibility: 'visible',
              opacity: 1
          }).removeClass('s-a-rm-hn');
          console.log('Exit reading mode');
          execSubActions(actionCache.$elem, actionCache.subActions, 'leave');
          resetActionCache();
          keyboardJS.unbind('esc', showNode);
      });
  }
}

export function highlightEnglishSyntax() {
  setup()
  startOutline(elem => {
    const $elem = $(elem)
    const text = $elem[0].innerText;

    if (text) {
      notifyBackground({
        data: {
          text
        },
        action: 'others.highlightEnglishSyntax'
      }, resp => {
        if (resp.data) {
          $elem.html(resp.data);
        }
      })
    }
  })
}

function notifyBackground(msg, callback) {
  chrome.runtime.sendMessage(msg, resp => {
    callback(resp)
  });
}