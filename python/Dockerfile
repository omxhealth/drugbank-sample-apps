FROM python:latest

WORKDIR /usr/src/app

COPY ./python/requirements.txt ./
RUN pip install -r requirements.txt

COPY ./python/app.py ./
COPY ./resources /usr/src/resources/

EXPOSE 8080
ENV FLASK_APP=app.py

ENTRYPOINT ["flask"]
CMD ["run", "--host", "0.0.0.0", "--port", "8080"]