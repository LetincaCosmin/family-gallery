export function cldThumb(url, size = 480) {
  // injectează transformarea /upload/ -> /upload/w_480,c_fill,q_auto,f_auto/
  return url.replace("/upload/", `/upload/w_${size},c_fill,q_auto,f_auto/`);
}

export function cldFull(url) {
  return url.replace("/upload/", "/upload/q_auto,f_auto/");
}
