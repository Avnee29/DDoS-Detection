-- Seed sample data for DDoS Attack Detection System
-- This provides realistic test data for development and demonstration

-- Insert sample threat intelligence data
INSERT INTO threat_intelligence (ip_address, threat_type, reputation_score, country_code, organization, source, confidence_level) VALUES
('192.168.1.100', 'Botnet', 95, 'CN', 'Unknown ISP', 'ThreatFeed-API', 0.95),
('10.0.0.50', 'Malware C&C', 88, 'RU', 'Suspicious Hosting', 'ThreatFeed-API', 0.88),
('172.16.0.25', 'DDoS Source', 92, 'KP', 'State Actor', 'ThreatFeed-API', 0.92),
('203.0.113.15', 'Scanning', 75, 'US', 'Compromised Server', 'ThreatFeed-API', 0.75),
('198.51.100.30', 'Brute Force', 82, 'BR', 'Residential ISP', 'ThreatFeed-API', 0.82);

-- Insert sample network traffic data (simulating normal and suspicious traffic)
INSERT INTO network_traffic (source_ip, destination_ip, source_port, destination_port, protocol, packet_size, request_rate, bytes_transferred, is_suspicious, threat_score) VALUES
-- Normal traffic
('192.168.1.10', '10.0.0.1', 443, 80, 'TCP', 1500, 10.5, 15000, FALSE, 0.1),
('192.168.1.11', '10.0.0.1', 8080, 443, 'TCP', 1200, 8.2, 12000, FALSE, 0.2),
('192.168.1.12', '10.0.0.1', 3389, 22, 'TCP', 800, 5.1, 8000, FALSE, 0.15),

-- Suspicious traffic patterns
('192.168.1.100', '10.0.0.1', 80, 80, 'TCP', 64, 1500.0, 96000, TRUE, 0.95),
('10.0.0.50', '10.0.0.1', 443, 443, 'TCP', 32, 2200.0, 70400, TRUE, 0.88),
('172.16.0.25', '10.0.0.1', 53, 53, 'UDP', 512, 3000.0, 1536000, TRUE, 0.92),

-- More normal traffic
('192.168.1.20', '10.0.0.2', 22, 22, 'TCP', 1400, 12.0, 16800, FALSE, 0.05),
('192.168.1.21', '10.0.0.2', 993, 143, 'TCP', 900, 6.8, 6120, FALSE, 0.08);

-- Insert sample DDoS incidents
INSERT INTO ddos_incidents (attack_type, severity_level, source_ips, target_ip, start_time, peak_traffic_rate, total_requests, blocked_requests, attack_vector, mitigation_status, ml_confidence) VALUES
('Volumetric', 'CRITICAL', ARRAY['192.168.1.100', '10.0.0.50', '172.16.0.25']::INET[], '10.0.0.1', NOW() - INTERVAL '2 hours', 15000.50, 2500000, 2300000, 'UDP Flood', 'MITIGATED', 0.96),
('Application Layer', 'HIGH', ARRAY['203.0.113.15', '198.51.100.30']::INET[], '10.0.0.2', NOW() - INTERVAL '4 hours', 8500.25, 1200000, 1100000, 'HTTP GET Flood', 'RESOLVED', 0.89),
('Protocol', 'MEDIUM', ARRAY['192.168.1.100']::INET[], '10.0.0.3', NOW() - INTERVAL '6 hours', 3200.75, 450000, 400000, 'SYN Flood', 'RESOLVED', 0.82),
('Volumetric', 'HIGH', ARRAY['172.16.0.25', '10.0.0.50']::INET[], '10.0.0.1', NOW() - INTERVAL '1 hour', 12000.00, 1800000, 1650000, 'ICMP Flood', 'ACTIVE', 0.93);

-- Insert sample security logs
INSERT INTO security_logs (log_level, event_type, source_system, message, metadata, ip_address) VALUES
('CRITICAL', 'DDoS_Attack_Detected', 'ML_Engine', 'High-volume traffic detected from multiple sources', '{"attack_type": "volumetric", "confidence": 0.96}', '192.168.1.100'),
('WARN', 'Suspicious_Traffic', 'Traffic_Analyzer', 'Unusual request pattern detected', '{"request_rate": 1500, "threshold": 100}', '10.0.0.50'),
('ERROR', 'Mitigation_Failed', 'Defense_System', 'Failed to block malicious IP', '{"ip": "172.16.0.25", "reason": "rate_limit_exceeded"}', '172.16.0.25'),
('INFO', 'Traffic_Baseline_Updated', 'ML_Engine', 'Normal traffic baseline recalculated', '{"new_baseline": 85.5, "previous": 82.1}', NULL),
('CRITICAL', 'Attack_Escalation', 'Alert_System', 'DDoS attack severity increased to CRITICAL', '{"incident_id": "uuid-placeholder", "new_severity": "CRITICAL"}', '203.0.113.15');

-- Insert sample ML predictions
INSERT INTO ml_predictions (model_name, model_version, input_features, prediction_result, confidence_score, is_anomaly, processing_time_ms) VALUES
('LSTM_Traffic_Analyzer', 'v2.1.0', '{"packet_rate": 1500, "packet_size": 64, "protocol": "TCP", "source_diversity": 0.95}', '{"anomaly_score": 0.96, "attack_type": "volumetric", "severity": "high"}', 0.96, TRUE, 45),
('CNN_Pattern_Detector', 'v1.8.2', '{"request_pattern": [1,1,1,1,1,0,0,1,1,1], "timing_intervals": [0.1,0.1,0.1,0.1,0.1,2.0,2.0,0.1,0.1,0.1]}', '{"pattern_type": "bot_traffic", "confidence": 0.89}', 0.89, TRUE, 32),
('RandomForest_Classifier', 'v3.0.1', '{"features": {"packet_size": 1400, "rate": 12.0, "protocol": "TCP", "port": 443}}', '{"classification": "normal", "probability": 0.92}', 0.92, FALSE, 18),
('SVM_Anomaly_Detector', 'v2.5.0', '{"traffic_volume": 3000, "source_count": 1, "destination_ports": [53], "protocol": "UDP"}', '{"anomaly_type": "dns_amplification", "risk_level": "high"}', 0.93, TRUE, 28);

-- Insert sample alert notifications
INSERT INTO alert_notifications (alert_type, severity, title, description, status) VALUES
('DDoS_Attack', 'CRITICAL', 'Critical DDoS Attack Detected', 'Volumetric attack targeting server 10.0.0.1 with peak traffic of 15,000 req/sec', 'ACTIVE'),
('Suspicious_Traffic', 'HIGH', 'High-Risk Traffic Pattern', 'Application layer attack detected from multiple sources', 'ACKNOWLEDGED'),
('System_Alert', 'MEDIUM', 'ML Model Performance Degraded', 'LSTM model accuracy dropped below threshold', 'RESOLVED'),
('Threat_Intelligence', 'HIGH', 'New Threat Actor Identified', 'Previously unknown botnet C&C server detected', 'ACTIVE'),
('Mitigation_Status', 'LOW', 'DDoS Mitigation Successful', 'Attack successfully mitigated, traffic normalized', 'RESOLVED');
