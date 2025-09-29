-- DDoS Attack Detection System Database Schema
-- Creates tables for network traffic monitoring, attack detection, and security logs

-- Network traffic monitoring table
CREATE TABLE IF NOT EXISTS network_traffic (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    source_ip INET NOT NULL,
    destination_ip INET NOT NULL,
    source_port INTEGER,
    destination_port INTEGER,
    protocol VARCHAR(10) NOT NULL,
    packet_size INTEGER NOT NULL,
    flags VARCHAR(20),
    request_rate DECIMAL(10,2),
    bytes_transferred BIGINT DEFAULT 0,
    is_suspicious BOOLEAN DEFAULT FALSE,
    threat_score DECIMAL(5,2) DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DDoS attack incidents table
CREATE TABLE IF NOT EXISTS ddos_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attack_type VARCHAR(50) NOT NULL,
    severity_level VARCHAR(20) NOT NULL CHECK (severity_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    source_ips INET[] NOT NULL,
    target_ip INET NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    peak_traffic_rate DECIMAL(15,2),
    total_requests BIGINT DEFAULT 0,
    blocked_requests BIGINT DEFAULT 0,
    attack_vector VARCHAR(100),
    mitigation_status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (mitigation_status IN ('ACTIVE', 'MITIGATED', 'RESOLVED')),
    ml_confidence DECIMAL(5,2) DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security logs table
CREATE TABLE IF NOT EXISTS security_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_level VARCHAR(10) NOT NULL CHECK (log_level IN ('INFO', 'WARN', 'ERROR', 'CRITICAL')),
    event_type VARCHAR(50) NOT NULL,
    source_system VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    processed BOOLEAN DEFAULT FALSE
);

-- Threat intelligence table
CREATE TABLE IF NOT EXISTS threat_intelligence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address INET NOT NULL UNIQUE,
    threat_type VARCHAR(50) NOT NULL,
    reputation_score INTEGER CHECK (reputation_score >= 0 AND reputation_score <= 100),
    country_code VARCHAR(2),
    organization VARCHAR(200),
    last_seen TIMESTAMPTZ,
    first_seen TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    source VARCHAR(100) NOT NULL,
    confidence_level DECIMAL(5,2) DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ML model predictions table
CREATE TABLE IF NOT EXISTS ml_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name VARCHAR(50) NOT NULL,
    model_version VARCHAR(20) NOT NULL,
    input_features JSONB NOT NULL,
    prediction_result JSONB NOT NULL,
    confidence_score DECIMAL(5,2) NOT NULL,
    is_anomaly BOOLEAN NOT NULL,
    processing_time_ms INTEGER,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Alert notifications table
CREATE TABLE IF NOT EXISTS alert_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    incident_id UUID REFERENCES ddos_incidents(id),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED')),
    acknowledged_by VARCHAR(100),
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_network_traffic_timestamp ON network_traffic(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_network_traffic_source_ip ON network_traffic(source_ip);
CREATE INDEX IF NOT EXISTS idx_network_traffic_suspicious ON network_traffic(is_suspicious, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ddos_incidents_severity ON ddos_incidents(severity_level, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_ddos_incidents_status ON ddos_incidents(mitigation_status, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON security_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_level ON security_logs(log_level, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_ip ON threat_intelligence(ip_address);
CREATE INDEX IF NOT EXISTS idx_threat_intelligence_active ON threat_intelligence(is_active, reputation_score DESC);
CREATE INDEX IF NOT EXISTS idx_ml_predictions_timestamp ON ml_predictions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alert_notifications_status ON alert_notifications(status, severity, created_at DESC);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE network_traffic ENABLE ROW LEVEL SECURITY;
ALTER TABLE ddos_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing all operations for authenticated users - adjust as needed)
CREATE POLICY "Allow authenticated users full access to network_traffic" ON network_traffic
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to ddos_incidents" ON ddos_incidents
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to security_logs" ON security_logs
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to threat_intelligence" ON threat_intelligence
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to ml_predictions" ON ml_predictions
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users full access to alert_notifications" ON alert_notifications
    FOR ALL USING (auth.role() = 'authenticated');
