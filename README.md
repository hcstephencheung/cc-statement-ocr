# OCR project

# Huggingface space
Check out the configuration reference at https://huggingface.co/docs/hub/spaces-config-reference

Original prototype: https://huggingface.co/spaces/hcstephencheung/ocr-test

# To run
The project is built with docker-compose, so you can run docker-compose up and it should build and run.
Then you can navigate to http://localhost:3000/ to run the app.

You can use this image as an example:
https://storage.googleapis.com/hcstephencheung-stuff/Screenshot%202025-05-18%20at%203.14.38%E2%80%AFPM.png

# Backend
Python project, served on port 9000.

# Frontend
React+Vite project, served on port 3000, proxied `/api` routes to backend by Vite to avoid CORS.
