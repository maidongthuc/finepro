FROM ubuntu:latest

# Set working directory
WORKDIR /app

# Install Python and dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    git

# Create virtual environment
RUN python3 -m venv venv

# Upgrade pip inside venv and install dependencies
COPY requirements.txt .
RUN . venv/bin/activate && pip install --upgrade pip && pip install -r requirements.txt

# Copy remaining project files
COPY main.py .
COPY src/ ./src/
COPY README.md .
COPY .env .

EXPOSE 8888

# Activate virtualenv and run app
CMD ["/bin/bash", "-c", ". venv/bin/activate && python main.py"]
