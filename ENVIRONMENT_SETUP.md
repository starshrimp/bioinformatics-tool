# Environment Setup

This project uses separate environment configurations for development and production.

## Local Development

### Backend

#### Development
```bash
cd backend
./start-dev.sh
```

#### Production
```bash
cd backend
./start-prod.sh
```

#### Manual Setup
If you prefer to set the environment manually:
```bash
cd backend
cp .env.development .env  # or .env.production
python app/main.py
```

### Frontend

#### Development
```bash
cd frontend
./start-dev.sh
```

#### Production Build
```bash
cd frontend
./build-prod.sh
```

#### Manual Setup
```bash
cd frontend
npm run start:dev    # for development
npm run build:prod   # for production build
```

## Docker Deployment

### Building Docker Images

#### Production (for Raspberry Pi)
```bash
./docker-build-prod.sh
```

#### Development
```bash
./docker-build-dev.sh
```

### Running with Docker

#### Production
```bash
docker run -d --name bioinformatics-backend -p 8000:8000 --restart unless-stopped bioinformatics-backend:prod
```

#### Development
```bash
docker run -d --name bioinformatics-backend-dev -p 8000:8000 bioinformatics-backend:dev
```

### Docker Compose (Alternative)
```bash
# Production
docker-compose up -d backend

# Development (includes frontend)
docker-compose --profile dev up -d
```

## Raspberry Pi Deployment

### Automatic Deployment
1. Edit `deploy-to-pi.sh` and set your Raspberry Pi's IP address
2. Run the deployment script:
```bash
./deploy-to-pi.sh
```

### Manual Deployment
1. Build the production image: `./docker-build-prod.sh`
2. Save the image: `docker save bioinformatics-backend:prod | gzip > image.tar.gz`
3. Copy to Pi: `scp image.tar.gz pi@your-pi-ip:/home/pi/`
4. Load on Pi: `docker load < image.tar.gz`
5. Run on Pi: `docker run -d --name bioinformatics-backend -p 8000:8000 --restart unless-stopped bioinformatics-backend:prod`

## Environment Variables

### Backend
- **Development**: Points to localhost:8000, debug enabled
- **Production**: Uses production settings with debug disabled

### Frontend
- **Development**: `REACT_APP_API_URL=http://localhost:8000/`
- **Production**: `REACT_APP_API_URL=https://srmbioai.internet-box.ch/`

## Installation (Local Development Only)

Before running locally, make sure to install dependencies:

### Backend
```bash
cd backend
pip install -r requirements.txt
```

### Frontend
```bash
cd frontend
npm install
```

**Note**: When using Docker, dependencies are installed automatically during the build process.
