# Coin Prediction App

This repository contains the full-stack code for a coin prediction application. The backend is built with Python and FastAPI, and the frontend is a React application using Vite.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed:
- Python 3.x
- Node.js and npm

### Backend Setup

The backend server is built with Python and FastAPI. Follow these steps to set it up:

1. **Install Python Libraries**: First, install the necessary Python libraries. You can use the following command:

   ```bash
   pip install fastapi uvicorn keras joblib numpy
   ```

2. **Run the Backend Server**: Navigate to the backend directory and start the FastAPI server:

   ```bash
   python -m uvicorn main:app --reload
   ```

   The `--reload` flag is for development purposes and enables hot reloading.

### Frontend Setup

The frontend is developed with React and Vite. To set it up, follow these steps:

1. **Navigate to the Frontend Directory**:

   ```bash
   cd coin-prediction
   ```

2. **Install Node Dependencies**: Install all the necessary npm packages:

   ```bash
   npm install
   ```

3. **Start the Development Server**:

   ```bash
   npm run dev
   ```

   This command will boot up the React development server.

## Usage

After setting up both the backend and frontend, the web application will be accessible in your browser. By default:

- The frontend runs at `http://localhost:5173`.
- The backend server is accessible at `http://127.0.0.1:8000`.

Explore the functionalities offered by the application in development mode.

## Contributing

Contributions are what make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the [MIT License](LICENSE.md).


