#!/bin/sh

locust -f api.py --no-web -c 500 -r 100 --host=http://localhost:5000
