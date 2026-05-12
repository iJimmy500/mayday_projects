/**
 * fetchITunesJSONP
 * Makes a JSONP request to the iTunes Search API.
 * Used to bypass CORS restrictions in the browser.
 */
export const fetchITunesJSONP = (url) => {
  return new Promise((resolve, reject) => {
    const callbackName = 'itunes_callback_' + Math.round(100000 * Math.random());
    window[callbackName] = (data) => {
      delete window[callbackName];
      document.body.removeChild(script);
      resolve({ data });
    };

    const script = document.createElement('script');
    script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
    script.onerror = (err) => {
      delete window[callbackName];
      document.body.removeChild(script);
      reject(err);
    };
    document.body.appendChild(script);
  });
};
