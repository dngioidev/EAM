FROM python:3.12-slim

RUN pip install --no-cache-dir sqlite-web

EXPOSE 8080

# -H / -p : bind address and port
# -r      : read-only (wiki.db is the source of truth — no writes from this UI)
ENTRYPOINT ["sqlite_web", "-H", "0.0.0.0", "-p", "8080", "-r"]
CMD ["/data/wiki.db"]
