#!/usr/bin/python

# Activate the virtual environment so that we have access to all the
# dependencies
activate_this = '/var/www/umichdps/env/bin/activate_this.py'
execfile(activate_this, dict(__file__=activate_this))

import sys
import imp

# Make our modules first on the list when requested
sys.path.insert(0,"/var/www/umichdps")

# Since we have a folder called dps, we have to manually load the file
dps = imp.load_source('dps-file', '/var/www/umichdps/dps.py')

# mod_wsgi needs a variable called application that can be called
application = dps.app

