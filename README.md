# AI-Powered SOC Automation with Wazuh & N8N 🛡️

A comprehensive Security Operations Center (SOC) automation platform that integrates Wazuh SIEM with N8N workflow automation and AI-powered log analysis, enabling real-time threat detection, intelligent log summarization, and human-in-the-loop incident response.

## 🚀 Features

### Core Functionality
- **Real-time Log Monitoring**: Continuous collection and forwarding of security logs from Wazuh agents
- **AI-Powered Log Analysis**: Intelligent summarization and knowledge extraction from raw security logs
- **N8N Workflow Automation**: Automated processing pipeline for log enrichment and alert generation
- **Human-in-the-Loop**: SOC analyst notification and review system for critical security events
- **Webhook Integration**: Seamless real-time data pipeline between Wazuh and N8N via webhooks

### Security Intelligence
- **Threat Summarization**: AI-driven extraction of actionable insights from raw log data
- **Incident Classification**: Automated categorization of security events by severity and type
- **Contextual Analysis**: Deep-dive into log events to provide SOC analysts with relevant context
- **Priority-based Alerting**: Identification and escalation of high-priority incidents

### SOC Analyst Experience
- **Actionable Insights**: Clear, summarized security intelligence instead of raw log noise
- **Real-time Notifications**: Instant alerts for critical security events
- **Incident Dashboard** *(Planned)*: Visual overview of high-priority logs and active incidents
- **Event Correlation**: Contextual linking of related security events for faster investigation

## 🏗️ Architecture & Data Flow

### Technology Stack
```
SIEM Platform:       Wazuh (Agent + Manager + Indexer + Dashboard)
Cloud Infrastructure: Microsoft Azure (Ubuntu VMs)
Networking:          Azure Virtual Network (Single Subnet)
Automation:          N8N Workflow Engine
Integration:         Python (Webhook Relay Script)
AI Processing:       AI-powered Log Summarization (via N8N)
```

### Infrastructure Overview
```
┌──────────────────────────────────────────────────────────────────┐
│                    Azure Virtual Network                         │
│                      (Single Subnet)                             │
│                                                                  │
│  ┌─────────────────────┐       ┌─────────────────────────────┐  │
│  │     VM 1            │       │         VM 2                │  │
│  │  ┌───────────────┐  │       │  ┌───────────────────────┐  │  │
│  │  │  Wazuh Agent  │──┼──────▶│  │   Wazuh Manager      │  │  │
│  │  │  (Log Source)  │  │ Logs  │  │   Wazuh Indexer      │  │  │
│  │  └───────────────┘  │       │  │   Wazuh Dashboard    │  │  │
│  └─────────────────────┘       │  └───────────────────────┘  │  │
│                                └─────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Wazuh Agent   │───▶│   Wazuh Manager  │───▶│  Python Script  │
│   (VM 1)        │    │   (VM 2)         │    │  (Webhook Relay)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌──────────────────┐
                                               │   N8N Workflow   │
                                               │   (Webhook)      │
                                               └──────────────────┘
                                                        │
                                                        ▼
                                               ┌──────────────────┐
                                               │  AI Processing   │
                                               │  (Summarization) │
                                               └──────────────────┘
                                                        │
                                               ┌────────┴────────┐
                                               ▼                 ▼
                                      ┌──────────────┐  ┌──────────────┐
                                      │  SOC Analyst  │  │  Dashboard   │
                                      │  (Human-in-   │  │  (Planned)   │
                                      │   the-Loop)   │  │              │
                                      └──────────────┘  └──────────────┘
```

### Component Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                     SOC Automation Pipeline                  │
├─────────────┬───────────────┬───────────────┬───────────────┤
│  Log Source  │   SIEM Core   │  Automation   │   Output      │
├─────────────┼───────────────┼───────────────┼───────────────┤
│ Wazuh Agent │ Wazuh Manager │ N8N Workflows │ AI Summaries  │
│             │ Wazuh Indexer │ Webhooks      │ SOC Alerts    │
│             │ Wazuh Dashbd  │ Python Relay  │ Dashboard     │
└─────────────┴───────────────┴───────────────┴───────────────┘
```

## 📁 Project Structure

```
soc-automation/
├── scripts/
│   └── webhook_relay.py          # Python script to pipe Wazuh logs to N8N webhook
├── n8n/
│   └── workflows/
│       └── soc_workflow.json     # N8N workflow configuration
├── wazuh/
│   ├── agent/
│   │   └── ossec.conf            # Wazuh agent configuration
│   └── manager/
│       └── ossec.conf            # Wazuh manager configuration
├── docs/
│   └── setup_guide.md            # Detailed setup documentation
└── README.md                     # Project documentation
```

## 🛠️ Installation & Setup

### Prerequisites
- Microsoft Azure account with active subscription
- Two Ubuntu Server VMs (20.04 LTS or higher)
- Azure Virtual Network configured with a single subnet
- N8N instance (self-hosted or cloud)
- Python 3.8+ installed on the Wazuh Manager VM

### Azure Infrastructure Setup

1. **Create a Virtual Network:**
   ```bash
   # Create resource group
   az group create --name SOC-RG --location eastus

   # Create virtual network with subnet
   az network vnet create \
     --resource-group SOC-RG \
     --name SOC-VNet \
     --address-prefix 10.0.0.0/16 \
     --subnet-name SOC-Subnet \
     --subnet-prefix 10.0.1.0/24
   ```

2. **Provision Ubuntu VMs:**
   ```bash
   # VM 1 - Wazuh Agent
   az vm create \
     --resource-group SOC-RG \
     --name Wazuh-Agent-VM \
     --image Ubuntu2204 \
     --vnet-name SOC-VNet \
     --subnet SOC-Subnet \
     --admin-username azureuser \
     --generate-ssh-keys

   # VM 2 - Wazuh Manager/Indexer/Dashboard
   az vm create \
     --resource-group SOC-RG \
     --name Wazuh-Manager-VM \
     --image Ubuntu2204 \
     --vnet-name SOC-VNet \
     --subnet SOC-Subnet \
     --admin-username azureuser \
     --generate-ssh-keys
   ```

### Wazuh Manager Setup (VM 2)

1. **Install Wazuh Manager, Indexer & Dashboard:**
   ```bash
   # Download and run the Wazuh installation assistant
   curl -sO https://packages.wazuh.com/4.9/wazuh-install.sh
   sudo bash wazuh-install.sh --all-in-one
   ```

2. **Verify services are running:**
   ```bash
   sudo systemctl status wazuh-manager
   sudo systemctl status wazuh-indexer
   sudo systemctl status wazuh-dashboard
   ```

### Wazuh Agent Setup (VM 1)

1. **Install the Wazuh Agent:**
   ```bash
   # Add Wazuh repository and install agent
   curl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | gpg --no-default-keyring --keyring gnupg-ring:/usr/share/keyrings/wazuh.gpg --import && chmod 644 /usr/share/keyrings/wazuh.gpg

   # Install agent (replace MANAGER_IP with VM 2's private IP)
   WAZUH_MANAGER="MANAGER_IP" apt-get install wazuh-agent
   ```

2. **Start and enable the agent:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable wazuh-agent
   sudo systemctl start wazuh-agent
   ```

### Python Webhook Relay Setup

1. **Install Python dependencies on VM 2:**
   ```bash
   pip install requests
   ```

2. **Configure the webhook relay script:**
   ```bash
   # Update the N8N webhook URL in the script
   nano scripts/webhook_relay.py
   ```

3. **Run the relay script:**
   ```bash
   # Start the real-time log forwarding to N8N
   python3 scripts/webhook_relay.py
   ```

### N8N Workflow Setup

1. **Create a new N8N workflow**
2. **Add a Webhook trigger node** — this receives logs from the Python relay script
3. **Configure AI processing nodes** — for log summarization and knowledge extraction
4. **Add notification nodes** — to alert SOC analysts (Human-in-the-Loop)
5. **Activate the workflow**

## 🔧 Configuration

### Wazuh Agent Configuration
```xml
<!-- /var/ossec/etc/ossec.conf on VM 1 -->
<ossec_config>
  <client>
    <server>
      <address>MANAGER_PRIVATE_IP</address>
      <port>1514</port>
      <protocol>tcp</protocol>
    </server>
  </client>
</ossec_config>
```

### Webhook Relay Configuration
```python
# Key configuration parameters
WAZUH_LOG_PATH = "/var/ossec/logs/alerts/alerts.json"
N8N_WEBHOOK_URL = "https://your-n8n-instance.com/webhook/your-webhook-id"
POLL_INTERVAL = 1  # seconds
```

### Environment Variables
```env
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
WAZUH_MANAGER_IP=10.0.1.x
WAZUH_API_USER=wazuh-admin
WAZUH_API_PASSWORD=your_secure_password
```

## 📊 Features Deep Dive

### Log Processing Pipeline
- **Collection**: Wazuh Agent collects system and security logs from VM 1
- **Forwarding**: Logs are sent to the Wazuh Manager on VM 2 via the agent-manager protocol
- **Relay**: Python script reads real-time alerts and pipes them to N8N via webhook
- **Processing**: N8N workflow processes, enriches, and analyzes the log data with AI

### AI-Powered Analysis
1. **Log Summarization**:
   - Raw log events are summarized into human-readable intelligence
   - Key fields such as source IP, event type, and severity are extracted
   - Contextual information is added to help analysts understand the threat

2. **Knowledge Extraction**:
   - Patterns and trends are identified across multiple log events
   - Threat indicators are correlated for comprehensive analysis
   - Actionable recommendations are generated for SOC analysts

### Human-in-the-Loop
- **Alert Notifications**: SOC analysts receive real-time alerts for critical events
- **Event Review**: Analysts can review AI-generated summaries and take action
- **Feedback Loop**: Analyst decisions help improve future alert processing

### Planned Features
- **Incident Dashboard**: Visual overview of security incidents by priority
- **High-Priority Log Tracking**: Dedicated view for critical security events
- **Trend Analysis**: Historical analysis of security patterns
- **Automated Response**: Predefined response actions for known threat patterns

## 🔐 Security Considerations

- **Network Isolation**: Both VMs operate within a single Azure VNet and subnet
- **Encrypted Communication**: Agent-to-manager communication uses secure protocols
- **Access Control**: Azure NSGs restrict inbound/outbound traffic
- **Credential Management**: Sensitive credentials stored as environment variables
- **API Security**: Wazuh API access secured with authentication tokens

## 📈 Performance & Scalability

- **Real-time Processing**: Sub-second log forwarding via Python webhook relay
- **Scalable Architecture**: Additional Wazuh agents can be added to the same VNet
- **Efficient Log Handling**: Streaming approach avoids log file bottlenecks
- **N8N Workflow Optimization**: Parallel processing support for high log volumes

## 🧪 Testing & Validation

### Testing Commands
```bash
# Verify Wazuh Agent connectivity
sudo /var/ossec/bin/agent_control -l

# Check log forwarding
tail -f /var/ossec/logs/alerts/alerts.json

# Test webhook relay
python3 scripts/webhook_relay.py --test

# Verify N8N webhook endpoint
curl -X POST https://your-n8n-instance.com/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"test": "connection"}'
```

### Validation Checklist
- [ ] Wazuh Agent registered with Manager
- [ ] Logs appearing in Wazuh Dashboard
- [ ] Python relay script running without errors
- [ ] N8N webhook receiving log data
- [ ] AI summarization generating valid output
- [ ] SOC analyst notifications working

## 🐛 Troubleshooting

### Common Issues

1. **Agent Not Connecting to Manager**
   - Verify both VMs are in the same VNet and subnet
   - Check Azure NSG rules allow port 1514 (TCP)
   - Confirm the manager IP in agent's `ossec.conf`

2. **Webhook Relay Not Sending Logs**
   - Verify the N8N webhook URL is correct and active
   - Check Python script permissions to read Wazuh alert files
   - Ensure `requests` library is installed

3. **N8N Workflow Not Triggering**
   - Confirm the workflow is activated in N8N
   - Verify the webhook node URL matches the relay script configuration
   - Check N8N execution logs for errors

4. **AI Summarization Issues**
   - Verify the AI model node is properly configured in N8N
   - Check API keys and rate limits for the AI service
   - Review log format compatibility with the AI processing node

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-detection-rule`)
3. Make your changes
4. Test thoroughly in a staging environment
5. Submit a pull request

### Development Guidelines
- Follow Python best practices and PEP 8 standards
- Document all Wazuh configuration changes
- Test webhook relay scripts before deploying
- Add comments for complex N8N workflow logic

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check existing documentation
- Review the troubleshooting guide

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Wazuh team for the powerful open-source SIEM platform
- N8N for the flexible workflow automation engine
- Microsoft Azure for reliable cloud infrastructure
- The open-source cybersecurity community for continuous inspiration

---

Built with 🛡️ using Wazuh, N8N, Python, and Microsoft Azure
