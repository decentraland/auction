import json
import random

from locust import HttpLocust, TaskSet, task

MIN_PARCELS = 64
MAX_PARCELS = 1000
MIN_BOUND = -250
MAX_BOUND = 250

def to_string_coord(e):
    return ','.join(map(str, e))

def gen_coordinates():
    parcels_count = random.choice(range(MIN_PARCELS, MAX_PARCELS))
    L = int(parcels_count ** (0.5))

    X_start = random.choice(range(MIN_BOUND + L, MAX_BOUND - L))
    Y_start = random.choice(range(MIN_BOUND + L, MAX_BOUND - L))

    X = range(X_start, X_start + L)
    Y = range(Y_start, Y_start + L)

    Z = zip(X, Y)
    return map(to_string_coord, Z)

class APIUserBehavior(TaskSet):
    @task(1)
    def get_parcel_states(self):
        payload = {
            'coordinates': gen_coordinates()
        }
        headers = {'content-type': 'application/json;charset=UTF-8'}
        self.client.post('/api/parcelState/group', data=json.dumps(payload), headers=headers)
    
class APIUser(HttpLocust):
    task_set = APIUserBehavior

