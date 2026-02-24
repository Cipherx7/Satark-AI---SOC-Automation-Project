const { MongoClient } = require("mongodb");

const MONGODB_URI =
    "mongodb+srv://meuser:cyberx123@n8n.pddbvxn.mongodb.net/?appName=n8n";
const MONGODB_DB = "soc";

const SAMPLE_ALERTS = [
    {
        alert_id: "test-002",
        severity: "critical",
        category: "malware_detected",
        confidence: 0.97,
        summary:
            "Ransomware payload detected in /tmp directory via suspicious script execution",
        is_true_positive: true,
        ml_prediction: "MALICIOUS",
        ml_confidence: 0.95,
        mitre_techniques: ["T1059.004", "T1486"],
        recommendations: [
            { action: "Isolate affected host immediately", priority: 1 },
            { action: "Capture memory dump for forensic analysis", priority: 1 },
            { action: "Scan all endpoints for IOCs", priority: 2 },
            { action: "Notify incident response team", priority: 1 },
        ],
    },
    {
        alert_id: "test-006",
        severity: "critical",
        category: "privilege_escalation",
        confidence: 0.94,
        summary:
            "Local privilege escalation exploit detected — CVE-2024-1086 kernel vulnerability",
        is_true_positive: true,
        ml_prediction: "MALICIOUS",
        ml_confidence: 0.96,
        mitre_techniques: ["T1068", "T1548.001"],
        recommendations: [
            { action: "Patch kernel to latest version immediately", priority: 1 },
            { action: "Check for unauthorized root-level processes", priority: 1 },
            { action: "Review sudoers file for changes", priority: 2 },
            { action: "Scan for rootkits", priority: 2 },
        ],
    },
    {
        alert_id: "test-001",
        severity: "high",
        category: "intrusion_attempt",
        confidence: 0.92,
        summary: "SSH brute force attack detected from external IP",
        is_true_positive: true,
        ml_prediction: "BENIGN",
        ml_confidence: 0.89,
        mitre_techniques: ["T1110.001"],
        recommendations: [
            { action: "Block source IP at firewall", priority: 1 },
            { action: "Review SSH logs for compromise indicators", priority: 2 },
            { action: "Enable fail2ban if not configured", priority: 3 },
        ],
    },
    {
        alert_id: "test-005",
        severity: "high",
        category: "data_exfiltration",
        confidence: 0.88,
        summary:
            "Unusual outbound data transfer of 2.3 GB to external IP over DNS tunneling",
        is_true_positive: true,
        ml_prediction: "MALICIOUS",
        ml_confidence: 0.93,
        mitre_techniques: ["T1048.003", "T1071.004"],
        recommendations: [
            { action: "Block destination IP and domain immediately", priority: 1 },
            { action: "Analyze DNS query logs for exfiltrated data", priority: 1 },
            { action: "Audit sensitive file access on host", priority: 2 },
            { action: "Check for persistence mechanisms", priority: 2 },
        ],
    },
    {
        alert_id: "test-003",
        severity: "medium",
        category: "suspicious_login",
        confidence: 0.74,
        summary:
            "Multiple failed login attempts followed by a successful login from unusual location",
        is_true_positive: false,
        ml_prediction: "BENIGN",
        ml_confidence: 0.68,
        mitre_techniques: ["T1078"],
        recommendations: [
            { action: "Verify login with user via out-of-band communication", priority: 2 },
            { action: "Check geolocation of source IP", priority: 2 },
            { action: "Review MFA status on account", priority: 3 },
        ],
    },
    {
        alert_id: "test-007",
        severity: "medium",
        category: "reconnaissance",
        confidence: 0.71,
        summary:
            "Port scan detected from internal host targeting database servers",
        is_true_positive: false,
        ml_prediction: "BENIGN",
        ml_confidence: 0.62,
        mitre_techniques: ["T1046"],
        recommendations: [
            { action: "Verify if scanning was part of authorized pentest", priority: 2 },
            { action: "Check source host for compromise indicators", priority: 2 },
            { action: "Review firewall rules between segments", priority: 3 },
        ],
    },
    {
        alert_id: "test-004",
        severity: "low",
        category: "policy_violation",
        confidence: 0.85,
        summary:
            "User accessed restricted admin panel during non-business hours",
        is_true_positive: true,
        ml_prediction: "BENIGN",
        ml_confidence: 0.91,
        mitre_techniques: ["T1078.003"],
        recommendations: [
            { action: "Review user access permissions", priority: 3 },
            { action: "Verify if activity was authorized", priority: 2 },
        ],
    },
];

async function seed() {
    console.log("🔌 Connecting to MongoDB...");
    const client = new MongoClient(MONGODB_URI, {
        serverSelectionTimeoutMS: 15000,
    });

    try {
        await client.connect();
        console.log("✅ Connected to MongoDB");

        const db = client.db(MONGODB_DB);
        const collection = db.collection("alerts");

        // Clear existing alerts
        const deleteResult = await collection.deleteMany({});
        console.log(`🗑️  Cleared ${deleteResult.deletedCount} existing alerts`);

        // Insert sample alerts
        const insertResult = await collection.insertMany(SAMPLE_ALERTS);
        console.log(
            `✅ Inserted ${insertResult.insertedCount} alerts into '${MONGODB_DB}.alerts'`
        );

        // Verify
        const count = await collection.countDocuments();
        console.log(`📊 Total alerts in collection: ${count}`);
        console.log(
            "\n🎉 Seed complete! Your dashboard will now show real data from MongoDB."
        );
    } catch (error) {
        console.error("❌ Error:", error.message || error);
    } finally {
        await client.close();
        console.log("🔌 Connection closed");
    }
}

seed();
