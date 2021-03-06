import Base, { ExecOptions } from './base'
import { BUILDIN_ACTIONS } from '../common/const';
import { NOTICE_TARGET } from '../common/enum';
import $ = require('jquery');

export default class HighlightEnglishSyntax extends Base {
  name = BUILDIN_ACTIONS.HIGHLIGHT_ENGLISH_SYNTAX;
  
  exec(elem, options?: ExecOptions) {
    const $elem = $(elem);

    if ($elem.length) {
      const text = $elem[0].innerText;
      if (text) {
        this.helper.invoke(BUILDIN_ACTIONS.HIGHLIGHT_ENGLISH_SYNTAX, {
          text
        }, resp => {
          if (resp) {
            $elem.html(resp);
          }
        }, NOTICE_TARGET.IFRAME);
      }

      return true
    } else {
      return false
    }
  }
}