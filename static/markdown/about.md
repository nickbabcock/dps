# About

## Data Collection

There is no University of Michigan DPS API, so instead all data was scraped
from [police.umich.edu][] and stored in a database. To a computer an address
isn't in its most useful form, so using Google's Geocoding API, all address
were converted to latitude and longitude. Unfortunately, one quickly learns
that there are often mistakes in the original data. For instance, all
incidents reported at the Big House are said to have address 1201 Main, not
1201 S Main. This is a small but critical difference because due to the
ambiguity, Google's Geocoding API returns the latitude and longitude for 1201
N Main. So now, unfortunately, there is a poor home next to M-14 that has
many incidents of fradulent IDs. Another mistake in the data are spelling
mistakes, which will throw off calculations in unpredictable ways (mispelling
addresses results in wrong latitude and longitude, mispelling incident types
means a new kind of incident). This is why all official queries into police
reports should be directed towards the offices of police department at the
University.

## Code

All code has been open sourced to [Github][], so feel free to raise issues or
suggest features that are wanted. Or, even better, address the issues yourself
and they'll be incoporated into the site.

While all the code for obtaining the data is open sourced and is trivial to
replicate, the data itself is not open sourced for several reasons. There is
no good way to open source a data set, and it allows the site to retain a
piece of intellectual property until another entity replicates it.

## Contributors

- [Nicholas (Nick) Babcock][nbsoftsolutions]

[police.umich.edu]: http://police.umich.edu/?s=crime_log
[Github]: https://github.com/nickbabcock/dps
[nbsoftsolutions]: http://www.nbsoftsolutions.com
