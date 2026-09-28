// Email is stored reversed in the HTML (data-u / data-d) and assembled here,
// so scrapers reading the raw page don't find the address.
(function email() {
  const link = document.getElementById("emailLink");
  const rev = (s) => [...s].reverse().join("");
  const addr = rev(link.dataset.u) + "@" + rev(link.dataset.d);
  link.href = "mailto:" + addr;
  link.querySelector("span").textContent = addr;
})();
