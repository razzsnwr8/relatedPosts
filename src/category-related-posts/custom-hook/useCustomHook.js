import { __ } from '@wordpress/i18n';

export function ExtractTextFromHTML(html){
  const div = document.createElement('div');
  div.innerHTML = html;
  let text = div.innerText;
  if(text.length > 0){
    text = text.slice(0, 150) + '...'
  }
  return text;
}