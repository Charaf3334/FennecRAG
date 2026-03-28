FROM python:3.14

WORKDIR /backend

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY model ./model

COPY helper.py .

COPY main.py .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]
