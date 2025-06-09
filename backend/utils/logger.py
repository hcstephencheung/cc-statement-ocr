import logging
import os
import sys

def setup_logger():
    logger = logging.getLogger()  # root logger
    logger.setLevel(logging.INFO)

    # Remove any existing handlers
    if logger.hasHandlers():
        logger.handlers.clear()

    env = os.getenv("ENV", "development")  # Default to 'development' if ENV is not set

    if env == "production":
        import google.cloud.logging
        from google.cloud.logging.handlers import CloudLoggingHandler
        # GCP Cloud Logging setup
        client = google.cloud.logging.Client()
        handler = CloudLoggingHandler(client)
        logger.addHandler(handler)
    else:
        # Local stdout setup
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter('%(message)s')  # mimic print()
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger
