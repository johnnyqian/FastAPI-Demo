# FastAPI learning

Learning code for [FastAPI Foundations](https://github.com/codesensei-courses/fastapi_foundations) course.

Create the conda environment:

```bash
conda env create -f environment.yml
```

Activate the environment:

```bash
conda activate fastapi
```

Run the project:

```bash
python -m fastapi dev main.py
```

Run tests:

```bash
python -m pytest
```

Run the CORS demo:

```bash
python -m http.server 8080 -d ./cors_demo
```

Or use `Ctrl + Shift + B` to run the task in VSCode.
