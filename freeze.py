import sys
import os
from jinja2 import Environment, FileSystemLoader

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
