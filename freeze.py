import sys
import os
from jinja2 import Environment, FileSystemLoader

# The purpose of this program is to render the html templates into plain html
# files to deploy on the production site. These have a few benefits. Serving an
# html file to the client allows the client to cache the file. On the first
# response, serving a file is faster than rendering multiple templates.

def freeze(inFile, outFile):
    env = Environment(loader=FileSystemLoader('templates'))

    # In the templates there is a url_for, which is a flask functionality, so
    # we spoof it here
    url = lambda x, **kwargs: '/' + x + '/' + kwargs['filename']
    contents = env.get_template(inFile).render(url_for=url)
    with open(outFile, 'w') as f:
        f.write(contents)

if __name__ == '__main__':
    files = sys.argv[1:] 
    if not os.path.exists(os.path.join('bin', 'templates')):
        os.makedirs(os.path.join('bin', 'templates'))

    for f in files:
        freeze(f, os.path.join('bin', 'templates', f))
        print 'froze: ', f
