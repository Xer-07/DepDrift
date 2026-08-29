import requests
import numpy  # missing from requirements.txt!

def main():
    print(requests.__version__)
    print(numpy.array([1, 2, 3]))

if __name__ == "__main__":
    main()
