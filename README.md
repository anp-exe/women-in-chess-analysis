# fide-rating_analysisV2

## Python interpreter / notebook setup

This project is a Jupyter notebook pipeline and needs a Python 3 interpreter with the notebook dependencies installed.

Recommended setup:

1. Create or select a Python 3.10+ virtual environment in PyCharm.
2. Install the project dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Open `fide.ipynb` and select that interpreter/kernel for the notebook.

Required packages:

- `requests`
- `pyarrow`
- `pandas`
- `ipykernel`

If you are using PyCharm, the project already inherits an SDK in `.idea/fide-rating_analysisV2.iml`; you only need to point it at a valid Python interpreter.
