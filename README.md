# Umich DPS

Let me first apologize for the lengthy requirement list, but it combines, in
my opinion, the best of python and javascript development.

- Clone repository
- Create python 2.7+ virtual environment. The virtual environment ensures that
  your other python installations aren't effected by this application
- Execute `pip install -r requirements.txt`. All of the python dependencies
  are satisfied.
- Make sure nodejs and NPM are installed and execute `npm install`. All of the
  javascript dependencies are satisfied.
- Create file called .database in root application directory with the contents
  being the path to the database.
- At this point, you should be able to activate the virtual environment and
  execute `python dps.py`, which will start the local server. Navigate to
  localhost:5000 to see web site.
- In development, ensure that there is a `grunt watch` process running, as
  this will keep all the javascript, python, and markdown in line.
