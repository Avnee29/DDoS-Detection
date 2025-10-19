DDoS Attack Detection System

A real-time DDoS attack detection system designed for enterprise-grade banking security. This system leverages multiple machine learning models and live network monitoring to identify, score, and mitigate malicious traffic efficiently.

Features

ML-Powered Detection Engine: Combines LSTM, CNN, Random Forest, and SVM models for high-accuracy threat classification.

Live Network Monitoring: Continuous packet capture, anomaly scoring, and traffic heatmaps.

Threat Intelligence Integration: Uses public API feeds and geolocation mapping for context-aware alerts.

Real-Time Alerts: Automated responses via Email, SMS, and Slack.

Interactive Dashboard: Visual analytics for attack vectors, bandwidth spikes, and regional threat origins.

Tech Stack

Frontend: Next.js

Backend: Supabase

Machine Learning: Python (LSTM, CNN, Random Forest, SVM)

Real-Time Data: WebSockets

Visualization: Chart.js

APIs: REST API integration

Setup Instructions

Clone the repository

git clone https://github.com/Avnee29/DDoS-Detection.git
cd DDoS-Detection


Install dependencies
Follow instructions for your frontend/backend environment (Next.js & Supabase setup).

Run the application

# Backend
npm run dev

# Frontend
npm run dev


Access the dashboard in your browser at http://localhost:3000.

Description

This system processes thousands of packets per second, automatically detects malicious traffic, and triggers immediate mitigation. It is designed to provide robust protection against modern DDoS threats while offering detailed visual insights for network administrators.

License

This project is licensed under the MIT License.
