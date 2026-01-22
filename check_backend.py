import urllib.request
import urllib.error

try:
    print("Attempting to connect to http://localhost:15003/requests/ ...")
    req = urllib.request.Request("http://localhost:15003/requests/")
    with urllib.request.urlopen(req) as response:
        print(f"Status Code: {response.getcode()}")
        print(f"Headers: {response.info()}")
        if response.getcode() == 200:
            print("Success! Backend is reachable.")
        else:
            print("Backend returned an error code.")
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code} {e.reason}")
except urllib.error.URLError as e:
    print(f"Failed to connect: {e.reason}")
except Exception as e:
    print(f"Error: {e}")
