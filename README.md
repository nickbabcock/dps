# Umich DPS

Let me first apologize for the lengthy requirement list, but it combines, in
my opinion, the best of python and javascript development.

- Clone repository
- Install [nodejs][]. Allows for the javascript build system [Grunt][]
- `npm install -g grunt-cli` allows us to invoke `grunt` just like `make`
- `npm install` to install all the javascript dependencies to build site
- Create python 2.7+ [virtual environment][]. The virtual environment ensures
  that your other python installations aren't effected by this application
- Execute `pip install -r requirements.txt`. All of the python dependencies are
  satisfied.
- If you aren't in possession of the database, ask politely or pay me big
  monie$
- Create file called .database in root application directory with the contents
  being the path to the database.
- Run `python generate-statistics.py | tee .cached-statistics.json | gzip >
  .cached-statistics.json.gz` as this will create a file to send to the client
  when they ask for the statistics. It is too computationally intense to
  calculate on the fly for each request.
- Execute `grunt` to 'compile' the site.
- At this point, you should be able to activate the virtual environment and
  execute `python dps.py`, which will start the local server. Navigate to
  localhost:5000 to see web site.
- In development, ensure that there is a `grunt watch` process running, as this
  will keep all the javascript, python, and markdown in line.

[nodejs]: http://nodejs.org/
[Grunt]: http://gruntjs.com/
[virtual environment]: https://pypi.python.org/pypi/virtualenv
