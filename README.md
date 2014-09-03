fantasy-bot
===========

Fantasy Football Drafting Program

jQuery and Dust.js driven frontend for mock drafting or Nathan's
autodraft API. Picks the best available player based on estimated
value over replacement player (VORP). Player demand is calculated
using the number of starter slots (flex included) for a position plus
the number of bench slots, all times the number of teams in the
league.

To use
------

Scrape yourself some data, add an entry to configs.js and point a
browser at index.html. Everything runs in your browser.

Code locations
--------------

Bot logic lives in src/

Scrapers to acquire data in the right format live in scrapers/

Configurations (drafts) are set up in configs/configs.js

Python dependencies provided in requirements.txt

Known problems
--------------
   * Overestimates demand for backup DST/K/TE (assumes same as WR/RB/QB when it's clearly not)
   * When drafting bench players, doesn't consider bench's current makeup (seems to draft lots of backup QBs)
   * Value based drafting is vulnerable to projection error...
