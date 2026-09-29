# My Portfolio Site

My personal site: [anthonybrunelle.com](https://anthonybrunelle.com/)

The site is plain HTML, CSS and JavaScript. No framework, no build step, no dependencies besides two Google Fonts.

## What's in it

- **Terminal.** A working command line in the page. Type `help` to see the commands. It has command history (↑/↓) and tab completion with a gray preview of the suggested command.
- **Subnet calculator.** Run `subnet 192.168.10.0/26` in the terminal and it prints the network address, netmask, wildcard, broadcast, host range and number of usable hosts. It's done with bitwise operations on 32-bit integers, and handles the /31 and /32 edge cases.
- **Network animation.** The header background is a `<canvas>` of drifting nodes that connect when they're close, with packets moving along the links.
- **Light and dark themes.** The choice is saved in `localStorage`.

There are also a couple of easter eggs.

## Files

```
index.html          page content
styles.css          all styles, including both themes
js/
  core.js           shared values, theme toggle (load first)
  intro.js          preloader, name scramble, typing line
  effects.js        scroll reveals, cursor, card effects, nav highlight
  network.js        header canvas animation
  contact.js        email assembly
  easter-eggs.js    you'll have to find them
  terminal.js       terminal commands and subnet calculator
```

The scripts are classic `<script>` tags loaded in order, so the page also works when opened straight from disk.

## Running it locally

Clone the repo and open `index.html` in a browser.

```
git clone https://github.com/anthonybrunelle/portfolio.git
```
